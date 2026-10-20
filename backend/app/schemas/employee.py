from typing import Optional
from pydantic import BaseModel, Field

class EmployeeCreate(BaseModel):
    employee_code: str = Field(..., min_length=1, max_length=50)
    display_name: str = Field(..., min_length=2, max_length=255)
    department: Optional[str] = None
    phone: Optional[str] = None

class EmployeeUpdate(BaseModel):
    display_name: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

class EmployeeResponse(BaseModel):
    id: str
    company_id: str
    employee_code: str
    display_name: str
    department: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool
    created_at: str
    has_face_enrolled: Optional[bool] = False
