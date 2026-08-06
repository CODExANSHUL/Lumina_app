import os
import shutil
import uuid

from fastapi import HTTPException
from fastapi import UploadFile

from app.config import settings


class FileStorageService:

    @staticmethod
    def _save_file(file: UploadFile, directory: str):

        if file is None:
            raise HTTPException(
                status_code=400,
                detail="No file uploaded"
            )

        os.makedirs(directory, exist_ok=True)

        extension = os.path.splitext(file.filename)[1]

        filename = f"{uuid.uuid4()}{extension}"

        filepath = os.path.join(
            directory,
            filename
        )

        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer
            )

        return filename

    @staticmethod
    def upload_video(file: UploadFile):

        return FileStorageService._save_file(
            file,
            settings.UPLOAD_DIR
        )

    @staticmethod
    def upload_thumbnail(file: UploadFile):

        return FileStorageService._save_file(
            file,
            "uploads/thumbnails"
        )

    @staticmethod
    def upload_banner(file: UploadFile):

        return FileStorageService._save_file(
            file,
            "uploads/banners"
        )

    @staticmethod
    def upload_profile(file: UploadFile):

        return FileStorageService._save_file(
            file,
            settings.PROFILE_PHOTO_DIR
        )