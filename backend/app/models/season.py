from sqlalchemy import Column
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Enum

from app.database import Base

import enum


class CommonStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class Season(Base):
    __tablename__ = "seasons"

    season_id = Column(Integer, primary_key=True)

    video_id = Column(
        Integer,
        ForeignKey("videos.video_id"),
        nullable=False
    )

    season_number = Column(Integer)

    title = Column(String(200))

    description = Column(String(1000))

    release_year = Column(Integer)

    status = Column(
        Enum(CommonStatus),
        default=CommonStatus.ACTIVE
    )