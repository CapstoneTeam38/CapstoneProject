from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np

app = Flask(__name__)

# -----------------------------
# Load Trained Models
# -----------------------------

rf_model = joblib.load("models/random_forest_model.pkl")
iso_model = joblib.load("models/isolation_forest_model.pkl")

# -----------------------------
# Prediction Endpoint
# -----------------------------

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        # Construct input features
        input_data = {
            "distance_from_home": data.get("distance_from_home", 10.0),
            "distance_from_last_transaction": data.get("distance_from_last_transaction", 1.0),
            "ratio_to_median_purchase_price": data.get("amount", 50.0) / 100,
            "repeat_retailer": data.get("repeat_retailer", 1),
            "used_chip": data.get("used_chip", 1),
            "used_pin_number": data.get("used_pin_number", 1),
            "online_order": data.get("online_order", 1)
        }

        df = pd.DataFrame([input_data])

        # -----------------------------
        # Model Predictions
        # -----------------------------

        rf_probability = rf_model.predict_proba(df)[0][1]
        iso_prediction = iso_model.predict(df)[0]  # -1 = anomaly

        # -----------------------------
        # Hybrid Fraud Decision
        # -----------------------------

        if (
            data.get("amount", 0) > 5000 or
            data.get("distance_from_home", 0) > 250
        ):
            is_fraud = True
            risk_score = 95

        else:
            if rf_probability > 0.60 or iso_prediction == -1:
                is_fraud = True
            else:
                is_fraud = False

            risk_score = int(rf_probability * 100)

        return jsonify({
            "is_fraud": bool(is_fraud),
            "riskScore": risk_score,
            "rf_confidence": round(rf_probability, 3),
            "anomaly_flag": int(iso_prediction)
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400


# -----------------------------
# Run Server
# -----------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)