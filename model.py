import pandas as pd
from pymongo import MongoClient
from sklearn.ensemble import IsolationForest

# 1. Setup Connection
client = MongoClient('mongodb://localhost:27017/')

# --- THE CRITICAL FIX: Use the lowercase database name ---
db = client['fraud_detection'] 


collection = db['transactions']

# 2. Verify Data
count = collection.count_documents({})
print(f"Connection Success! Found {count} documents in fraud_detection.transactions.")

if count == 0:
    print("Check Compass: Are you sure the data is in 'fraud_detection' -> 'transactions'?")
    exit()

# 3. Pull Data for AI
print("Fetching data for analysis...")
cursor = collection.find({}, {"_id": 1, "V7": 1, "V8": 1, "V9": 1, "Amount": 1})
df = pd.DataFrame(list(cursor))

# 4. Prepare Features (Match capital 'A' in Amount)
features = df[['V7', 'V8', 'V9', 'Amount']].fillna(0)

# 5. Run AI
print("AI is analyzing transaction patterns...")
model = IsolationForest(contamination=0.01, random_state=42)
df['prediction'] = model.fit_predict(features)
df['isFraud'] = df['prediction'].apply(lambda x: True if x == -1 else False)

# 6. Update MongoDB
print(f"Updating {len(df)} documents...")
for _, row in df.iterrows():
    collection.update_one(
        {'_id': row['_id']},
        {'$set': {
            'isFraud': bool(row['isFraud']),
            'riskScore': 85.0 
        }}
    )

print("AI Analysis Complete! Refresh your dashboard.")

##devops