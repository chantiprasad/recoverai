def calculate_metrics(workflow_result, risk_summary):

    revenue_at_risk = risk_summary["revenue_at_risk"]

    recovered_revenue = workflow_result["recovered_revenue"]

    transactions_processed = (
        workflow_result["transactions_processed"]
    )

    executed_actions = workflow_result["executed_actions"]

    human_reviews = workflow_result["human_reviews"]

    blocked_actions = workflow_result["blocked_actions"]

    failed_recoveries = workflow_result["failed_recoveries"]

    duplicate_actions_prevented = (
        workflow_result["duplicate_actions_prevented"]
    )

    if revenue_at_risk > 0:

        recovery_rate = (
            recovered_revenue /
            revenue_at_risk
        ) * 100

    else:

        recovery_rate = 0

    if transactions_processed > 0:

        automation_rate = (
            executed_actions /
            transactions_processed
        ) * 100

    else:

        automation_rate = 0

    return {
        "transactions_processed": transactions_processed,
        "revenue_at_risk": revenue_at_risk,
        "recovered_revenue": recovered_revenue,
        "recovery_rate_percent": round(
            recovery_rate,
            2
        ),
        "automation_rate_percent": round(
            automation_rate,
            2
        ),
        "human_reviews": human_reviews,
        "blocked_actions": blocked_actions,
        "failed_recoveries": failed_recoveries,
        "duplicate_actions_prevented": (
            duplicate_actions_prevented
        )
    }