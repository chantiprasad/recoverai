from fastapi import APIRouter

from app.services.run_store import get_latest_run


router = APIRouter(
    prefix="/metrics",
    tags=["Metrics"]
)


@router.get("/summary")
def metrics_summary():

    latest_run = get_latest_run()

    if latest_run is None:
        return {
            "status": "NO_RUN",
            "transactions_processed": 0,
            "revenue_at_risk": 0,
            "recovered_revenue": 0,
            "recovery_rate_percent": 0,
            "automation_rate_percent": 0,
            "human_reviews": 0,
            "blocked_actions": 0,
            "failed_recoveries": 0,
            "duplicate_actions_prevented": 0
        }

    return latest_run["metrics"]