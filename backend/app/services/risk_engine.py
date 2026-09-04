import csv
from pathlib import Path


DATA_FILE = Path(__file__).resolve().parents[3] / "data" / "transactions.csv"


def load_transactions():
    with open(DATA_FILE, "r", newline="") as file:
        reader = csv.DictReader(file)

        transactions = []

        for row in reader:
            row["amount"] = float(row["amount"])
            row["retry_count"] = int(row["retry_count"])

            transactions.append(row)

        return transactions


def calculate_risk(transaction):
    status = transaction["status"]
    amount = transaction["amount"]
    retry_count = transaction["retry_count"]
    failure_reason = transaction["failure_reason"]

    if status == "success":
        return {
            "risk_level": "NONE",
            "revenue_at_risk": 0
        }

    risk_score = 0

    # Failed or pending payments are automatically risky
    if status == "failed":
        risk_score += 50

    elif status == "pending":
        risk_score += 30

    # Higher-value payments receive higher priority
    if amount >= 30000:
        risk_score += 30
    elif amount >= 10000:
        risk_score += 20
    else:
        risk_score += 10

    # Failed retries increase risk
    if retry_count >= 2:
        risk_score += 20

    # Some failures are easier to recover
    if failure_reason == "network_timeout":
        risk_score += 5

    if risk_score >= 80:
        risk_level = "HIGH"

    elif risk_score >= 50:
        risk_level = "MEDIUM"

    else:
        risk_level = "LOW"

    return {
        "risk_level": risk_level,
        "revenue_at_risk": amount
    }


def get_risk_summary():

    transactions = load_transactions()

    total_transactions = len(transactions)

    successful_transactions = 0
    risky_transactions = 0
    revenue_at_risk = 0

    high_risk = 0
    medium_risk = 0
    low_risk = 0

    results = []

    for transaction in transactions:

        risk = calculate_risk(transaction)

        if transaction["status"] == "success":
            successful_transactions += 1

        if risk["revenue_at_risk"] > 0:
            risky_transactions += 1
            revenue_at_risk += risk["revenue_at_risk"]

        if risk["risk_level"] == "HIGH":
            high_risk += 1

        elif risk["risk_level"] == "MEDIUM":
            medium_risk += 1

        elif risk["risk_level"] == "LOW":
            low_risk += 1

        results.append({
            **transaction,
            **risk
        })

    return {
        "total_transactions": total_transactions,
        "successful_transactions": successful_transactions,
        "risky_transactions": risky_transactions,
        "revenue_at_risk": revenue_at_risk,
        "risk_distribution": {
            "high": high_risk,
            "medium": medium_risk,
            "low": low_risk
        },
        "transactions": results
    }