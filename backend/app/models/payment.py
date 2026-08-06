from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Enum
from sqlalchemy import Float
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.sql import func

from app.database import Base

import enum


class PaymentMethod(str, enum.Enum):
    CARD = "CARD"
    UPI = "UPI"
    NETBANKING = "NETBANKING"
    WALLET = "WALLET"
    EMI = "EMI"


class PaymentStatus(str, enum.Enum):
    CREATED = "CREATED"
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"
    REFUNDED = "REFUNDED"


class Payment(Base):
    __tablename__ = "payments"

    payment_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    subscription_id = Column(
        Integer,
        ForeignKey("subscriptions.subscription_id"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False,
        index=True
    )

    amount = Column(
        Float,
        nullable=False
    )

    currency = Column(
        String(10),
        default="INR",
        nullable=False
    )

    payment_method = Column(
        Enum(PaymentMethod),
        nullable=True
    )

    payment_status = Column(
        Enum(PaymentStatus),
        default=PaymentStatus.CREATED,
        nullable=False
    )

    transaction_id = Column(
        String(150),
        unique=True,
        nullable=True
    )

    razorpay_order_id = Column(
        String(150),
        unique=True,
        nullable=False
    )

    razorpay_payment_id = Column(
        String(150),
        unique=True,
        nullable=True
    )

    razorpay_signature = Column(
        String(255),
        nullable=True
    )

    receipt = Column(
        String(150),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )