import json
import os

from google import genai
from dotenv import load_dotenv

load_dotenv()


ALLOWED_ACTIONS = {
    "RETRY_PAYMENT",
    "SEND_PAYMENT_REMINDER",
    "REQUEST_ALTERNATIVE_PAYMENT",
    "REQUEST_CARD_UPDATE",
    "HUMAN_REVIEW",
    "NO_ACTION",
}


def fallback_diagnosis(transaction):
    """
    Deterministic fallback used when Gemini is unavailable.
    RecoverAI remains operational even if the AI provider fails.
    """

    status = transaction["status"]
    reason = transaction["failure_reason"]
    retry_count = transaction["retry_count"]

    if status == "success":
        return {
            "diagnosis": "Payment successful",
            "recommended_action": "NO_ACTION",
            "confidence": 1.0,
        }

    if reason == "network_timeout":
        if retry_count < 2:
            return {
                "diagnosis": "Temporary payment network failure",
                "recommended_action": "RETRY_PAYMENT",
                "confidence": 0.92,
            }

        return {
            "diagnosis": "Repeated network failure",
            "recommended_action": "HUMAN_REVIEW",
            "confidence": 0.88,
        }

    if reason == "insufficient_funds":
        return {
            "diagnosis": "Customer account may not have sufficient funds",
            "recommended_action": "SEND_PAYMENT_REMINDER",
            "confidence": 0.91,
        }

    if reason == "bank_declined":
        return {
            "diagnosis": "Payment declined by issuing bank",
            "recommended_action": "REQUEST_ALTERNATIVE_PAYMENT",
            "confidence": 0.89,
        }

    if reason == "card_expired":
        return {
            "diagnosis": "Customer card has expired",
            "recommended_action": "REQUEST_CARD_UPDATE",
            "confidence": 0.97,
        }

    if reason == "limit_exceeded":
        return {
            "diagnosis": "Payment exceeded the available transaction limit",
            "recommended_action": "REQUEST_ALTERNATIVE_PAYMENT",
            "confidence": 0.90,
        }

    return {
        "diagnosis": "Unknown payment failure requiring investigation",
        "recommended_action": "HUMAN_REVIEW",
        "confidence": 0.60,
    }


def diagnose_payment(transaction):
    """
    Gemini-powered AI diagnosis layer.

    Gemini recommends an action.
    The policy engine remains the final authority.
    Gemini never executes payments.
    """

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return fallback_diagnosis(transaction)

    try:
        client = genai.Client(api_key=api_key)

        prompt = f"""
You are RecoverAI, an AI revenue recovery assistant.

Analyze the following payment and recommend the safest recovery action.

Payment information:

Payment ID: {transaction["payment_id"]}
Customer ID: {transaction["customer_id"]}
Amount: ₹{transaction["amount"]}
Currency: {transaction["currency"]}
Payment Method: {transaction["payment_method"]}
Status: {transaction["status"]}
Failure Reason: {transaction["failure_reason"]}
Previous Retry Count: {transaction["retry_count"]}

Allowed actions:

RETRY_PAYMENT
SEND_PAYMENT_REMINDER
REQUEST_ALTERNATIVE_PAYMENT
REQUEST_CARD_UPDATE
HUMAN_REVIEW
NO_ACTION

Decision rules:

1. Successful payments must receive NO_ACTION.
2. Do not invent information.
3. If the situation is ambiguous, choose HUMAN_REVIEW.
4. Repeated network failures should prefer HUMAN_REVIEW.
5. A temporary network timeout may justify RETRY_PAYMENT when retry count is below 2.
6. Insufficient funds may justify SEND_PAYMENT_REMINDER.
7. Bank declines or transaction limits may justify REQUEST_ALTERNATIVE_PAYMENT.
8. Expired cards may justify REQUEST_CARD_UPDATE.
9. The recommendation must be conservative.
10. The AI only recommends. It must never assume it can execute a payment.

Return ONLY valid JSON in this exact structure:

{{
    "diagnosis": "brief explanation of the likely cause",
    "recommended_action": "one allowed action",
    "confidence": 0.0
}}

Confidence must be a number between 0 and 1.
"""

        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
        )

        result = json.loads(response.text)

        action = result.get("recommended_action")
        confidence = float(result.get("confidence", 0.5))
        diagnosis = str(
            result.get(
                "diagnosis",
                "Payment requires investigation",
            )
        )

        if action not in ALLOWED_ACTIONS:
            return fallback_diagnosis(transaction)

        if not 0 <= confidence <= 1:
            return fallback_diagnosis(transaction)

        return {
            "diagnosis": diagnosis,
            "recommended_action": action,
            "confidence": confidence,
        }

    except Exception:
        return fallback_diagnosis(transaction)