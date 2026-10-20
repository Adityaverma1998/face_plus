from typing import Optional
from fastapi import HTTPException, status
from supabase import Client
from postgrest.exceptions import APIError
from app.core.security import verify_password, create_access_token
from app.schemas.auth import LoginRequest, TokenResponse

class AuthService:
    @staticmethod
    def login(req: LoginRequest, db: Client) -> TokenResponse:
        company_code = (req.company_code or "").strip().upper()
        username = req.username.strip()
        
        try:
            # 1. Super Admin Login (company_code is empty or "SYSTEM")
            if not company_code or company_code == "SYSTEM":
                res = db.table("system_admins").select("*").eq("username", username).execute()
                if not res.data:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid credentials"
                    )
                admin = res.data[0]
                if not verify_password(req.password, admin["password_hash"]):
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid credentials"
                    )
                
                token = create_access_token({
                    "sub": admin["id"],
                    "username": admin["username"],
                    "role": "super_admin",
                    "company_id": None
                })
                return TokenResponse(
                    access_token=token,
                    role="super_admin",
                    company_id=None,
                    username=admin["username"]
                )
            
            # 2. Tenant Login (Company Admin or Terminal)
            comp_res = db.table("companies").select("*").eq("company_code", company_code).execute()
            if not comp_res.data:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Company '{company_code}' not found"
                )
            company = comp_res.data[0]
            if not company.get("is_active", True):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Company account is deactivated"
                )
            
            company_id = company["id"]

            user_res = db.table("company_users").select("*").eq("company_id", company_id).eq("username", username).execute()
            if not user_res.data:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials for company"
                )
            user = user_res.data[0]
            if not user.get("is_active", True):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="User account is deactivated"
                )
            
            if not verify_password(req.password, user["password_hash"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials"
                )
            
            token = create_access_token({
                "sub": user["id"],
                "username": user["username"],
                "role": user["role"],
                "company_id": company_id
            })

            return TokenResponse(
                access_token=token,
                role=user["role"],
                company_id=company_id,
                username=user["username"]
            )
        except APIError as e:
            if "PGRST205" in str(e) or "Could not find the table" in str(e):
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Database schema has not been initialized. Please execute backend/schema.sql in your Supabase SQL Editor."
                )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
