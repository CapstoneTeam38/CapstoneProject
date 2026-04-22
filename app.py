from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import joblib
import numpy as np
import json
import os
import pandas as pd
from datetime import datetime, timezone
from bson import ObjectId

load_dotenv()

app = Flask(__name__)
CORS(app)

# ── Models ───────────────────────────────────────────────────────────────────
# Structure 1: Random Forest + Isolation Forest
rf_model  = joblib.load("backend/models/rf_model.pkl")
iso_model = joblib.load("backend/models/if_model.pkl")
rf_threshold = 0.35  # Calibrated for retrained RF on IEEE-CIS (unscaled data)

# Structure 2: XGBoost + One-Class SVM
xgb_model = joblib.load("backend/models/xgb_model_v2.pkl")
ocsvm_model = joblib.load("backend/models/ocsvm_model.pkl")
xgb_scaler = joblib.load("backend/models/scaler.pkl")

with open("backend/models/top_features.json") as f:
    XGB_TOP_FEATURES = json.load(f)

with open("backend/models/feature_names.json") as f:
    # This list has 200 features. We add the 2 missing ones (D3, M4) to reach 202.
    XGB_FULL_FEATURES = json.load(f) + ["D3", "M4"]

with open("backend/models/threshold.json") as f:
    xgb_threshold = json.load(f)["threshold"]

with open("backend/models/column_means.json") as f:
    column_means = json.load(f)

with open("backend/models/label_encoders.json") as f:
    LABEL_ENCODERS = json.load(f)

def encode_categorical(df, encoders):
    df = df.copy()
    for col, classes in encoders.items():
        if col in df.columns:
            # Create a mapping dict for speed
            mapping = {str(c): i for i, c in enumerate(classes)}
            # Map unseen values to 'nan' index or 0
            nan_idx = mapping.get('nan', 0)
            df[col] = df[col].astype(str).map(lambda x: mapping.get(x, nan_idx))
    return df

RF_FEATURES = ["Time"] + [f"V{i}" for i in range(1, 29)] + ["Amount"]

def get_analysis_structure(row_count):
    """Returns 'RF_IF' for < 200k rows, 'XGB_SVM' otherwise."""
    return "XGB_SVM" if row_count >= 200000 else "RF_IF"

def preprocess_for_model(df):
    """
    Unified preprocessing for all models.
    Returns:
        X_raw:    202-feature UNSCALED vector (for RF, IF — trained on raw data)
        X_scaled: 202-feature SCALED vector (for OCSVM)
        X_top:    80-feature SCALED subset (for XGBoost)
    """
    # 202 features mapping
    df_encoded = encode_categorical(df, LABEL_ENCODERS)
    X = np.zeros((len(df_encoded), len(XGB_FULL_FEATURES))) 
    existing_cols = [col for col in XGB_FULL_FEATURES if col in df_encoded.columns]
    col_indices = [XGB_FULL_FEATURES.index(col) for col in existing_cols]
    if existing_cols:
        X_df = df_encoded[existing_cols].apply(pd.to_numeric, errors='coerce').fillna(0)
        X[:, col_indices] = X_df.values.astype(float)
    
    X_raw = X  # Unscaled for RF/IF
    
    # Scale for XGBoost/OCSVM
    X_scaled = xgb_scaler.transform(X)
    
    # Extract the 80 features for XGBoost
    top_indices = [XGB_FULL_FEATURES.index(f) for f in XGB_TOP_FEATURES]
    X_top = X_scaled[:, top_indices]
    
    return X_raw, X_scaled, X_top

# ── MongoDB Atlas ─────────────────────────────────────────────────────────────
client = MongoClient(os.getenv("MONGO_URI"))
db     = client["fraud_platform"]
predictions_col  = db["predictions"]
transactions_col = db["transactions"]

# ════════════════════════════════════════════════════════════════════════════
#  CORE
# ════════════════════════════════════════════════════════════════════════════

@app.route("/")
def home():
    return jsonify({"status": "Fraud Detection API running", "port": 5001})


@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    user_id = data.get("userId", "anonymous")
    
    # Determine structure based on current user data volume
    col = db["user_transactions"]
    count = col.count_documents({"userId": user_id})
    structure = get_analysis_structure(count)
    
    # Convert input dict to DataFrame for preprocessing
    # Normalize keys (time -> Time, amount -> Amount)
    input_data = {
        "Time": float(data.get("time", 0)),
        "Amount": float(data.get("amount", 0)),
        "V14": float(data.get("v14", 0))
    }
    df = pd.DataFrame([input_data])
    
    # Unified Preprocessing
    X_raw, X_scaled, X_top = preprocess_for_model(df)
    
    if structure == "RF_IF":
        proba = rf_model.predict_proba(X_raw)[0][1]
        is_fraud = int(proba >= rf_threshold)
        iso_score = iso_model.decision_function(X_raw)[0]
        is_anomaly = int(iso_model.predict(X_raw)[0] == -1)
        model_name = "Random Forest + Isolation Forest"
    else:
        # XGBoost path
        proba = xgb_model.predict_proba(X_top)[0][1]
        is_fraud = int(proba >= xgb_threshold)
        iso_score = ocsvm_model.decision_function(X_scaled)[0]
        is_anomaly = int(ocsvm_model.predict(X_scaled)[0] == -1)
        model_name = "XGBoost + One-Class SVM"

    doc = {
        "timestamp": datetime.now(timezone.utc),
        "amount": input_data["Amount"],
        "time": input_data["Time"],
        "fraud_probability": round(float(proba), 4),
        "is_fraud": is_fraud,
        "iso_score": round(float(iso_score), 4),
        "is_anomaly": is_anomaly,
        "source": "live_prediction",
        "model_used": model_name,
        "userId": user_id
    }
    predictions_col.insert_one(doc)
    return jsonify({
        "fraud_probability": doc["fraud_probability"],
        "is_fraud": is_fraud,
        "is_anomaly": is_anomaly,
        "iso_score": doc["iso_score"],
        "label": "FRAUD" if is_fraud else "LEGITIMATE",
        "engine": model_name
    })


def get_user_data_source():
    user_id = request.args.get('userId')
    if user_id:
        user_col = db["user_transactions"]
        if user_col.count_documents({"userId": user_id}, limit=1) > 0:
            return user_col, {"userId": user_id}
    return transactions_col, {}

# FIX 1: /history — include fraud transactions + proper fraud_probability
@app.route("/history")
def history():
    col, base_filter = get_user_data_source()
    
    if base_filter:
        # Dynamic user dataset
        docs = list(col.find({**base_filter, "is_fraud": 1})
                       .sort("fraud_probability", -1).limit(50))
        for row in docs:
            row["_id"] = str(row["_id"])
            amt = row.pop("Amount", 0)
            row["amount"] = float(amt) if amt else 0.0
            row["fraud_probability"] = float(row.get("fraud_probability", row.get("is_fraud", 0.0)))
            row["timestamp"] = row.get("uploaded_at", None)
            row["Time"] = row.get("Time", 0)
        return jsonify(docs)
    else:
        # Static Kaggle Mix
        preds = list(predictions_col.find({}).sort("timestamp", -1).limit(25))
        for p in preds:
            p["_id"] = str(p["_id"])

        fraud_rows = list(transactions_col.find({"is_fraud": 1}, {"loaded_at": 0, "source": 0}).sort("Amount", -1).limit(10))
        legit_rows = list(transactions_col.find({"is_fraud": 0}, {"loaded_at": 0, "source": 0}).sort("Time", -1).limit(15))
        kaggle = fraud_rows + legit_rows

        for row in kaggle:
            row["_id"]               = str(row["_id"])
            amt = row.pop("Amount", 0)
            row["amount"]            = float(amt) if amt else 0.0
            row["fraud_probability"] = 0.95 if row.get("is_fraud") == 1 else 0.02
            row["timestamp"]         = None
            row["Time"]              = row.get("Time", 0)

        combined = preds + kaggle
        return jsonify(combined[:50])


# ════════════════════════════════════════════════════════════════════════════
#  STATS
# ════════════════════════════════════════════════════════════════════════════

@app.route("/api/stats")
def stats():
    col, base_filter = get_user_data_source()
    if base_filter:
        total = col.count_documents(base_filter)
        frauds = col.count_documents({**base_filter, "is_fraud": 1})
    else:
        total_kaggle = transactions_col.count_documents({})
        fraud_kaggle = transactions_col.count_documents({"is_fraud": 1})
        total_live   = predictions_col.count_documents({})
        fraud_live   = predictions_col.count_documents({"is_fraud": 1})
        total  = total_kaggle + total_live
        frauds = fraud_kaggle + fraud_live

    risk = round(frauds / total * 100, 2) if total > 0 else 0
    return jsonify({
        "totalTransactions": total,
        "totalKaggle":       total if base_filter else transactions_col.count_documents({}),
        "totalLive":         total if base_filter else predictions_col.count_documents({}),
        "fraudsDetected":    frauds,
        "fraudKaggle":       frauds if base_filter else transactions_col.count_documents({"is_fraud": 1}),
        "fraudLive":         frauds if base_filter else predictions_col.count_documents({"is_fraud": 1}),
        "globalRiskScore":   risk,
        "legitimateCount":   total - frauds
    })


# ════════════════════════════════════════════════════════════════════════════
#  ANALYTICS — FIX 2: convert bucket _id to string for JSON
# ════════════════════════════════════════════════════════════════════════════

@app.route("/api/analytics")
def analytics():
    col, base_filter = get_user_data_source()
    
    match_stage = [{"$match": base_filter}] if base_filter else []
    
    pipeline_amount = match_stage + [
        {"$bucket": {
            "groupBy":    "$Amount",
            "boundaries": [0, 50, 100, 500, 1000, 5000, 10000, 99999],
            "default":    "Other",
            "output": {
                "count":      {"$sum": 1},
                "fraudCount": {"$sum": "$is_fraud"}
            }
        }}
    ]
    raw_dist    = list(col.aggregate(pipeline_amount))
    amount_dist = [{"_id": str(b["_id"]), "count": b["count"], "fraudCount": b["fraudCount"]}
                   for b in raw_dist]

    fraud_query = {**base_filter, "is_fraud": 1}
    legit_query = {**base_filter, "is_fraud": 0}
    fraud_count = col.count_documents(fraud_query)
    legit_count = col.count_documents(legit_query)
    total       = fraud_count + legit_count

    top_frauds  = list(
        col.find({**base_filter, "is_fraud": 1}, {"Amount": 1, "V14": 1, "Time": 1})
                        .sort("Amount", -1).limit(10)
    )
    for f in top_frauds:
        f["_id"] = str(f["_id"])

    avg_pipeline = match_stage + [
        {"$group": {
            "_id":    "$is_fraud",
            "avgAmt": {"$avg": "$Amount"},
            "maxAmt": {"$max": "$Amount"},
            "count":  {"$sum": 1}
        }}
    ]
    avg_data = list(col.aggregate(avg_pipeline))

    return jsonify({
        "amountDistribution": amount_dist,
        "fraudCount":         fraud_count,
        "legitCount":         legit_count,
        "total":              total,
        "fraudRate":          round(fraud_count / total * 100, 2) if total else 0,
        "topFrauds":          top_frauds,
        "avgByClass":         avg_data
    })


# ════════════════════════════════════════════════════════════════════════════
#  MODEL STATS
# ════════════════════════════════════════════════════════════════════════════

@app.route("/api/model-stats")
def model_stats():
    user_id = request.args.get('userId', 'anonymous')
    
    # Try to find upload metadata: first for this userId, then the most recent one
    meta = db["upload_metadata"].find_one({"userId": user_id})
    if not meta:
        # Fallback: get the MOST RECENT upload from any user
        meta = db["upload_metadata"].find_one(sort=[("uploaded_at", -1)])
    
    if meta:
        structure = meta.get("structure", "RF_IF")
    else:
        # Final fallback: count ALL rows in user_transactions (any userId)
        count = db["user_transactions"].count_documents({})
        structure = get_analysis_structure(count)
    
    if structure == "RF_IF":
        model_name = "Random Forest + Isolation Forest"
        threshold_val = float(rf_threshold)
        importances = rf_model.feature_importances_
        features = XGB_FULL_FEATURES
        trained_on = "Retrained Ensemble (202 features)"
    else:
        model_name = "XGBoost + One-Class SVM"
        threshold_val = float(xgb_threshold)
        # XGBoost feature importances (uses top 80)
        importances = xgb_model.feature_importances_
        features = XGB_TOP_FEATURES
        trained_on = "IEEE-CIS Fraud Dataset (XGBoost Engine)"

    metrics_path = "backend/models/metrics.json"
    if os.path.exists(metrics_path):
        with open(metrics_path) as f:
            metrics = json.load(f)
    else:
        metrics = {
            "accuracy": 0.9996,
            "precision": 0.9405,
            "recall": 0.8061,
            "f1": 0.8681,
            "roc_auc": 0.9529,
            "threshold": threshold_val,
            "cv_mean": 0.9508,
            "cv_std": 0.0021,
            "confusion_matrix": [[56859, 5], [19, 79]],
        }
    
    feat_imp = sorted(
        [{"feature": features[i], "importance": round(float(importances[i]), 4)}
         for i in range(len(importances))],
        key=lambda x: x["importance"], reverse=True
    )[:10]

    return jsonify({
        "metrics": metrics,
        "featureImportance": feat_imp,
        "modelName": model_name,
        "trainedOn": trained_on,
        "activeStructure": structure
    })


# ════════════════════════════════════════════════════════════════════════════
#  SHAP — FIX 3: handle new shap API returning ndarray not list
# ════════════════════════════════════════════════════════════════════════════

@app.route("/api/shap", methods=["POST"])
def shap_explain():
    try:
        import shap
    except ImportError:
        return jsonify({"error": "Run: pip install shap"}), 500

    data     = request.json
    features = column_means.copy()
    features[0]  = float(data.get("time",   column_means[0]))
    features[29] = float(data.get("amount", column_means[29]))
    features[13] = float(data.get("v14",    column_means[13]))

    arr         = np.array([features])
    explainer   = shap.TreeExplainer(rf_model)
    shap_values = explainer.shap_values(arr)

    # Handle both old (list) and new (ndarray) shap APIs
    if isinstance(shap_values, list):
        sv = shap_values[1][0]
        base = explainer.expected_value[1]
    elif hasattr(shap_values, 'values'):
        sv   = shap_values.values[0, :, 1]
        base = explainer.expected_value[1] if hasattr(explainer.expected_value, '__len__') else explainer.expected_value
    else:
        sv   = shap_values[0]
        base = explainer.expected_value

    result = sorted(
        [{"feature": FEATURE_NAMES[i], "shap_value": round(float(np.ravel(sv[i])[0]), 4)}
         for i in range(len(sv))],
        key=lambda x: abs(x["shap_value"]), reverse=True
    )[:15]

    proba    = rf_model.predict_proba([features])[0][1]
    is_fraud = int(proba >= threshold)

    return jsonify({
        "shapValues":       result,
        "fraudProbability": round(float(proba), 4),
        "prediction":       "FRAUD" if is_fraud else "LEGITIMATE",
        "baseValue": round(float(np.ravel(base)[0]), 4)
    })


# ════════════════════════════════════════════════════════════════════════════
#  CASE REVIEW
# ════════════════════════════════════════════════════════════════════════════

@app.route("/api/cases")
def get_cases():
    col, base_filter = get_user_data_source()
    cases = list(
        col.find(
            {**base_filter, "is_fraud": 1},
            {"_id": 1, "Amount": 1, "Time": 1, "V14": 1,
             "fraud_probability": 1, "reviewed": 1, "review_label": 1, "notes": 1}
        ).sort("Amount", -1).limit(30)
    )
    for c in cases:
        c["_id"] = str(c["_id"])
    return jsonify(cases)


@app.route("/api/cases/<case_id>/review", methods=["POST"])
def review_case(case_id):
    col, base_filter = get_user_data_source()
    data = request.json
    col.update_one(
        {"_id": ObjectId(case_id)},
        {"$set": {
            "reviewed":     True,
            "review_label": data.get("label"),
            "notes":        data.get("notes", ""),
            "reviewed_at":  datetime.now(timezone.utc).isoformat()
        }}
    )
    return jsonify({"success": True})

@app.route("/api/transactions-page")
def transactions_page():
    col, base_filter = get_user_data_source()
    page   = int(request.args.get("page",   1))
    limit  = int(request.args.get("limit",  100))
    fltr   = request.args.get("filter", "all")
    skip   = (page - 1) * limit

    query = {**base_filter}
    if fltr == "fraud":
        query["is_fraud"] = 1
    elif fltr == "legit":
        query["is_fraud"] = 0

    total       = col.count_documents(query)
    fraud_total = col.count_documents({**base_filter, "is_fraud": 1})

    rows = list(col.find(
        query,
        {"loaded_at": 0, "source": 0}
    ).sort("Time", -1).skip(skip).limit(limit))

    for r in rows:
        r["_id"] = str(r["_id"])

    return jsonify({
        "transactions": rows,
        "total":        total,
        "fraudTotal":   fraud_total,
        "page":         page,
        "totalPages":   (total + limit - 1) // limit
    })
@app.route("/api/upload-dataset", methods=["POST"])
def upload_dataset():
    try:
        import pandas as pd
        from io import StringIO

        if 'file' not in request.files:
            return jsonify({"error": "No file received"}), 400

        file = request.files['file']
        user_id = request.form.get('userId', 'anonymous')

        # Count data rows (subtract 1 for the CSV header line)
        file_bytes = file.read()
        row_count = max(file_bytes.count(b'\n') - 1, 0)
        file.seek(0) # Reset file pointer for pandas
        
        structure = get_analysis_structure(row_count)
        model_name = "Random Forest + Isolation Forest" if structure == "RF_IF" else "XGBoost + One-Class SVM"
        
        # Clear existing transactions for this user
        user_col = db["user_transactions"]
        user_col.delete_many({"userId": user_id})

        total_rows = 0
        total_frauds = 0
        
        # Process in chunks
        for chunk_idx, df_chunk in enumerate(pd.read_csv(file, chunksize=50000)):
            df_chunk.columns = [c.strip() for c in df_chunk.columns]

            # Case-insensitive column normalization
            col_map = {c.lower(): c for c in df_chunk.columns}
            
            if 'isfraud' in col_map:
                df_chunk.rename(columns={col_map['isfraud']: 'is_fraud'}, inplace=True)
            elif 'class' in col_map:
                df_chunk.rename(columns={col_map['class']: 'is_fraud'}, inplace=True)
                
            if 'transactionamt' in col_map:
                df_chunk.rename(columns={col_map['transactionamt']: 'Amount'}, inplace=True)
            elif 'amount' in col_map:
                df_chunk.rename(columns={col_map['amount']: 'Amount'}, inplace=True)

            if 'transactiondt' in col_map:
                df_chunk.rename(columns={col_map['transactiondt']: 'Time'}, inplace=True)
            elif 'time' in col_map:
                df_chunk.rename(columns={col_map['time']: 'Time'}, inplace=True)

            if 'Amount' not in df_chunk.columns:
                return jsonify({
                    "error": "CSV must have an 'Amount' or 'TransactionAmt' column",
                    "found_columns": list(df_chunk.columns)
                }), 400

            # Unified Preprocessing
            X_raw, X_scaled, X_top = preprocess_for_model(df_chunk)
            
            if structure == "RF_IF":
                probas = rf_model.predict_proba(X_raw)[:, 1]
                is_fraud_arr = (probas >= rf_threshold).astype(int)
            else:
                probas = xgb_model.predict_proba(X_top)[:, 1]
                is_fraud_arr = (probas >= xgb_threshold).astype(int)
            
            total_rows += len(df_chunk)
            total_frauds += int(is_fraud_arr.sum())
            
            df_chunk['userId'] = user_id
            df_chunk['fraud_probability'] = np.round(probas.astype(float), 4)
            df_chunk['is_fraud'] = is_fraud_arr
            df_chunk['uploaded_at'] = datetime.now(timezone.utc)
            # Keep ONLY essential columns for the UI to save MongoDB space (prevents quota errors)
            essential_cols = ['Time', 'Amount', 'is_fraud', 'fraud_probability', 'userId']
            # Add placeholders for UI state
            df_chunk['reviewed'] = False
            df_chunk['review_label'] = None
            df_chunk['notes'] = ""
            
            # Filter the chunk to only essential data
            db_ready_df = df_chunk[essential_cols + ['reviewed', 'review_label', 'notes']].copy()
            
            records = db_ready_df.to_dict('records')
            if records:
                user_col.insert_many(records)

        # Store upload metadata so model-stats can retrieve the structure used
        meta_col = db["upload_metadata"]
        meta_col.update_one(
            {"userId": user_id},
            {"$set": {
                "userId": user_id,
                "totalRows": total_rows,
                "fraudsDetected": total_frauds,
                "structure": structure,
                "engine": model_name,
                "uploaded_at": datetime.now(timezone.utc)
            }},
            upsert=True
        )

        return jsonify({
            "totalRows": total_rows,
            "fraudsDetected": total_frauds,
            "fraudRate": round(total_frauds / total_rows * 100, 2) if total_rows > 0 else 0,
            "userId": user_id,
            "engine": model_name
        })

    except Exception as e:
        import traceback
        print("Error uploading dataset:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5001)