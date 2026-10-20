from fastapi import APIRouter, Depends, Query, status
from supabase import Client
from app.api.deps import require_terminal_or_admin, require_company_admin, get_supabase
from app.schemas.auth import UserClaims
from app.schemas.attendance import AttendancePunchBatch, BatchSyncResponse
from app.services.attendance_service import AttendanceService

router = APIRouter()

@router.post("/sync-batch", response_model=BatchSyncResponse, status_code=status.HTTP_200_OK, summary="Sync Offline Punches in Batch")
def sync_batch_attendance(
    batch: AttendancePunchBatch,
    current_user: UserClaims = Depends(require_terminal_or_admin),
    db: Client = Depends(get_supabase)
):
    """
    Called by mobile clients (Flutter) when back online.
    - Idempotent: punches with existing sync_idempotency_key are safely skipped.
    - Inserts remaining valid punches into attendance_events.
    """
    return AttendanceService.sync_batch_punches(
        company_id=current_user.company_id,
        batch=batch,
        db=db
    )

@router.get("", summary="Get Company Attendance Events")
def get_attendance(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: UserClaims = Depends(require_company_admin),
    db: Client = Depends(get_supabase)
):
    """Company Admin views recent attendance events."""
    return AttendanceService.get_company_attendance(
        company_id=current_user.company_id,
        db=db,
        limit=limit,
        offset=offset
    )
