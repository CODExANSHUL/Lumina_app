from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine

from app.routers.auth import router as auth_router
from app.routers.admin import router as admin_router
from app.routers.user import router as user_router
from app.routers.content import router as content_router
from app.routers.subscription import router as subscription_router
from app.routers.upload import router as upload_router
from app.routers.stream import router as stream_router
from app.routers import payment
from app.utils.exceptions import http_exception_handler

# Create upload directories if they don't exist
UPLOAD_ROOT = Path("uploads")
UPLOAD_ROOT.mkdir(exist_ok=True)

Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.PROFILE_PHOTO_DIR).mkdir(parents=True, exist_ok=True)

# Create FastAPI application
app = FastAPI(
    title="Video Streaming API",
    version="1.0.0"
)

# Development-only browser origin. Keep production origins explicit and never
# combine wildcard origins with credentialed requests.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://lumina-app-cg5b.onrender.com/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
# Base.metadata.create_all(bind=engine)

# Mount uploads folder
app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_ROOT),
    name="uploads",
)

# Register exception handler
app.add_exception_handler(
    HTTPException,
    http_exception_handler,
)

# Register routers
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(user_router)
app.include_router(content_router)
app.include_router(subscription_router)
app.include_router(upload_router)
app.include_router(stream_router)
app.include_router(payment.router)

# Home endpoint
@app.get("/")
def home():
    return {
        "message": "Video Streaming API Running"
    }