import enum

from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Enum
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.sql import func

from app.database import Base


class NotificationType(str, enum.Enum):
    SUBSCRIPTION = "SUBSCRIPTION"
    SYSTEM = "SYSTEM"


class NotificationStatus(str, enum.Enum):
    UNREAD = "UNREAD"
    READ = "READ"


class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id")
    )

    notification_type = Column(
        Enum(NotificationType)
    )

    message = Column(
        String(500)
    )

    status = Column(
        Enum(NotificationStatus),
        default=NotificationStatus.UNREAD
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )