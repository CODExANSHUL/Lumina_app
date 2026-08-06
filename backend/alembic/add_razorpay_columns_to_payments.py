"""Add Razorpay columns to payments

Revision ID: add_razorpay_columns
Revises: <previous_revision_id>
Create Date: 2026-07-29

"""

from alembic import op
import sqlalchemy as sa


# Replace these values with your actual Alembic IDs
revision = "add_razorpay_columns"
down_revision = "<previous_revision_id>"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "payments",
        sa.Column("currency", sa.String(length=10), nullable=False, server_default="INR"),
    )

    op.add_column(
        "payments",
        sa.Column("receipt", sa.String(length=150), nullable=False),
    )

    op.add_column(
        "payments",
        sa.Column("razorpay_order_id", sa.String(length=150), nullable=False),
    )

    op.add_column(
        "payments",
        sa.Column("razorpay_payment_id", sa.String(length=150), nullable=True),
    )

    op.add_column(
        "payments",
        sa.Column("razorpay_signature", sa.String(length=255), nullable=True),
    )

    op.add_column(
        "payments",
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    op.add_column(
        "payments",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    op.create_index(
        "ix_payments_user_id",
        "payments",
        ["user_id"],
        unique=False,
    )

    op.create_unique_constraint(
        "uq_payments_razorpay_order_id",
        "payments",
        ["razorpay_order_id"],
    )

    op.create_unique_constraint(
        "uq_payments_razorpay_payment_id",
        "payments",
        ["razorpay_payment_id"],
    )


def downgrade():
    op.drop_constraint(
        "uq_payments_razorpay_payment_id",
        "payments",
        type_="unique",
    )

    op.drop_constraint(
        "uq_payments_razorpay_order_id",
        "payments",
        type_="unique",
    )

    op.drop_index(
        "ix_payments_user_id",
        table_name="payments",
    )

    op.drop_column("payments", "updated_at")
    op.drop_column("payments", "created_at")
    op.drop_column("payments", "razorpay_signature")
    op.drop_column("payments", "razorpay_payment_id")
    op.drop_column("payments", "razorpay_order_id")
    op.drop_column("payments", "receipt")
    op.drop_column("payments", "currency")