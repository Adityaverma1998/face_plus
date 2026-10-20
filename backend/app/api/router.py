from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.superadmin import router as superadmin_router
from app.api.v1.employees import router as employees_router
from app.api.v1.attendance import router as attendance_router
from app.api.v1.sync import router as sync_router

api_router = APIRouter()

# Health Check
api_router.include_router(health_router, tags=["Health"])

# Core Tenant & Auth Routes
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(superadmin_router, prefix="/superadmin", tags=["Super Admin"])
api_router.include_router(employees_router, prefix="/employees", tags=["Employees Master"])

# Attendance Sync (Client sends offline punches here)
api_router.include_router(attendance_router, prefix="/attendance", tags=["Attendance Sync"])

# Realtime sync signal (Optional trigger to notify devices to sync)
api_router.include_router(sync_router, prefix="/sync", tags=["Realtime Sync Signal"])
