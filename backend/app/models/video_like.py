from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import ForeignKey
from sqlalchemy import Integer

from app.database import Base


class VideoLike(Base):
    __tablename__ = "video_likes"

    like_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    profile_id = Column(
        Integer,
        ForeignKey("user_profiles.profile_id")
    )

    video_id = Column(
        Integer,
        ForeignKey("videos.video_id")
    )

    liked = Column(
        Boolean,
        default=True
    )