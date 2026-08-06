from sqlalchemy import Column
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy.sql import func
from sqlalchemy import DateTime

from app.database import Base


class Watchlist(Base):
    __tablename__ = "watchlists"

    watchlist_id = Column(
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

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )