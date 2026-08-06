from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.subscription import SubscribeRequest

from app.services.subscription_service import (
    SubscriptionService
)

router = APIRouter(
    prefix="/subscriptions",
    tags=["Subscriptions"]
)


@router.get("/plans")
def plans(
    db: Session = Depends(get_db)
):
    return SubscriptionService.plans(db)


@router.get("/{user_id}/active")
def active_subscription(
    user_id: int,
    db: Session = Depends(get_db)
):
    return SubscriptionService.active_subscription(
        user_id,
        db
    )


@router.post("/{user_id}")
def subscribe(
    user_id: int,
    request: SubscribeRequest,
    db: Session = Depends(get_db)
):
    return SubscriptionService.subscribe(
        user_id,
        request,
        db
    )


@router.put("/{subscription_id}/renew")
def renew_subscription(
    subscription_id: int,
    db: Session = Depends(get_db)
):
    return SubscriptionService.renew_subscription(
        subscription_id,
        db
    )


@router.delete("/{subscription_id}")
def cancel_subscription(
    subscription_id: int,
    db: Session = Depends(get_db)
):
    return SubscriptionService.cancel_subscription(
        subscription_id,
        db
    )


@router.get("/{user_id}/history")
def subscription_history(
    user_id: int,
    db: Session = Depends(get_db)
):
    return SubscriptionService.history(
        user_id,
        db
    )