from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CreateOrderRequest(BaseModel):
    subscription_id: int


class CreateOrderResponse(BaseModel):
    success: bool
    order_id: str
    amount: int
    currency: str
    key: str


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentResponse(BaseModel):
    payment_id: int
    subscription_id: int
    user_id: int
    amount: float
    currency: str
    payment_status: str
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    razorpay_order_id: str
    razorpay_payment_id: Optional[str] = None
    receipt: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class VerifyPaymentResponse(BaseModel):
    success: bool
    message: str


class PaymentHistoryResponse(BaseModel):
    payments: list[PaymentResponse]