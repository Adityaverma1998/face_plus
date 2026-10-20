import json
from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from supabase import Client
from app.api.deps import require_company_admin, get_supabase
from app.schemas.auth import UserClaims
from app.schemas.biometrics import FaceTemplateResponse
from app.services.biometrics_service import BiometricsService

router = APIRouter()

@router.post("/enroll", response_model=FaceTemplateResponse, status_code=status.HTTP_201_CREATED, summary="Enroll Face Biometrics")
async def enroll_face(
    employee_id: str = Form(..., description="Target employee UUID"),
    pose_type: str = Form("frontal", description="Pose: frontal, left_turn, right_turn, tilt_up, tilt_down"),
    embedding: str = Form(..., description="JSON serialized array of 192 float numbers"),
    image: Optional[UploadFile] = File(None, description="Optional face photo for audit"),
    current_user: UserClaims = Depends(require_company_admin),
    db: Client = Depends(get_supabase)
):
    """
    Enrolls or updates a 192-dimensional face vector template for an employee.
    Optionally uploads face image to Supabase Storage.
    """
    try:
        embedding_list = json.loads(embedding)
        if not isinstance(embedding_list, list):
            raise ValueError("Embedding must be a JSON array")
        embedding_floats = [float(x) for x in embedding_list]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid embedding format. Expected JSON array of 192 floats: {str(e)}"
        )
    
    image_bytes = None
    image_filename = None
    if image:
        image_bytes = await image.read()
        image_filename = image.filename

    return BiometricsService.enroll_face(
        company_id=current_user.company_id,
        employee_id=employee_id,
        pose_type=pose_type,
        embedding=embedding_floats,
        image_bytes=image_bytes,
        image_filename=image_filename,
        db=db
    )
