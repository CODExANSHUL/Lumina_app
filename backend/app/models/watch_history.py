from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy.sql import func

from app.database import Base


class WatchHistory(Base):
    __tablename__ = "watch_history"

    history_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    profile_id = Column(
        Integer,
        ForeignKey("user_profiles.profile_id"),
        nullable=False
    )

    video_id = Column(
        Integer,
        ForeignKey("videos.video_id"),
        nullable=False
    )

    episode_id = Column(
        Integer,
        ForeignKey("episodes.episode_id"),
        nullable=True
    )

    watched_seconds = Column(
        Integer,
        default=0
    )

    total_seconds = Column(
        Integer,
        default=0
    )

    completed = Column(
        Boolean,
        default=False
    )

    last_watched_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )