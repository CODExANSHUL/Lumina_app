from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String

from sqlalchemy.orm import relationship

from app.database import Base


class UserProfile(Base):

    __tablename__ = "user_profiles"

    profile_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id")
    )

    display_name = Column(
        String(100),
        nullable=False
    )

    avatar_name = Column(
        String(255)
    )

    language_preference = Column(
        String(30)
    )

    age_rating_preference = Column(
        String(30)
    )

    default_profile = Column(
        Boolean,
        default=False
    )

    user = relationship(
        "User",
        backref="profiles"
    )