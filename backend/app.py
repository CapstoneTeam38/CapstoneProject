import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import joblib
import numpy as np
import json
import os
from datetime import datetime, timezone
from bson import ObjectId

load_dotenv()

app = Flask(__name__)
CORS(app)

# ── Models ─────────────────────────────────────────────────────────
model = joblib.load("backend/models/xgb_model_v2.pkl")
ocsvm_model = joblib.load("backend/models/ocsvm_model.pkl")

with open("ml-models/top_features.json") as f:
    top_features = json.load(f)

with open("ml-models/threshold.json") as f:
    threshold = json.load(f)["threshold"]

# ── MongoDB ────────────────────────────────────────────────────────
# ── MongoDB ────────────────────────────────────────────────────────
MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("MONGO_URI not found in .env")

client = MongoClient(MONGO_URI)
db = client["fraud_platform"]

predictions_col = db["predictions"]
transactions_col = db["transactions"]


## ════════════════════════════════════════════════════════════════════
# Debugging route to check DB connection
# ════════════════════════════════════════════════════════════════════
@app.route("/test-db")
def test_db():
    try:
        count = transactions_col.count_documents({})
        return {"status": "connected", "count": count}
    except Exception as e:
        return {"error": str(e)}
# ════════════════════════════════════════════════════════════════════
# BASIC
# ════════════════════════════════════════════════════════════════════

@app.route("/")
def home():
    return jsonify({"status": "API running", "port": 5001})


# ════════════════════════════════════════════════════════════════════
# PREDICT
# ════════════════════════════════════════════════════════════════════

@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        data = request.json

        df = pd.DataFrame([data])

        for col in top_features:
            if col not in df:
                df[col] = 0

        df = df[top_features]

        prob = model.predict_proba(df)[0][1]
        is_fraud = int(prob >= threshold)
        # OCSVM
        iso_score = ocsvm_model.decision_function(df)[0]
        is_anomaly = int(ocsvm_model.predict(df)[0] == -1)

        doc = {
            "timestamp": datetime.now(timezone.utc),
            "fraud_probability": float(prob),
            "is_fraud": is_fraud
        }

       # predictions_col.insert_one(doc)

        return jsonify({
            "fraud_probability": float(prob),
            "is_fraud": is_fraud,
            "is_anomaly": is_anomaly,
            "iso_score": float(iso_score),
            "label": "FRAUD" if is_fraud else "LEGITIMATE"
        })

    except Exception as e:
        return jsonify({"error": str(e)})

# ════════════════════════════════════════════════════════════════════
# HISTORY
# ════════════════════════════════════════════════════════════════════

@app.route("/api/history")
def history():
    preds = list(predictions_col.find({}, {"_id": 0})
                 .sort("timestamp", -1).limit(25))

    fraud_rows = list(transactions_col.find(
        {"is_fraud": 1}, {"_id": 0}
    ).sort("Amount", -1).limit(10))

    legit_rows = list(transactions_col.find(
        {"is_fraud": 0}, {"_id": 0}
    ).sort("Time", -1).limit(15))

    for row in fraud_rows + legit_rows:
        row["amount"] = float(row.get("Amount", 0))
        row["fraud_probability"] = 0.95 if row.get("is_fraud") == 1 else 0.02

    return jsonify((preds + fraud_rows + legit_rows)[:50])


# ════════════════════════════════════════════════════════════════════
# ALERTS (NEW)
# ════════════════════════════════════════════════════════════════════

@app.route("/api/alerts")
def alerts():
    alerts = list(
        transactions_col.find(
            {"is_fraud": 1},
            {"_id": 0, "Amount": 1, "Time": 1}
        ).sort("Amount", -1).limit(20)
    )

    for a in alerts:
        a["amount"] = float(a.get("Amount", 0))
        a["time"] = a.get("Time", 0)

    return jsonify(alerts)


# ════════════════════════════════════════════════════════════════════
# TRANSACTIONS (FIXED NAME)
# ════════════════════════════════════════════════════════════════════

@app.route("/api/transactions")
def transactions():
    page  = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 100))
    fltr  = request.args.get("filter", "all")

    skip = (page - 1) * limit

    query = {}
    if fltr == "fraud":
        query = {"is_fraud": 1}
    elif fltr == "legit":
        query = {"is_fraud": 0}

    total = transactions_col.count_documents(query)

    rows = list(transactions_col.find(
        query,
        {"_id": 0}
    ).sort("Time", -1).skip(skip).limit(limit))

    return jsonify({
        "transactions": rows,
        "total": total,
        "page": page,
        "totalPages": (total + limit - 1) // limit
    })


# ════════════════════════════════════════════════════════════════════
# STATS
# ════════════════════════════════════════════════════════════════════

@app.route("/api/stats")
def stats():
    total = transactions_col.count_documents({})
    frauds = transactions_col.count_documents({"is_fraud": 1})

    return jsonify({
        "totalTransactions": total,
        "fraudsDetected": frauds,
        "legitimateCount": total - frauds,
        "globalRiskScore": round((frauds / total) * 100, 2) if total else 0
    })


# ════════════════════════════════════════════════════════════════════
# ANALYTICS
# ════════════════════════════════════════════════════════════════════

@app.route("/api/analytics")
def analytics():
    fraud_count = transactions_col.count_documents({"is_fraud": 1})
    legit_count = transactions_col.count_documents({"is_fraud": 0})

    return jsonify({
        "fraudCount": fraud_count,
        "legitCount": legit_count,
        "total": fraud_count + legit_count,
        "fraudRate": round((fraud_count / (fraud_count + legit_count)) * 100, 2)
    })


# ════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    app.run(debug=True, port=5001)