from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.core.security import decode_access_token
from app.core.supabase import get_supabase
from app.schemas.auth import UserClaims
from supabase import Client

security_scheme = HTTPBearer(auto_error=True)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
) -> UserClaims:
    """Decodes JWT and extracts user claims."""
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        username: str = payload.get("username")
        role: str = payload.get("role")
        company_id: Optional[str] = payload.get("company_id")
        
        if not user_id or not role:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        return UserClaims(
            sub=user_id,
            username=username,
            role=role,
            company_id=company_id
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )

def require_super_admin(
    current_user: UserClaims = Depends(get_current_user)
) -> UserClaims:
    """Ensures caller has Super Admin privileges."""
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin access required"
        )
    return current_user

def require_company_admin(
    current_user: UserClaims = Depends(get_current_user)
) -> UserClaims:
    """Ensures caller is a Company Admin for their tenant."""
    if current_user.role != "company_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Company Admin access required"
        )
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company ID missing from session"
        )
    return current_user

def require_terminal_or_admin(
    current_user: UserClaims = Depends(get_current_user)
) -> UserClaims:
    """Allows either Company Admin or Terminal devices belonging to the tenant."""
    if current_user.role not in ("company_admin", "terminal"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant access required"
        )
    if not current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company ID missing from session"
        )
    return current_user
