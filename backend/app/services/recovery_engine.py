from app.services.ai_decision import diagnose_payment
from app.services.policy_engine import validate_action


def generate_recovery_decision(transaction):

    ai_decision = diagnose_payment(transaction)

    policy_decision = validate_action(
        transaction,
        ai_decision
    )

    return {
        "payment_id": transaction["payment_id"],
        "customer_id": transaction["customer_id"],
        "amount": transaction["amount"],
        "status": transaction["status"],
        "failure_reason": transaction["failure_reason"],
        "retry_count": transaction["retry_count"],

        "ai": {
            "diagnosis": ai_decision["diagnosis"],
            "recommended_action": ai_decision["recommended_action"],
            "confidence": ai_decision["confidence"]
        },

        "policy": {
            "decision": policy_decision["decision"],
            "reason": policy_decision["reason"]
        }
    }