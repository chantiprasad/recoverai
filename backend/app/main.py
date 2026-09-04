from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routes.risk import router as risk_router
from app.routes.recovery import router as recovery_router
from app.routes.workflow import router as workflow_router
from app.routes.audit import router as audit_router
from app.routes.metrics import router as metrics_router

load_dotenv()

app = FastAPI(
    title="RecoverAI",
    description="AI Revenue Recovery Agent",
    version="1.0.0"
)

# Allow the React frontend to communicate with the FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(risk_router)
app.include_router(recovery_router)
app.include_router(workflow_router)
app.include_router(audit_router)
app.include_router(metrics_router)


@app.get("/")
def root():
    return {
        "message": "RecoverAI API is running",
        "status": "healthy"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "recoverai-backend"
    }