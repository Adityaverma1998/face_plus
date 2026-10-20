from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from app.core.supabase import get_supabase
from app.schemas.user import UserCreate

router = APIRouter()

@router.get("/")
def get_users(db: Client = Depends(get_supabase)):
    """Fetch all users from Supabase 'users' table."""
    try:
        response = db.table("users").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch users: {str(e)}"
        )

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Client = Depends(get_supabase)):
    """Create a new user in Supabase 'users' table."""
    try:
        response = db.table("users").insert(user.model_dump()).execute()
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create user: {str(e)}"
        )
