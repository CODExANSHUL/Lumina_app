from sqlalchemy import Column
from sqlalchemy import Date
from sqlalchemy import Enum
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import Boolean
from app.database import Base

import enum


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"


class Subscription(Base):
    __tablename__ = "subscriptions"

    subscription_id = Column(
        Integer,
        primary_key=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id")
    )

    plan_id = Column(
        Integer,
        ForeignKey("subscription_plans.plan_id")
    )

    start_date = Column(Date)

    end_date = Column(Date)

    subscription_status = Column(
        Enum(SubscriptionStatus)
    )

    auto_renew = Column(Boolean, default=False)