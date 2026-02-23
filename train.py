import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.model_selection import train_test_split

# Reproducibility
np.random.seed(42)

# -----------------------------
# Generate Synthetic Fraud Data
# -----------------------------

n_samples = 5000

data = pd.DataFrame({
    "distance_from_home": np.random.uniform(0, 300, n_samples),
    "distance_from_last_transaction": np.random.uniform(0, 50, n_samples),
    "ratio_to_median_purchase_price": np.random.uniform(0, 10, n_samples),
    "repeat_retailer": np.random.randint(0, 2, n_samples),
    "used_chip": np.random.randint(0, 2, n_samples),
    "used_pin_number": np.random.randint(0, 2, n_samples),
    "online_order": np.random.randint(0, 2, n_samples)
})

# Fraud labeling rule (synthetic logic)
data["fraud"] = (
    (data["distance_from_home"] > 200) |
    (data["ratio_to_median_purchase_price"] > 5) |
    (data["online_order"] == 1) & (data["used_pin_number"] == 0)
).astype(int)

# -----------------------------
# Split Data
# -----------------------------

X = data.drop("fraud", axis=1)
y = data["fraud"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -----------------------------
# Train Random Forest
# -----------------------------

rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
rf_model.fit(X_train, y_train)

# -----------------------------
# Train Isolation Forest
# -----------------------------

iso_model = IsolationForest(contamination=0.1, random_state=42)
iso_model.fit(X_train)

# -----------------------------
# Save Models
# -----------------------------

joblib.dump(rf_model, "models/random_forest_model.pkl")
joblib.dump(iso_model, "models/isolation_forest_model.pkl")

print("✅ Models trained and saved successfully.")