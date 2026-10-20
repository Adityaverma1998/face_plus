from fastapi import HTTPException, status
from supabase import Client
from app.core.security import hash_password
from app.schemas.company import CompanyCreate, CompanyResponse, CompanyTerminalCreate

class CompanyService:
    @staticmethod
    def create_company(data: CompanyCreate, db: Client) -> CompanyResponse:
        code = data.company_code.strip().upper()
        
        # Check duplicate company code
        existing = db.table("companies").select("id").eq("company_code", code).execute()
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Company code '{code}' already exists"
            )
        
        # 1. Insert Company
        comp_payload = {
            "company_code": code,
            "company_name": data.company_name.strip(),
            "is_active": True
        }
        comp_res = db.table("companies").insert(comp_payload).execute()
        if not comp_res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create company record"
            )
        company = comp_res.data[0]
        company_id = company["id"]
        
        # 2. Create Initial Company Admin
        admin_payload = {
            "company_id": company_id,
            "username": data.admin_username.strip(),
            "password_hash": hash_password(data.admin_password),
            "role": "company_admin",
            "is_active": True
        }
        admin_res = db.table("company_users").insert(admin_payload).execute()
        if not admin_res.data:
            # Rollback company creation if user creation fails
            db.table("companies").delete().eq("id", company_id).execute()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to provision initial company admin"
            )
        
        return CompanyResponse(
            id=company["id"],
            company_code=company["company_code"],
            company_name=company["company_name"],
            is_active=company["is_active"],
            created_at=str(company["created_at"]),
            employee_count=0
        )

    @staticmethod
    def list_companies(db: Client) -> list[CompanyResponse]:
        companies_res = db.table("companies").select("*").order("created_at", desc=True).execute()
        result = []
        for comp in companies_res.data:
            # Count active employees
            emp_count_res = db.table("employees").select("id", count="exact").eq("company_id", comp["id"]).execute()
            count = emp_count_res.count if emp_count_res.count is not None else len(emp_count_res.data or [])
            result.append(
                CompanyResponse(
                    id=comp["id"],
                    company_code=comp["company_code"],
                    company_name=comp["company_name"],
                    is_active=comp.get("is_active", True),
                    created_at=str(comp.get("created_at", "")),
                    employee_count=count
                )
            )
        return result

    @staticmethod
    def create_terminal(company_id: str, data: CompanyTerminalCreate, db: Client):
        username = data.username.strip()
        existing = db.table("company_users").select("id").eq("company_id", company_id).eq("username", username).execute()
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Terminal username '{username}' already exists for this company"
            )
        
        terminal_payload = {
            "company_id": company_id,
            "username": username,
            "password_hash": hash_password(data.password),
            "role": "terminal",
            "is_active": True
        }
        res = db.table("company_users").insert(terminal_payload).execute()
        return res.data[0]
