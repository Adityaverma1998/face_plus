from typing import Optional
from pydantic import BaseModel, Field

class CompanyCreate(BaseModel):
    company_code: str = Field(..., min_length=2, max_length=50, description="Unique tenant code (e.g., ACME)")
    company_name: str = Field(..., min_length=2, max_length=255)
    admin_username: str = Field(..., min_length=3, max_length=100)
    admin_password: str = Field(..., min_length=6, max_length=128)

class CompanyResponse(BaseModel):
    id: str
    company_code: str
    company_name: str
    is_active: bool
    created_at: str
    employee_count: Optional[int] = 0

class CompanyTerminalCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=100, description="Terminal name or identifier")
    password: str = Field(..., min_length=6, max_length=128)
