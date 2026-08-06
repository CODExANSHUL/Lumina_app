from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import ForeignKey
from sqlalchemy import Enum
from sqlalchemy import Date

from app.database import Base
from app.models.video import ContentStatus


class Episode(Base):
    __tablename__ = "episodes"

    episode_id = Column(Integer, primary_key=True)

    season_id = Column(
        Integer,
        ForeignKey("seasons.season_id")
    )

    episode_number = Column(Integer)

    title = Column(String(200))

    description = Column(String(3000))

    duration_minutes = Column(Integer)

    thumbnail_name = Column(String(255))

    video_url = Column(String(500))

    release_date = Column(Date)

    status = Column(
        Enum(ContentStatus),
        default=ContentStatus.PUBLISHED
    )