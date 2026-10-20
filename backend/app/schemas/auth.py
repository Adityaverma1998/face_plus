from typing import Optional
from pydantic import BaseModel

class LoginRequest(BaseModel):
    company_code: Optional[str] = None  # None or "SYSTEM" for Super Admin
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    company_id: Optional[str] = None
    username: str

class UserClaims(BaseModel):
    sub: str  # user_id
    username: str
    role: str  # 'super_admin', 'company_admin', 'terminal'
    company_id: Optional[str] = None

class SystemAdminCreate(BaseModel):
    username: str
    email: str
    password: str
