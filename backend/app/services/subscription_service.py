from datetime import datetime
from datetime import timedelta

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.subscription import (
    Subscription,
    SubscriptionStatus
)

from app.models.subscription_plan import SubscriptionPlan

from app.schemas.subscription import SubscribeRequest


class SubscriptionService:

    # ----------------------------------
    # Available Plans
    # ----------------------------------

    @staticmethod
    def plans(db: Session):

        return db.query(
            SubscriptionPlan
        ).all()

    # ----------------------------------
    # Active Subscription
    # ----------------------------------

    @staticmethod
    def active_subscription(
        user_id: int,
        db: Session
    ):

        return db.query(
            Subscription
        ).filter(
            Subscription.user_id == user_id,
            Subscription.subscription_status == SubscriptionStatus.ACTIVE
        ).first()

    # ----------------------------------
    # Purchase Subscription
    # ----------------------------------

    @staticmethod
    def subscribe(
        user_id: int,
        request: SubscribeRequest,
        db: Session
    ):

        plan = db.query(
            SubscriptionPlan
        ).filter(
            SubscriptionPlan.plan_id == request.plan_id
        ).first()

        if plan is None:

            raise HTTPException(
                status_code=404,
                detail="Plan not found"
            )

        start = datetime.utcnow()

        end = start + timedelta(
            days=plan.duration_days
        )

        subscription = Subscription(
            user_id=user_id,
            plan_id=plan.plan_id,
            start_date=start,
            end_date=end,
            auto_renew=request.auto_renew,
            # The current enum has no PENDING state. Keep the provisional
            # subscription non-active until PaymentService.verify_payment()
            # activates it after Razorpay signature verification.
            subscription_status=SubscriptionStatus.CANCELLED
        )

        db.add(subscription)
        db.commit()
        db.refresh(subscription)

        return subscription

    # ----------------------------------
    # Cancel Subscription
    # ----------------------------------

    @staticmethod
    def cancel_subscription(
        subscription_id: int,
        db: Session
    ):

        subscription = db.query(
            Subscription
        ).filter(
            Subscription.subscription_id == subscription_id
        ).first()

        if subscription is None:

            raise HTTPException(
                status_code=404,
                detail="Subscription not found"
            )

        subscription.subscription_status = (
            SubscriptionStatus.CANCELLED
        )

        db.commit()

        return {
            "message": "Subscription cancelled"
        }

    # ----------------------------------
    # Renew Subscription
    # ----------------------------------

    @staticmethod
    def renew_subscription(
        subscription_id: int,
        db: Session
    ):

        subscription = db.query(
            Subscription
        ).filter(
            Subscription.subscription_id == subscription_id
        ).first()

        if subscription is None:

            raise HTTPException(
                status_code=404,
                detail="Subscription not found"
            )

        plan = db.query(
            SubscriptionPlan
        ).filter(
            SubscriptionPlan.plan_id == subscription.plan_id
        ).first()

        subscription.end_date += timedelta(
            days=plan.duration_days
        )

        subscription.subscription_status = (
            SubscriptionStatus.ACTIVE
        )

        db.commit()
        db.refresh(subscription)

        return subscription

    # ----------------------------------
    # Subscription History
    # ----------------------------------

    @staticmethod
    def history(
        user_id: int,
        db: Session
    ):

        return db.query(
            Subscription
        ).filter(
            Subscription.user_id == user_id
        ).all()
