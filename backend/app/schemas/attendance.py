from typing import Literal, Optional
from pydantic import BaseModel, Field

EventType = Literal['check_in', 'check_out']

class PunchItem(BaseModel):
    sync_idempotency_key: str = Field(..., description="Unique UUID generated on mobile device to ensure idempotency")
    employee_id: str
    event_type: EventType
    punch_time: str = Field(..., description="ISO-8601 timestamp of punch")
    device_id: Optional[str] = None
    match_score: Optional[float] = None

class AttendancePunchBatch(BaseModel):
    punches: list[PunchItem] = Field(..., min_length=1, max_length=1000)

class BatchSyncResponse(BaseModel):
    total_received: int
    inserted_count: int
    skipped_count: int
    errors: list[str] = []

class AttendanceEventResponse(BaseModel):
    id: str
    company_id: str
    employee_id: str
    event_type: str
    punch_time: str
    device_id: Optional[str] = None
    match_score: Optional[float] = None
    sync_idempotency_key: str
    created_at: str
