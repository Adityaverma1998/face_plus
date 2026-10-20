from fastapi import APIRouter, Depends, status
from supabase import Client
from app.api.deps import require_super_admin, get_supabase
from app.schemas.auth import UserClaims
from app.schemas.company import CompanyCreate, CompanyResponse, CompanyTerminalCreate
from app.services.company_service import CompanyService

router = APIRouter()

@router.post("/companies", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED, summary="Create Tenant Company")
def create_company(
    data: CompanyCreate,
    current_admin: UserClaims = Depends(require_super_admin),
    db: Client = Depends(get_supabase)
):
    """Super Admin provisions a new tenant company with its initial administrator."""
    return CompanyService.create_company(data, db)

@router.get("/companies", response_model=list[CompanyResponse], summary="List Tenant Companies")
def list_companies(
    current_admin: UserClaims = Depends(require_super_admin),
    db: Client = Depends(get_supabase)
):
    """Lists all tenant companies along with total enrolled employee count."""
    return CompanyService.list_companies(db)

@router.post("/companies/{company_id}/terminals", status_code=status.HTTP_201_CREATED, summary="Provision Terminal for Company")
def create_terminal_for_company(
    company_id: str,
    data: CompanyTerminalCreate,
    current_admin: UserClaims = Depends(require_super_admin),
    db: Client = Depends(get_supabase)
):
    """Provisions a dedicated terminal login credentials for a specific company."""
    return CompanyService.create_terminal(company_id, data, db)
