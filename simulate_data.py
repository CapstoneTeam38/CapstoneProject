import requests
import random
import time
from datetime import datetime

URL = "http://localhost:5000/api/webhook"

FRAUD_RATE = 0.08  # 8% realistic fraud rate

def generate_transaction(force_fraud=False):
    if force_fraud:
        return {
            "amount": round(random.uniform(5000, 20000), 2),
            "distance_from_home": round(random.uniform(200, 300), 2),
            "distance_from_last_transaction": round(random.uniform(20, 50), 2),
            "repeat_retailer": 0,
            "used_chip": 0,
            "used_pin_number": 0,
            "online_order": 1
        }
    else:
        return {
            "amount": round(random.uniform(10, 300), 2),
            "distance_from_home": round(random.uniform(1, 50), 2),
            "distance_from_last_transaction": round(random.uniform(1, 10), 2),
            "repeat_retailer": 1,
            "used_chip": 1,
            "used_pin_number": 1,
            "online_order": random.choice([0, 1])
        }

def simulate():
    print("🚀 Starting Fraud Simulation...")
    counter = 1

    while True:
        # Random realistic fraud
        force_fraud = random.random() < FRAUD_RATE

        transaction = generate_transaction(force_fraud)

        timestamp = datetime.now().strftime("%H:%M:%S")

        if force_fraud:
            print(f"[{counter}] [{timestamp}] 🚨 FRAUD SIMULATED | Amount: ${transaction['amount']}")
        else:
            print(f"[{counter}] [{timestamp}] ✅ Normal Transaction | Amount: ${transaction['amount']}")

        try:
            response = requests.post(URL, json=transaction)
            print("    ↳ API Response:", response.json())
        except Exception as e:
            print("    ❌ Error connecting to backend:", e)

        counter += 1
        time.sleep(2)

if __name__ == "__main__":
    simulate()