import enum

from sqlalchemy import Column
from sqlalchemy import Enum
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.sql import func
from sqlalchemy import DateTime

from app.database import Base


class CommonStatus(str, enum.Enum):

    ACTIVE = "ACTIVE"

    INACTIVE = "INACTIVE"


class Category(Base):

    __tablename__ = "categories"

    category_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    category_name = Column(
        String(100),
        unique=True,
        nullable=False
    )

    description = Column(
        String(500)
    )

    status = Column(
        Enum(CommonStatus),
        default=CommonStatus.ACTIVE
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )