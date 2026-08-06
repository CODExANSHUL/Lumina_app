from typing import Optional

from pydantic import BaseModel

from app.models.payment import PaymentMethod


class SubscribeRequest(BaseModel):
    plan_id: int
    payment_method: Optional[PaymentMethod] = PaymentMethod.UPI
    auto_renew: bool = False


class SubscriptionPlanRequest(BaseModel):
    plan_name: str
    description: str
    price: float
    duration_days: int
    max_screens: int = 1
    video_quality: str = "HD"