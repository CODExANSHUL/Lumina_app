from typing import List
from typing import Optional

from pydantic import BaseModel

from app.models.video import AgeRating
from app.models.video import ContentStatus
from app.models.video import ContentType


class VideoRequest(BaseModel):

    title: str

    description: Optional[str] = None

    content_type: ContentType

    release_year: Optional[int] = None

    duration_minutes: Optional[int] = None

    language: Optional[str] = None

    age_rating: Optional[AgeRating] = AgeRating.ALL

    thumbnail_name: Optional[str] = None

    banner_name: Optional[str] = None

    trailer_url: Optional[str] = None

    video_url: Optional[str] = None

    status: Optional[ContentStatus] = ContentStatus.DRAFT

    category_ids: Optional[List[int]] = []


class VideoResponse(VideoRequest):

    video_id: int

    uploaded_by: int

    class Config:
        from_attributes = True