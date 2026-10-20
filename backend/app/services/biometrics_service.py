import time
from typing import Optional
from fastapi import HTTPException, status
from supabase import Client
from app.core.config import settings
from app.schemas.biometrics import FaceTemplateResponse, FaceTemplateExportItem

class BiometricsService:
    @staticmethod
    def enroll_face(
        company_id: str,
        employee_id: str,
        pose_type: str,
        embedding: list[float],
        image_bytes: Optional[bytes],
        image_filename: Optional[str],
        db: Client
    ) -> FaceTemplateResponse:
        # 1. Validate 192 dimensions
        if len(embedding) != settings.EMBEDDING_DIMENSION:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Embedding must be {settings.EMBEDDING_DIMENSION} dimensions. Received: {len(embedding)}"
            )

        # 2. Verify employee belongs to company
        emp_res = db.table("employees").select("id, is_active").eq("company_id", company_id).eq("id", employee_id).execute()
        if not emp_res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found in your company"
            )
        
        # 3. Optional: Upload image to Supabase Storage
        image_storage_url = None
        if image_bytes:
            storage_path = f"{company_id}/{employee_id}/{pose_type}_{int(time.time())}.jpg"
            try:
                # Ensure bucket exists or upload directly
                db.storage.from_(settings.STORAGE_BUCKET_NAME).upload(
                    file=image_bytes,
                    path=storage_path,
                    file_options={"content-type": "image/jpeg", "upsert": "true"}
                )
                image_storage_url = db.storage.from_(settings.STORAGE_BUCKET_NAME).get_public_url(storage_path)
            except Exception as e:
                # Log storage warning but continue biometric enrollment
                print(f"[Warning] Failed to upload face image to storage: {e}")
                image_storage_url = f"storage://{settings.STORAGE_BUCKET_NAME}/{storage_path}"

        # 4. Upsert into face_templates
        # Format vector for PostgreSQL pgvector: '[0.123, -0.456, ...]'
        vector_str = f"[{','.join(str(f) for f in embedding)}]"
        
        existing = db.table("face_templates").select("id").eq("employee_id", employee_id).eq("pose_type", pose_type).execute()
        
        if existing.data:
            template_id = existing.data[0]["id"]
            update_payload = {
                "embedding": vector_str,
                "image_storage_url": image_storage_url,
                "adaptation_count": 0,
            }
            res = db.table("face_templates").update(update_payload).eq("id", template_id).execute()
            data = res.data[0]
        else:
            insert_payload = {
                "company_id": company_id,
                "employee_id": employee_id,
                "pose_type": pose_type,
                "embedding": vector_str,
                "original_embedding": vector_str,
                "adaptation_count": 0,
                "image_storage_url": image_storage_url
            }
            res = db.table("face_templates").insert(insert_payload).execute()
            data = res.data[0]

        return FaceTemplateResponse(
            id=data["id"],
            company_id=data["company_id"],
            employee_id=data["employee_id"],
            pose_type=data["pose_type"],
            adaptation_count=data.get("adaptation_count", 0),
            last_adapted_at=str(data.get("last_adapted_at", "")) if data.get("last_adapted_at") else None,
            image_storage_url=data.get("image_storage_url"),
            created_at=str(data.get("created_at", ""))
        )

    @staticmethod
    def get_company_templates(company_id: str, db: Client) -> list[FaceTemplateExportItem]:
        """Fetches all active employee face templates for mobile offline Drift SQLite sync."""
        # Query active employees first
        emp_res = db.table("employees").select("id, employee_code, display_name, department").eq("company_id", company_id).eq("is_active", True).execute()
        emp_map = {e["id"]: e for e in emp_res.data}
        if not emp_map:
            return []

        # Query templates
        tmpl_res = db.table("face_templates").select("id, employee_id, pose_type, embedding, image_storage_url").eq("company_id", company_id).execute()
        
        result = []
        for t in tmpl_res.data:
            emp = emp_map.get(t["employee_id"])
            if not emp:
                continue
            
            raw_emb = t["embedding"]
            if isinstance(raw_emb, str):
                # Parse '[0.1, 0.2, ...]' string to float list
                emb_list = [float(x.strip()) for x in raw_emb.strip("[]").split(",") if x.strip()]
            else:
                emb_list = list(raw_emb)

            result.append(
                FaceTemplateExportItem(
                    id=t["id"],
                    employee_id=t["employee_id"],
                    employee_code=emp["employee_code"],
                    display_name=emp["display_name"],
                    department=emp.get("department"),
                    pose_type=t["pose_type"],
                    embedding=emb_list,
                    image_storage_url=t.get("image_storage_url")
                )
            )
        return result
