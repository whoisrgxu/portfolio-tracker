# api/api/routes/health.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok"}

@router.get("/")
def root():
    return {"message": "Welcome to the Portfolio API"}
