import requests
import random
import time

URL = "http://127.0.0.1:5001/predict"

while True:
    is_fraud = random.random() < 0.2
    payload = {
        "amount": random.uniform(500, 5000) if is_fraud else random.uniform(10, 100),
        "v14": random.uniform(-15, -5) if is_fraud else random.uniform(-1, 1),
        "time": random.randint(0, 100000)
    }
    try:
        r = requests.post(URL, json=payload)
        print(f"Transaction Sent | Result: {r.json()['label']}")
    except:
        print("Wait... Is Flask running on 5001?")
    time.sleep(2)