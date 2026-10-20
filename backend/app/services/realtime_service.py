import httpx
from app.core.config import settings
from supabase import Client

class RealtimeService:
    @staticmethod
    async def trigger_sync_broadcast(company_id: str, db: Client) -> dict:
        """
        Emits an 'attendance_sync' broadcast event on channel 'sync:company_{company_id}'.
        Mobile terminal tablets listening to this channel immediately initiate a punch sync.
        """
        channel_name = f"sync:company_{company_id}"
        event_name = "attendance_sync"
        payload = {
            "type": "broadcast",
            "event": event_name,
            "company_id": company_id,
            "timestamp": httpx._utils.get_environment_proxies() # just a dummy import or use standard datetime
        }

        # Supabase Realtime HTTP Broadcast endpoint
        realtime_url = f"{settings.SUPABASE_URL}/realtime/v1/api/broadcast"
        headers = {
            "apikey": settings.SUPABASE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_KEY}",
            "Content-Type": "application/json"
        }
        body = {
            "messages": [
                {
                    "topic": f"realtime:{channel_name}",
                    "event": event_name,
                    "payload": {
                        "action": "SYNC_NOW",
                        "company_id": company_id
                    }
                }
            ]
        }

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.post(realtime_url, json=body, headers=headers)
                success = resp.status_code in (200, 202)
        except Exception as e:
            print(f"[Realtime Broadcast Error]: {e}")
            success = False

        return {
            "channel": channel_name,
            "event": event_name,
            "broadcast_sent": success
        }
