import pandas as pd
import joblib, json
from sklearn.ensemble import RandomForestClassifier, IsolationForest

# Assuming creditcard.csv is in root
data = pd.read_csv('creditcard.csv')
X = data.drop(['Class'], axis=1)
y = data['Class']

# Save Metadata
joblib.dump(X.mean().tolist(), 'models/column_means.json')

# Train Ensemble
rf = RandomForestClassifier(n_estimators=50).fit(X, y)
iso = IsolationForest(contamination=0.01).fit(X)

joblib.dump(rf, 'models/random_forest_model.pkl')
joblib.dump(iso, 'models/isolation_forest_model.pkl')
joblib.dump(0.5, 'models/threshold.pkl')
print("NeuralGuard Models Ready.")