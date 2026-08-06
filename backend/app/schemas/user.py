from typing import Optional

from pydantic import BaseModel


class ProfileRequest(BaseModel):
    display_name: str
    avatar_name: Optional[str] = None
    language_preference: Optional[str] = None
    age_rating_preference: Optional[str] = None
    default_profile: bool = False


class ProfileResponse(ProfileRequest):
    profile_id: int
    user_id: int

    class Config:
        from_attributes = True