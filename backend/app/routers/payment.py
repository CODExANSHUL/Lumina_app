from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User

from app.schemas.payment import (
    CreateOrderRequest,
    CreateOrderResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse,
    PaymentHistoryResponse,
    PaymentResponse,
)

from app.services.payment_service import PaymentService

router = APIRouter(
    prefix="/payment",
    tags=["Payment"],
)

@router.post(
    "/create-order",
    response_model=CreateOrderResponse,
)
def create_order(
    request: CreateOrderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = PaymentService(db)

    result = service.create_order(
        user_id=current_user.user_id,
        subscription_id=request.subscription_id,
    )

    return CreateOrderResponse(
        success=True,
        order_id=result["order"]["id"],
        amount=result["order"]["amount"],
        currency=result["order"]["currency"],
        key=result["key"],
    )

@router.post(
    "/verify",
    response_model=VerifyPaymentResponse,
)
def verify_payment(
    request: VerifyPaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = PaymentService(db)

    service.verify_payment(
        user_id=current_user.user_id,
        razorpay_order_id=request.razorpay_order_id,
        razorpay_payment_id=request.razorpay_payment_id,
        razorpay_signature=request.razorpay_signature,
    )

    return VerifyPaymentResponse(
        success=True,
        message="Payment verified successfully",
    )

@router.get(
    "/history",
    response_model=PaymentHistoryResponse,
)
def payment_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    service = PaymentService(db)

    payments = service.get_payment_history(
        current_user.user_id
    )

    return PaymentHistoryResponse(
        payments=[
            PaymentResponse.model_validate(payment)
            for payment in payments
        ]
    )