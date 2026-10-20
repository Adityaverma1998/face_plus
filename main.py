import sys
from pathlib import Path

# Add backend directory to Python path for sub-module resolution
backend_path = Path(__file__).resolve().parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

try:
    from backend.app.main import app
except ImportError:
    from app.main import app  # type: ignore[import-not-found]
