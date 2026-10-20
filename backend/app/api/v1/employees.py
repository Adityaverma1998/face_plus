from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from supabase import Client
from app.api.deps import require_company_admin, require_terminal_or_admin, get_supabase
from app.schemas.auth import UserClaims
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse
from app.services.employee_service import EmployeeService

router = APIRouter()

@router.get("", response_model=list[EmployeeResponse], summary="List Company Employees")
def get_employees(
    department: Optional[str] = Query(None, description="Filter by department"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: UserClaims = Depends(require_terminal_or_admin),
    db: Client = Depends(get_supabase)
):
    """
    Retrieves all employees for the caller's tenant company.
    The mobile client can sync this list to match employee faces locally.
    """
    return EmployeeService.get_employees(
        company_id=current_user.company_id,
        db=db,
        department=department,
        is_active=is_active,
        limit=limit,
        offset=offset
    )

@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED, summary="Create Employee")
def create_employee(
    data: EmployeeCreate,
    current_user: UserClaims = Depends(require_company_admin),
    db: Client = Depends(get_supabase)
):
    """Company Admin creates a new employee under their company."""
    return EmployeeService.create_employee(
        company_id=current_user.company_id,
        data=data,
        db=db
    )

@router.put("/{employee_id}", response_model=EmployeeResponse, summary="Update Employee")
def update_employee(
    employee_id: str,
    data: EmployeeUpdate,
    current_user: UserClaims = Depends(require_company_admin),
    db: Client = Depends(get_supabase)
):
    """Company Admin updates employee details or active status."""
    return EmployeeService.update_employee(
        company_id=current_user.company_id,
        employee_id=employee_id,
        data=data,
        db=db
    )
