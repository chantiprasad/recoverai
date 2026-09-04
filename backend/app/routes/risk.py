from fastapi import APIRouter

from app.services.risk_engine import get_risk_summary


router = APIRouter(
    prefix="/risk",
    tags=["Revenue Risk"]
)


@router.get("/summary")
def risk_summary():
    return get_risk_summary()