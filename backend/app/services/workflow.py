from app.services.risk_engine import load_transactions
from app.services.recovery_engine import generate_recovery_decision
from app.services.executor import execute_recovery
from app.services.audit import write_audit_log
from app.services.idempotency import (
    action_already_processed,
    mark_action_processed
)


def run_recovery_workflow():

    transactions = load_transactions()

    results = []

    recovered_revenue = 0

    approved_actions = 0
    executed_actions = 0
    human_reviews = 0
    blocked_actions = 0
    duplicate_actions_prevented = 0
    failed_recoveries = 0

    for transaction in transactions:

        if transaction["status"] == "success":
            continue

        decision = generate_recovery_decision(transaction)

        policy_decision = decision["policy"]["decision"]
        action = decision["ai"]["recommended_action"]

        execution_result = {
            "status": "NOT_EXECUTED",
            "message": "Action not approved",
            "recovered_amount": 0
        }

        # -----------------------------------------
        # POLICY APPROVED
        # -----------------------------------------

        if policy_decision == "APPROVE":

            approved_actions += 1

            # -----------------------------------------
            # IDEMPOTENCY / DUPLICATE PROTECTION
            # -----------------------------------------

            if action_already_processed(
                transaction["payment_id"],
                action
            ):

                duplicate_actions_prevented += 1

                execution_result = {
                    "status": "DUPLICATE_BLOCKED",
                    "message": "Duplicate recovery action prevented",
                    "recovered_amount": 0
                }

            else:

                # -----------------------------------------
                # EXECUTE RECOVERY ACTION
                # -----------------------------------------

                execution_result = execute_recovery(
                    transaction,
                    action
                )

                execution_status = execution_result["status"]

                # -----------------------------------------
                # SUCCESSFUL EXECUTION
                # -----------------------------------------

                if execution_status in [
                    "ACTION_EXECUTED",
                    "RECOVERED"
                ]:

                    executed_actions += 1

                    # Mark only successfully executed
                    # actions as processed.
                    mark_action_processed(
                        transaction["payment_id"],
                        action
                    )

                    recovered_revenue += execution_result[
                        "recovered_amount"
                    ]

                # -----------------------------------------
                # FAILED EXECUTION
                # -----------------------------------------

                elif execution_status == "FAILED":

                    failed_recoveries += 1

                    # IMPORTANT:
                    # Do NOT mark failed actions as processed.
                    # A future run can safely retry them.

        # -----------------------------------------
        # HUMAN REVIEW
        # -----------------------------------------

        elif policy_decision == "HUMAN_REVIEW":

            human_reviews += 1

        # -----------------------------------------
        # BLOCKED
        # -----------------------------------------

        elif policy_decision == "BLOCK":

            blocked_actions += 1

        # -----------------------------------------
        # RESULT
        # -----------------------------------------

        result = {
            **decision,
            "execution": execution_result
        }

        # -----------------------------------------
        # AUDIT TRAIL
        # -----------------------------------------

        write_audit_log({
            "payment_id": transaction["payment_id"],
            "amount": transaction["amount"],
            "original_status": transaction["status"],
            "failure_reason": transaction["failure_reason"],
            "ai_diagnosis": decision["ai"]["diagnosis"],
            "recommended_action": action,
            "policy_decision": policy_decision,
            "execution_status": execution_result["status"],
            "recovered_amount": execution_result[
                "recovered_amount"
            ]
        })

        results.append(result)

    return {
        "transactions_processed": len(results),
        "approved_actions": approved_actions,
        "executed_actions": executed_actions,
        "human_reviews": human_reviews,
        "blocked_actions": blocked_actions,
        "failed_recoveries": failed_recoveries,
        "duplicate_actions_prevented": duplicate_actions_prevented,
        "recovered_revenue": recovered_revenue,
        "results": results
    }
