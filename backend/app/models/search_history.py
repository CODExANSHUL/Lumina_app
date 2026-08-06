from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.sql import func

from app.database import Base


class SearchHistory(Base):
    __tablename__ = "search_history"

    search_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    profile_id = Column(
        Integer,
        ForeignKey("user_profiles.profile_id")
    )

    search_text = Column(
        String(255),
        nullable=False
    )

    searched_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )