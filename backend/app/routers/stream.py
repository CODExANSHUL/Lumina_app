import os

from fastapi import APIRouter
from fastapi.responses import FileResponse
from fastapi import HTTPException

router = APIRouter(
    prefix="/stream",
    tags=["Streaming"]
)


@router.get("/{filename}")
def stream_video(filename: str):

    path = os.path.join(
        "uploads/videos",
        filename
    )

    if not os.path.exists(path):

        raise HTTPException(
            status_code=404,
            detail="Video not found"
        )

    return FileResponse(
        path,
        media_type="video/mp4"
    )