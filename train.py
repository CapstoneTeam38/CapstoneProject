import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.model_selection import train_test_split

# Generate synthetic dataset
np.random.seed(42)

data_size = 2000

df = pd.DataFrame({
    "distance_from_home": np.random.uniform(1, 100, data_size),
    "distance_from_last_transaction": np.random.uniform(0, 50, data_size),
    "ratio_to_median_purchase_price": np.random.uniform(0.1, 5, data_size),
    "repeat_retailer": np.random.randint(0, 2, data_size),
    "used_chip": np.random.randint(0, 2, data_size),
    "used_pin_number": np.random.randint(0, 2, data_size),
    "online_order": np.random.randint(0, 2, data_size),
})

# Create synthetic fraud labels
df["Class"] = (
    (df["distance_from_home"] > 80) |
    (df["ratio_to_median_purchase_price"] > 4)
).astype(int)

X = df.drop("Class", axis=1)
y = df["Class"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train Random Forest
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
rf_model.fit(X_train, y_train)

# Train Isolation Forest
iso_model = IsolationForest(contamination=0.02, random_state=42)
iso_model.fit(X_train)

# Save models
joblib.dump(rf_model, "models/random_forest_model.pkl")
joblib.dump(iso_model, "models/isolation_forest_model.pkl")

print("Synthetic models trained and saved successfully.")