from sqlalchemy import Column
from sqlalchemy import Enum
from sqlalchemy import Float
from sqlalchemy import Integer
from sqlalchemy import String

from app.database import Base
from app.models.category import CommonStatus

import enum


class VideoQuality(str, enum.Enum):
    SD = "SD"
    HD = "HD"
    FULL_HD = "FULL_HD"
    UHD = "UHD"


class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    plan_id = Column(Integer, primary_key=True)

    plan_name = Column(String(100))

    description = Column(String(500))

    price = Column(Float)

    duration_days = Column(Integer)

    max_screens = Column(Integer)

    video_quality = Column(
        Enum(VideoQuality)
    )

    status = Column(
        Enum(CommonStatus),
        default=CommonStatus.ACTIVE
    )