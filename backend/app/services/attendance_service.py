from supabase import Client
from app.schemas.attendance import AttendancePunchBatch, BatchSyncResponse

class AttendanceService:
    @staticmethod
    def sync_batch_punches(
        company_id: str,
        batch: AttendancePunchBatch,
        db: Client
    ) -> BatchSyncResponse:
        punches = batch.punches
        total = len(punches)
        if total == 0:
            return BatchSyncResponse(total_received=0, inserted_count=0, skipped_count=0)

        # 1. Fetch already existing idempotency keys
        keys = [p.sync_idempotency_key for p in punches]
        existing_res = db.table("attendance_events").select("sync_idempotency_key").in_("sync_idempotency_key", keys).execute()
        existing_keys = {row["sync_idempotency_key"] for row in existing_res.data}

        # 2. Filter new punches
        to_insert = []
        errors = []
        for p in punches:
            if p.sync_idempotency_key in existing_keys:
                continue
            to_insert.append({
                "company_id": company_id,
                "employee_id": p.employee_id,
                "event_type": p.event_type,
                "punch_time": p.punch_time,
                "device_id": p.device_id,
                "match_score": p.match_score,
                "sync_idempotency_key": p.sync_idempotency_key
            })

        inserted_count = 0
        if to_insert:
            try:
                insert_res = db.table("attendance_events").insert(to_insert).execute()
                inserted_count = len(insert_res.data or [])
            except Exception as e:
                errors.append(f"Batch insert error: {str(e)}")

        skipped_count = total - inserted_count

        return BatchSyncResponse(
            total_received=total,
            inserted_count=inserted_count,
            skipped_count=skipped_count,
            errors=errors
        )

    @staticmethod
    def get_company_attendance(
        company_id: str,
        db: Client,
        limit: int = 100,
        offset: int = 0
    ):
        res = db.table("attendance_events") \
            .select("*, employees(employee_code, display_name, department)") \
            .eq("company_id", company_id) \
            .order("punch_time", desc=True) \
            .range(offset, offset + limit - 1) \
            .execute()
        return res.data
