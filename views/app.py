from flask import Flask, request, jsonify
from pymongo import MongoClient
import joblib, json
from datetime import datetime

app = Flask(__name__)

# Load Models & Thresholds
rf_model = joblib.load("models/random_forest_model.pkl")
iso_model = joblib.load("models/isolation_forest_model.pkl")
threshold = joblib.load("models/threshold.pkl")
with open("models/column_means.json") as f:
    column_means = json.load(f)

# MongoDB Setup
client = MongoClient("mongodb://localhost:27017/")
db = client["fraud_detection"]
predictions_col = db["predictions"]

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    features = column_means.copy()
    features[13] = float(data.get('v14', 0)) # High impact feature
    features[29] = float(data.get('amount', 0))

    proba_rf = rf_model.predict_proba([features])[0][1]
    iso_anomaly = iso_model.predict([features])[0]
    
    # Ensemble Logic
    is_fraud = 1 if (proba_rf > 0.005 or features[29] > 50000) else 0

    record = {
        "timestamp": datetime.utcnow(),
        "amount": features[29],
        "is_fraud": is_fraud,
        "riskScore": round(float(proba_rf * 100), 1),
        "method": "Anomaly" if iso_anomaly == -1 else "Predictive"
    }
    predictions_col.insert_one(record)
    return jsonify({"is_fraud": is_fraud, "label": "FRAUD" if is_fraud else "NORMAL"})

@app.route('/api/stats')
def stats():
    total = predictions_col.count_documents({})
    frauds = predictions_col.count_documents({"is_fraud": 1})
    risk = round((frauds / total * 100), 1) if total > 0 else 0
    return jsonify({"totalPredictions": total, "fraudsDetected": frauds, "globalRiskScore": risk})

@app.route('/history')
def history():
    records = list(predictions_col.find().sort("timestamp", -1).limit(50))
    for r in records: r["_id"] = str(r["_id"])
    return jsonify(records)

if __name__ == '__main__':
    app.run(debug=True, port=5001)