from fastapi import APIRouter, Depends, status
from supabase import Client
from app.api.deps import require_company_admin, get_supabase
from app.schemas.auth import UserClaims
from app.services.realtime_service import RealtimeService

router = APIRouter()

@router.post("/trigger-sync", status_code=status.HTTP_200_OK, summary="Trigger Remote Realtime Sync to All Terminals")
async def trigger_remote_sync(
    current_user: UserClaims = Depends(require_company_admin),
    db: Client = Depends(get_supabase)
):
    """
    Company Admin triggers an instantaneous broadcast signal to all terminal devices
    registered under their company, commanding them to sync templates and punch events.
    """
    result = await RealtimeService.trigger_sync_broadcast(
        company_id=current_user.company_id,
        db=db
    )
    return {
        "message": "Realtime sync broadcast triggered",
        "company_id": current_user.company_id,
        "details": result
    }
