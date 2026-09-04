MAX_RETRIES = 2
MAX_AUTOMATED_AMOUNT = 50000
MAX_REMINDERS = 2


def validate_action(transaction, ai_decision):

    action = ai_decision["recommended_action"]

    amount = transaction["amount"]
    retry_count = transaction["retry_count"]

    # Successful payment
    if transaction["status"] == "success":
        return {
            "decision": "BLOCK",
            "reason": "Payment already successful"
        }

    # Retry protection
    if action == "RETRY_PAYMENT":

        if retry_count >= MAX_RETRIES:
            return {
                "decision": "HUMAN_REVIEW",
                "reason": "Maximum retry limit reached"
            }

        if amount > MAX_AUTOMATED_AMOUNT:
            return {
                "decision": "HUMAN_REVIEW",
                "reason": "Amount exceeds automated recovery limit"
            }

        return {
            "decision": "APPROVE",
            "reason": "Retry is within recovery policy"
        }

    # Payment reminder
    if action == "SEND_PAYMENT_REMINDER":

        if amount > MAX_AUTOMATED_AMOUNT:
            return {
                "decision": "HUMAN_REVIEW",
                "reason": "Amount exceeds automated reminder limit"
            }

        return {
            "decision": "APPROVE",
            "reason": "Reminder allowed by recovery policy"
        }

    # Alternative payment
    if action == "REQUEST_ALTERNATIVE_PAYMENT":

        return {
            "decision": "APPROVE",
            "reason": "Alternative payment request allowed"
        }

    # Card update
    if action == "REQUEST_CARD_UPDATE":

        return {
            "decision": "APPROVE",
            "reason": "Card update request allowed"
        }

    # Unknown / sensitive action
    if action == "HUMAN_REVIEW":

        return {
            "decision": "HUMAN_REVIEW",
            "reason": "AI could not safely determine an automated recovery action"
        }

    return {
        "decision": "BLOCK",
        "reason": "Action not recognized by policy engine"
    }