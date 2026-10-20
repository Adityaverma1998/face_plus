from typing import Optional
from fastapi import HTTPException, status
from supabase import Client
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse

class EmployeeService:
    @staticmethod
    def get_employees(
        company_id: str,
        db: Client,
        department: Optional[str] = None,
        is_active: Optional[bool] = None,
        limit: int = 50,
        offset: int = 0
    ) -> list[EmployeeResponse]:
        query = db.table("employees").select("*").eq("company_id", company_id)
        if department:
            query = query.eq("department", department)
        if is_active is not None:
            query = query.eq("is_active", is_active)
        
        query = query.order("display_name", desc=False).range(offset, offset + limit - 1)
        res = query.execute()
        
        employees = []
        for emp in res.data:
            employees.append(
                EmployeeResponse(
                    id=emp["id"],
                    company_id=emp["company_id"],
                    employee_code=emp["employee_code"],
                    display_name=emp["display_name"],
                    department=emp.get("department"),
                    phone=emp.get("phone"),
                    is_active=emp.get("is_active", True),
                    created_at=str(emp.get("created_at", ""))
                )
            )
        return employees

    @staticmethod
    def create_employee(company_id: str, data: EmployeeCreate, db: Client) -> EmployeeResponse:
        code = data.employee_code.strip()
        
        # Check duplicate employee code within company
        existing = db.table("employees").select("id").eq("company_id", company_id).eq("employee_code", code).execute()
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Employee code '{code}' already exists in your company"
            )
        
        payload = {
            "company_id": company_id,
            "employee_code": code,
            "display_name": data.display_name.strip(),
            "department": data.department.strip() if data.department else None,
            "phone": data.phone.strip() if data.phone else None,
            "is_active": True
        }
        res = db.table("employees").insert(payload).execute()
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create employee"
            )
        emp = res.data[0]
        return EmployeeResponse(
            id=emp["id"],
            company_id=emp["company_id"],
            employee_code=emp["employee_code"],
            display_name=emp["display_name"],
            department=emp.get("department"),
            phone=emp.get("phone"),
            is_active=emp.get("is_active", True),
            created_at=str(emp.get("created_at", ""))
        )

    @staticmethod
    def update_employee(
        company_id: str,
        employee_id: str,
        data: EmployeeUpdate,
        db: Client
    ) -> EmployeeResponse:
        existing = db.table("employees").select("*").eq("company_id", company_id).eq("id", employee_id).execute()
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found"
            )
        
        payload = {}
        if data.display_name is not None:
            payload["display_name"] = data.display_name.strip()
        if data.department is not None:
            payload["department"] = data.department.strip()
        if data.phone is not None:
            payload["phone"] = data.phone.strip()
        if data.is_active is not None:
            payload["is_active"] = data.is_active
        
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update fields provided"
            )
        
        res = db.table("employees").update(payload).eq("company_id", company_id).eq("id", employee_id).execute()
        emp = res.data[0]
        
        return EmployeeResponse(
            id=emp["id"],
            company_id=emp["company_id"],
            employee_code=emp["employee_code"],
            display_name=emp["display_name"],
            department=emp.get("department"),
            phone=emp.get("phone"),
            is_active=emp.get("is_active", True),
            created_at=str(emp.get("created_at", ""))
        )
