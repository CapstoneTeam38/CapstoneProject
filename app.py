from flask import Flask, request, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
import joblib
import numpy as np
import json
import os
from datetime import datetime

load_dotenv()

app = Flask(__name__)

# Load models
rf_model = joblib.load("models/random_forest_model.pkl")
threshold = joblib.load("models/threshold.pkl")

# Load column means for auto-filling missing features
with open("models/column_means.json") as f:
    column_means = json.load(f)

# MongoDB
client = MongoClient(os.getenv("MONGO_URI"))
db = client["fraud_platform"]
predictions_col = db["predictions"]

@app.route('/')
def home():
    return jsonify({"status": "Fraud Detection API is running", "port": 5001})

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    
    # Start with dataset averages for all 30 features
    features = column_means.copy()
    
    # Override with user provided values
    features[0] = float(data.get('time', column_means[0]))      # Time
    features[29] = float(data.get('amount', column_means[29]))  # Amount
    features[13] = float(data.get('v14', column_means[13]))     # V14 (most important)

    proba = rf_model.predict_proba([features])[0][1]
    is_fraud = int(proba >= threshold)

    predictions_col.insert_one({
        "timestamp": datetime.utcnow(),
        "amount": features[29],
        "time": features[0],
        "fraud_probability": round(float(proba), 4),
        "is_fraud": is_fraud
    })

    return jsonify({
        "fraud_probability": round(float(proba), 4),
        "is_fraud": is_fraud,
        "label": "FRAUD" if is_fraud else "LEGITIMATE"
    })

@app.route('/history')
def history():
    records = list(predictions_col.find({}, {"_id": 0}).sort("timestamp", -1).limit(50))
    return jsonify(records)

@app.route('/api/stats')
def stats():
    total = predictions_col.count_documents({})
    frauds = predictions_col.count_documents({"is_fraud": 1})
    risk = round((frauds / total * 100), 1) if total > 0 else 0
    return jsonify({
        "totalPredictions": total,
        "fraudsDetected": frauds,
        "globalRiskScore": risk
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001)