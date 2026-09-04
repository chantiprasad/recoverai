from fastapi import APIRouter

from app.services.audit import get_audit_logs


router = APIRouter(
    prefix="/audit",
    tags=["Audit Trail"]
)


@router.get("/logs")
def audit_logs():

    logs = get_audit_logs()

    return {
        "total_logs": len(logs),
        "logs": logs
    }