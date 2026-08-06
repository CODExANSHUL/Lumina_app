from typing import Optional

from pydantic import BaseModel


class SeasonRequest(BaseModel):
    video_id: int
    season_number: int
    title: str
    description: Optional[str] = None
    release_year: Optional[int] = None


class SeasonResponse(SeasonRequest):
    season_id: int

    class Config:
        from_attributes = True