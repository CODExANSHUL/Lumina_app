from sqlalchemy import Column
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.sql import func
from sqlalchemy import DateTime

from app.database import Base


class VideoShare(Base):
    __tablename__ = "video_shares"

    share_id = Column(
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

    platform = Column(
        String(50)
    )

    share_url = Column(
        String(500)
    )

    shared_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )