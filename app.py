from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np

app = Flask(__name__)

rf_model = joblib.load("models/random_forest_model.pkl")
iso_model = joblib.load("models/isolation_forest_model.pkl")

FRAUD_THRESHOLD = 0.45

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        input_data = {
            "distance_from_home": data.get("distance_from_home", 10.0),
            "distance_from_last_transaction": data.get("distance_from_last_transaction", 1.0),
            "ratio_to_median_purchase_price": min(data.get("amount", 50.0) / 200, 10.0),  # Fixed scaling
            "repeat_retailer": data.get("repeat_retailer", 1),
            "used_chip": data.get("used_chip", 1),
            "used_pin_number": data.get("used_pin_number", 1),
            "online_order": data.get("online_order", 0)
        }

        df = pd.DataFrame([input_data])

        # Random Forest probability
        rf_proba = rf_model.predict_proba(df)[0][1]

        # Isolation Forest score
        iso_score = iso_model.decision_function(df)[0]
        iso_normalized = 1 - (iso_score + 0.5)
        iso_normalized = max(0, min(1, iso_normalized))

        # Ensemble score
        final_proba = (0.7 * rf_proba) + (0.3 * iso_normalized)

        is_fraud = final_proba >= FRAUD_THRESHOLD
        final_risk_percent = round(final_proba * 100, 2)

        print(f"RF: {rf_proba:.2f} | ISO: {iso_normalized:.2f} | Final: {final_proba:.2f} | Fraud: {is_fraud}")

        return jsonify({
            "isFraud": bool(is_fraud),
            "riskScore": final_risk_percent
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    print("Starting Flask ML server...")
    app.run(host="0.0.0.0", port=5001, debug=True)