from fastapi import APIRouter, Depends
from supabase import Client
from app.core.supabase import get_supabase
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth_service import AuthService

router = APIRouter()

@router.post("/login", response_model=TokenResponse, summary="Universal Login")
def login(
    req: LoginRequest,
    db: Client = Depends(get_supabase)
):
    """
    Universal login endpoint:
    - Super Admin: leave company_code blank or set to 'SYSTEM'
    - Company Admin & Terminal: provide company_code, username, and password
    """
    return AuthService.login(req, db)
