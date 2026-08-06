from fastapi import APIRouter
from fastapi import File
from fastapi import UploadFile

from app.services.file_storage_service import (
    FileStorageService
)

router = APIRouter(
    prefix="/upload",
    tags=["Uploads"]
)

# TODO(security): require authentication and ADMIN authorization for media
# uploads (profile uploads may use a narrower authenticated-user policy).


@router.post("/video")
def upload_video(
    file: UploadFile = File(...)
):

    filename = FileStorageService.upload_video(file)

    return {
        "filename": filename
    }


@router.post("/thumbnail")
def upload_thumbnail(
    file: UploadFile = File(...)
):

    filename = FileStorageService.upload_thumbnail(file)

    return {
        "filename": filename
    }


@router.post("/banner")
def upload_banner(
    file: UploadFile = File(...)
):

    filename = FileStorageService.upload_banner(file)

    return {
        "filename": filename
    }


@router.post("/profile")
def upload_profile(
    file: UploadFile = File(...)
):

    filename = FileStorageService.upload_profile(file)

    return {
        "filename": filename
    }
