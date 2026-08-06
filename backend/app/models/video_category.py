from sqlalchemy import Column
from sqlalchemy import ForeignKey
from sqlalchemy import Integer

from app.database import Base


class VideoCategory(Base):
    __tablename__ = "video_categories"

    id = Column(Integer, primary_key=True, index=True)

    video_id = Column(
        Integer,
        ForeignKey("videos.video_id"),
        nullable=False
    )

    category_id = Column(
        Integer,
        ForeignKey("categories.category_id"),
        nullable=False
    )