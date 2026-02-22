import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import joblib
import json

print("Loading dataset...")
df = pd.read_csv('data/creditcard.csv')
df = df.dropna(subset=['Class'])

print(f"Dataset shape: {df.shape}")
print(f"Fraud cases: {df['Class'].value_counts()[1.0]}")

X = df.drop('Class', axis=1)
y = df['Class']

# Save column means for simplified prediction later
column_means = X.mean().tolist()
with open('models/column_means.json', 'w') as f:
    json.dump(column_means, f)
print("Column means saved.")

# Train test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Random Forest
print("\nTraining Random Forest...")
rf_model = RandomForestClassifier(
    n_estimators=100,
    class_weight='balanced',
    random_state=42
)
rf_model.fit(X_train, y_train)

y_pred = rf_model.predict(X_test)
print("Random Forest Results:")
print(confusion_matrix(y_test, y_pred))
print(classification_report(y_test, y_pred))
print("ROC-AUC:", roc_auc_score(y_test, rf_model.predict_proba(X_test)[:,1]))

# Threshold tuning
probs = rf_model.predict_proba(X_test)[:,1]
threshold = 0.35
y_pred_tuned = (probs >= threshold).astype(int)
print("\nTuned Threshold Results:")
print(confusion_matrix(y_test, y_pred_tuned))
print(classification_report(y_test, y_pred_tuned))

# Cross validation
print("\nRunning Cross Validation...")
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(rf_model, X, y, cv=cv, scoring='roc_auc', n_jobs=-1)
print(f"CV ROC-AUC: {scores.mean():.4f} ± {scores.std():.4f}")

# Isolation Forest
print("\nTraining Isolation Forest...")
normal_data = X_train[y_train == 0]
iso_model = IsolationForest(
    contamination=0.0017,
    n_estimators=200,
    random_state=42
)
iso_model.fit(normal_data)

# Save everything
joblib.dump(rf_model, 'models/random_forest_model.pkl')
joblib.dump(iso_model, 'models/isolation_forest_model.pkl')
joblib.dump(threshold, 'models/threshold.pkl')

print("\nAll models saved to models/ folder.")
print("Training complete.")
