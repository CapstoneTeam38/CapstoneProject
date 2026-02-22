import requests
import random
import time

URL = "http://localhost:5000/api/webhook"

def simulate():
    print("Starting simulation... Sending data to Node.js Dashboard")

    for i in range(1, 31):  # 30 transactions
        if i % 5 == 0:
            # 🔥 Forced Fraud Transaction
            data = {
                "amount": 9999.99,
                "distance_from_home": 500.0,
                "online_order": 1
            }
            print(f"[{i}] 🚨 FORCED FRAUD TRANSACTION")
        else:
            # ✅ Normal Transaction
            data = {
                "amount": round(random.uniform(10, 200), 2),
                "distance_from_home": round(random.uniform(1, 20), 2),
                "online_order": random.choice([0, 1])
            }
            print(f"[{i}] Normal Transaction")

        try:
            response = requests.post(URL, json=data)
            print("Status:", response.status_code, "Data:", response.json())
        except Exception as e:
            print("Error connecting to Node.js:", e)

        time.sleep(2)  # Delay for realism

if __name__ == "__main__":
    simulate()