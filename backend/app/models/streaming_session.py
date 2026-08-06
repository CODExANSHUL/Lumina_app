import enum

from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Enum
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.sql import func

from app.database import Base


class SessionStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    ENDED = "ENDED"


class StreamingSession(Base):
    __tablename__ = "streaming_sessions"

    session_id = Column(
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

    episode_id = Column(
        Integer,
        ForeignKey("episodes.episode_id"),
        nullable=True
    )

    device_name = Column(String(100))

    ip_address = Column(String(50))

    session_status = Column(
        Enum(SessionStatus),
        default=SessionStatus.ACTIVE
    )

    started_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    ended_at = Column(
        DateTime(timezone=True),
        nullable=True
    )