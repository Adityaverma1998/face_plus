from typing import Literal, Optional
from pydantic import BaseModel, Field

PoseType = Literal['frontal', 'left_turn', 'right_turn', 'tilt_up', 'tilt_down']

class FaceTemplateEnroll(BaseModel):
    employee_id: str
    pose_type: PoseType = "frontal"
    # 192-dimensional vector string or list of floats
    embedding: list[float] = Field(..., min_length=192, max_length=192, description="192-dim MobileFaceNet embedding")

class FaceTemplateResponse(BaseModel):
    id: str
    company_id: str
    employee_id: str
    pose_type: str
    adaptation_count: int
    last_adapted_at: Optional[str] = None
    image_storage_url: Optional[str] = None
    created_at: str

class FaceTemplateExportItem(BaseModel):
    id: str
    employee_id: str
    employee_code: str
    display_name: str
    department: Optional[str] = None
    pose_type: str
    embedding: list[float]
    image_storage_url: Optional[str] = None
