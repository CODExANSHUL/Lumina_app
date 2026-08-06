import enum

from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import Date
from sqlalchemy import Enum
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String

from sqlalchemy.orm import relationship

from app.database import Base


class ContentType(str, enum.Enum):

    MOVIE = "MOVIE"

    WEB_SERIES = "WEB_SERIES"

    DOCUMENTARY = "DOCUMENTARY"

    TRAILER = "TRAILER"


class ContentStatus(str, enum.Enum):

    DRAFT = "DRAFT"

    PUBLISHED = "PUBLISHED"

    REMOVED = "REMOVED"


class AgeRating(str, enum.Enum):

    ALL = "ALL"

    KIDS = "KIDS"

    TEEN = "TEEN"

    ADULT = "ADULT"


class Video(Base):

    __tablename__ = "videos"

    video_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String(255),
        nullable=False
    )

    description = Column(
        String(5000)
    )

    content_type = Column(
        Enum(ContentType)
    )

    release_year = Column(
        Integer
    )

    duration_minutes = Column(
        Integer
    )

    language = Column(
        String(30)
    )

    age_rating = Column(
        Enum(AgeRating),
        default=AgeRating.ALL
    )

    thumbnail_name = Column(
        String(255)
    )

    banner_name = Column(
        String(255)
    )

    trailer_url = Column(
        String(500)
    )

    video_url = Column(
        String(500)
    )

    uploaded_by = Column(
        Integer,
        ForeignKey("users.user_id")
    )

    premium = Column(
        Boolean,
        default=False
    )

    featured = Column(
        Boolean,
        default=False
    )

    total_views = Column(
        Integer,
        default=0
    )

    total_likes = Column(
        Integer,
        default=0
    )

    status = Column(
        Enum(ContentStatus),
        default=ContentStatus.DRAFT
    )

    uploader = relationship("User")