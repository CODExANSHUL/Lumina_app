from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import Enum
from sqlalchemy import Integer
from sqlalchemy import String

from app.database import Base

import enum


class Role(str, enum.Enum):
    ADMIN = "ADMIN"
    USER = "USER"


class UserStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    BLOCKED = "BLOCKED"


class VerifiedStatus(str, enum.Enum):
    VERIFIED = "VERIFIED"
    UNVERIFIED = "UNVERIFIED"


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(120), nullable=False)

    email = Column(String(120), unique=True, nullable=False)

    mobile = Column(String(20), unique=True)

    password = Column(String(255), nullable=False)

    role = Column(
        Enum(Role),
        default=Role.USER,
        nullable=False
    )

    status = Column(
        Enum(UserStatus),
        default=UserStatus.ACTIVE
    )

    verified_status = Column(
        Enum(VerifiedStatus),
        default=VerifiedStatus.VERIFIED
    )

    enabled = Column(
        Boolean,
        default=True
    )