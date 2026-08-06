from sqlalchemy import Column
from sqlalchemy import Enum
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String

from app.database import Base

import enum


class ReviewStatus(str, enum.Enum):
    VISIBLE = "VISIBLE"
    HIDDEN = "HIDDEN"


class Review(Base):
    __tablename__ = "reviews"

    review_id = Column(Integer, primary_key=True)

    profile_id = Column(
        Integer,
        ForeignKey("user_profiles.profile_id")
    )

    video_id = Column(
        Integer,
        ForeignKey("videos.video_id")
    )

    rating = Column(Integer)

    comment = Column(String(3000))

    status = Column(
        Enum(ReviewStatus),
        default=ReviewStatus.VISIBLE
    )