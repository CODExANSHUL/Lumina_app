from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings

from app.routers.auth import router as auth_router
from app.routers.admin import router as admin_router
from app.routers.user import router as user_router
from app.routers.content import router as content_router
from app.routers.subscription import router as subscription_router
from app.routers.upload import router as upload_router
from app.routers.stream import router as stream_router
from app.routers import payment

from app.utils.exceptions import http_exception_handler

# ======================================================
# Create Upload Directories
# ======================================================

UPLOAD_ROOT = Path("uploads")
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)

Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.PROFILE_PHOTO_DIR).mkdir(parents=True, exist_ok=True)

# ======================================================
# FastAPI App
# ======================================================

app = FastAPI(
    title="Lumina Video Streaming API",
    description="Backend API for Lumina Video Streaming Platform",
    version="1.0.0",
)

# ======================================================
# CORS
# ======================================================

origins = [
    "http://localhost:5173",
    "https://lumina-g9ylfloot-lumina-1e0f.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================================================
# Static Files
# ======================================================

app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_ROOT),
    name="uploads",
)

# ======================================================
# Exception Handler
# ======================================================

app.add_exception_handler(
    HTTPException,
    http_exception_handler,
)

# ======================================================
# Routers
# ======================================================

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(user_router)
app.include_router(content_router)
app.include_router(subscription_router)
app.include_router(upload_router)
app.include_router(stream_router)
app.include_router(payment.router)

# ======================================================
# Health Check
# ======================================================

@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "healthy",
        "service": "Lumina Backend"
    }

# ======================================================
# Root Endpoint
# ======================================================

@app.get("/", tags=["Home"])
def home():
    return {
        "status": "running",
        "message": "Welcome to Lumina Video Streaming API",
        "docs": "/docs",
        "health": "/health",
        "version": "1.0.0"
    }