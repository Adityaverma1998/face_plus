from fastapi import APIRouter, Depends
from supabase import Client
from app.core.supabase import get_supabase

router = APIRouter()

@router.get("/health")
def health_check(db: Client = Depends(get_supabase)):
    """Health check endpoint to verify API and Supabase connectivity."""
    supabase_status = "connected"
    try:
        # A lightweight call to verify client is configured
        _ = db.auth.get_session()
    except Exception as e:
        supabase_status = f"error: {str(e)}"

    return {
        "status": "healthy",
        "supabase": supabase_status
    }
