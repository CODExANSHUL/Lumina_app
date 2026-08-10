from uuid import uuid4

from supabase import create_client
from fastapi import HTTPException

from app.config import settings

supabase = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SECRET_KEY,
)


class SupabaseStorage:

    @staticmethod
    def upload(file, bucket: str):

        extension = file.filename.split(".")[-1]
        filename = f"{uuid4()}.{extension}"

        file.file.seek(0)
        data = file.file.read()

        try:
            supabase.storage.from_(bucket).upload(
                path=filename,
                file=data,
                file_options={
                    "content-type": file.content_type,
                    "upsert": "false"
                }
            )

            public_url = supabase.storage.from_(bucket).get_public_url(filename)

            return public_url

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Upload failed: {str(e)}"
            )