from fastapi import HTTPException
from fastapi import UploadFile

from app.services.supabase_storage import SupabaseStorage


class FileStorageService:

    @staticmethod
    def upload_video(file: UploadFile):

        if file is None:
            raise HTTPException(
                status_code=400,
                detail="No file uploaded"
            )

        return SupabaseStorage.upload(
            file,
            "videos"
        )

    @staticmethod
    def upload_thumbnail(file: UploadFile):

        if file is None:
            raise HTTPException(
                status_code=400,
                detail="No file uploaded"
            )

        return SupabaseStorage.upload(
            file,
            "thumbnails"
        )

    @staticmethod
    def upload_banner(file: UploadFile):

        if file is None:
            raise HTTPException(
                status_code=400,
                detail="No file uploaded"
            )

        return SupabaseStorage.upload(
            file,
            "banners"
        )

    @staticmethod
    def upload_profile(file: UploadFile):

        if file is None:
            raise HTTPException(
                status_code=400,
                detail="No file uploaded"
            )

        return SupabaseStorage.upload(
            file,
            "profiles"
        )