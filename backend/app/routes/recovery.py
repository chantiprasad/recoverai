from fastapi import APIRouter

from app.services.run_store import get_latest_run


router = APIRouter(
    prefix="/recovery",
    tags=["Recovery"]
)


@router.get("/decisions")
def recovery_decisions():

    latest_run = get_latest_run()

    if latest_run is None:
        return {
            "total_recovery_candidates": 0,
            "decisions": []
        }

    workflow = latest_run["workflow"]

    return {
        "total_recovery_candidates": workflow["transactions_processed"],
        "decisions": workflow["results"]
    }