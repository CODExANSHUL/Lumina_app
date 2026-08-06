from datetime import date
from typing import Optional

from pydantic import BaseModel


class EpisodeRequest(BaseModel):

    season_id: int

    episode_number: int

    title: str

    description: Optional[str] = None

    duration_minutes: Optional[int] = None

    thumbnail_name: Optional[str] = None

    video_url: str

    release_date: Optional[date] = None


class EpisodeResponse(EpisodeRequest):

    episode_id: int

    class Config:
        from_attributes = True