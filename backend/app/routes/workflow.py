from datetime import datetime, timezone

from fastapi import APIRouter

from app.services.workflow import run_recovery_workflow
from app.services.risk_engine import get_risk_summary
from app.services.metrics import calculate_metrics
from app.services.run_store import (
    save_latest_run,
    get_latest_run,
    save_run_history,
)


router = APIRouter(
    prefix="/workflow",
    tags=["Recovery Workflow"]
)


@router.post("/run")
def run_workflow():

    risk_summary = get_risk_summary()

    workflow_result = run_recovery_workflow()

    metrics = calculate_metrics(
        workflow_result,
        risk_summary
    )

    previous_run = get_latest_run()

    previous_metrics = None

    if previous_run:
        previous_metrics = previous_run.get("metrics")

    # IMPORTANT:
    # The correct metric key is recovered_revenue.
    previous_recovered = 0

    if previous_metrics:
        previous_recovered = previous_metrics.get(
            "recovered_revenue",
            0
        )

    current_recovered = metrics.get(
        "recovered_revenue",
        0
    )

    # Preserve the strongest successful recovery result.
    best_recovery = max(
        previous_recovered,
        current_recovered
    )

    metrics["best_recovery"] = best_recovery

    run_id = (
        "run_"
        + datetime.now(timezone.utc).strftime(
            "%Y%m%d%H%M%S%f"
        )
    )

    timestamp = datetime.now(
        timezone.utc
    ).isoformat()

    latest_run = {
        "run_id": run_id,
        "timestamp": timestamp,
        "metrics": metrics,
        "workflow": workflow_result,
        "latest_execution": {
            "revenue_recovered": current_recovered,
            "duplicate_actions_prevented": metrics.get(
                "duplicate_actions_prevented",
                0
            )
        }
    }

    save_latest_run(latest_run)

    save_run_history(latest_run)

    return {
        "status": "COMPLETED",
        "run_id": run_id,
        "timestamp": timestamp,
        "metrics": metrics,
        "workflow": workflow_result
    }


@router.get("/history")
def workflow_history():

    from app.services.run_store import get_run_history

    return {
        "runs": get_run_history()
    }