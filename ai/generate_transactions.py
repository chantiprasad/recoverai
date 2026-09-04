import csv
import random
from datetime import datetime, timedelta

random.seed(42)

OUTPUT_FILE = "data/transactions.csv"

statuses = [
    "success",
    "failed",
    "failed",
    "failed",
    "pending"
]

failure_reasons = [
    "insufficient_funds",
    "bank_declined",
    "network_timeout",
    "card_expired",
    "limit_exceeded",
    "unknown"
]

payment_methods = [
    "card",
    "upi",
    "netbanking",
    "wallet"
]

rows = []

start_date = datetime.now() - timedelta(days=30)

for i in range(150):
    amount = random.randint(500, 50000)

    status = random.choice(statuses)

    if status == "success":
        failure_reason = ""
    elif status == "pending":
        failure_reason = "network_timeout"
    else:
        failure_reason = random.choice(failure_reasons)

    created_at = start_date + timedelta(
        minutes=random.randint(0, 43200)
    )

    rows.append({
        "payment_id": f"pay_{100000 + i}",
        "customer_id": f"cust_{1000 + random.randint(1, 50)}",
        "amount": amount,
        "currency": "INR",
        "payment_method": random.choice(payment_methods),
        "status": status,
        "failure_reason": failure_reason,
        "retry_count": random.randint(0, 2),
        "created_at": created_at.isoformat()
    })


with open(OUTPUT_FILE, "w", newline="") as file:
    writer = csv.DictWriter(
        file,
        fieldnames=rows[0].keys()
    )

    writer.writeheader()
    writer.writerows(rows)


print(f"Generated {len(rows)} transactions")
print(f"Saved to {OUTPUT_FILE}")