import sys
from pathlib import Path

# Add backend directory to Python path for internal sub-module resolution
backend_path = Path(__file__).resolve().parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

try:
    from backend.app.main import app  # Recognized by IDE static analyzer
except ImportError:
    from app.main import app  # Fallback for direct backend folder execution

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
