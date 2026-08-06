import logging
from datetime import date, timedelta
import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.models.payment import Payment, PaymentStatus
from app.models.subscription import (
    Subscription,
    SubscriptionStatus,
)
from app.models.subscription_plan import SubscriptionPlan
from app.services.razorpay_service import razorpay_service

logger = logging.getLogger(__name__)


class PaymentService:

    def __init__(self, db: Session):
        self.db = db

    def create_order(
        self,
        user_id: int,
        subscription_id: int,
    ):

        subscription = (
            self.db.query(Subscription)
            .filter(
                Subscription.subscription_id == subscription_id,
                Subscription.user_id == user_id,
            )
            .first()
        )

        if subscription is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subscription not found",
            )

        plan = (
            self.db.query(SubscriptionPlan)
            .filter(
                SubscriptionPlan.plan_id == subscription.plan_id
            )
            .first()
        )

        if plan is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subscription plan not found",
            )

        amount = int(plan.price * 100)

        receipt = f"sub_{subscription.subscription_id}_{uuid.uuid4().hex[:8]}"

        order = razorpay_service.create_order(
            amount=amount,
            receipt=receipt,
        )

        payment = Payment(
            subscription_id=subscription.subscription_id,
            user_id=user_id,
            amount=plan.price,
            currency="INR",
            payment_method=None,
            payment_status=PaymentStatus.CREATED,
            transaction_id=None,
            razorpay_order_id=order["id"],
            razorpay_payment_id=None,
            razorpay_signature=None,
            receipt=receipt,
        )

        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)

        logger.info(
            "Order %s created successfully",
            order["id"],
        )

        return {
            "payment": payment,
            "order": order,
            "key": settings.RAZORPAY_KEY_ID,
        }

    def verify_payment(
        self,
        user_id: int,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str,
    ):

        payment = (
            self.db.query(Payment)
            .filter(
                Payment.razorpay_order_id == razorpay_order_id,
                Payment.user_id == user_id,
            )
            .first()
        )

        if payment is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found",
            )

        verified = razorpay_service.verify_payment(
            razorpay_order_id=razorpay_order_id,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_signature=razorpay_signature,
        )

        if not verified:

            payment.payment_status = PaymentStatus.FAILED

            self.db.commit()

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment verification failed",
            )

        payment.payment_status = PaymentStatus.SUCCESS
        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature = razorpay_signature
        payment.transaction_id = razorpay_payment_id

        self.db.commit()
        self.db.refresh(payment)

        self.activate_subscription(
            payment.subscription_id
        )

        logger.info(
            "Payment %s verified",
            razorpay_payment_id,
        )

        return payment

    def activate_subscription(
        self,
        subscription_id: int,
    ):

        subscription = (
            self.db.query(Subscription)
            .filter(
                Subscription.subscription_id == subscription_id
            )
            .first()
        )

        if subscription is None:
            return

        plan = (
            self.db.query(SubscriptionPlan)
            .filter(
                SubscriptionPlan.plan_id == subscription.plan_id
            )
            .first()
        )

        if plan is None:
            return

        today = date.today()

        subscription.start_date = today
        subscription.end_date = (
            today + timedelta(days=plan.duration_days)
        )
        subscription.subscription_status = (
            SubscriptionStatus.ACTIVE
        )

        self.db.commit()
        self.db.refresh(subscription)

        logger.info(
            "Subscription activated %s",
            subscription.subscription_id,
        )

    def get_payment_history(
        self,
        user_id: int,
    ):

        payments = (
            self.db.query(Payment)
            .filter(
                Payment.user_id == user_id
            )
            .order_by(
                Payment.created_at.desc()
            )
            .all()
        )

        return payments
