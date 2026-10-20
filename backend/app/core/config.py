import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings:
    PROJECT_NAME: str = "FacePulse API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    STORAGE_BUCKET_NAME: str = os.getenv("STORAGE_BUCKET_NAME", "employee-faces")
    
    # JWT Authentication
    JWT_SECRET: str = os.getenv("JWT_SECRET", "facepulse-production-jwt-secret-key-32chars-min")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24 * 7))) # 7 days
    
    # Biometrics Specification
    EMBEDDING_DIMENSION: int = 192  # MobileFaceNet 192-dim vector
    
    # CORS
    _default_cors = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "https://face-plus.vercel.app",
        "*",
    ]
    _env_cors = os.getenv("CORS_ORIGINS", "")
    CORS_ORIGINS: list[str] = (
        [origin.strip() for origin in _env_cors.split(",") if origin.strip()]
        if _env_cors
        else _default_cors
    )

settings = Settings()
