import joblib

rf_model = joblib.load("models/random_forest_model.pkl")
iso_model = joblib.load("models/isolation_forest_model.pkl")

print("✅ Models loaded successfully.")