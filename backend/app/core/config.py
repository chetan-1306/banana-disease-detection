import os


def _env(name: str, default: str) -> str:
    val = os.getenv(name)
    return val if val is not None and val != "" else default


BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))  # backend/

# Model
MODEL_PATH = _env(
    "MODEL_PATH",
    os.path.join(BASE_DIR, "models", "banana_disease_model.h5"),
)

# API
ALLOWED_ORIGINS = [
    o.strip()
    for o in _env(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:5173,http://localhost:8081",
    ).split(",")
    if o.strip()
]

MAX_UPLOAD_BYTES = int(_env("MAX_UPLOAD_BYTES", str(8 * 1024 * 1024)))  # 8MB

