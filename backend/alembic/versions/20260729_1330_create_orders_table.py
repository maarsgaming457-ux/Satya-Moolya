"""create orders table

Revision ID: 20260729_1330
Revises: 20260729_1300
Create Date: 2026-07-29 13:30:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260729_1330"
down_revision: str | None = "20260729_1300"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    order_status = sa.Enum(
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        name="order_status",
    )

    op.create_table(
        "orders",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("listing_id", sa.Uuid(), nullable=False),
        sa.Column("buyer_id", sa.Uuid(), nullable=False),
        sa.Column("seller_id", sa.Uuid(), nullable=False),
        sa.Column("final_price", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("status", order_status, nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["listing_id"], ["marketplace_listings.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["buyer_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["seller_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_orders_listing_id"),
        "orders",
        ["listing_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_orders_buyer_id"),
        "orders",
        ["buyer_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_orders_seller_id"),
        "orders",
        ["seller_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_orders_status"),
        "orders",
        ["status"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_orders_status"),
        table_name="orders",
    )
    op.drop_index(
        op.f("ix_orders_seller_id"),
        table_name="orders",
    )
    op.drop_index(
        op.f("ix_orders_buyer_id"),
        table_name="orders",
    )
    op.drop_index(
        op.f("ix_orders_listing_id"),
        table_name="orders",
    )
    op.drop_table("orders")
    sa.Enum(name="order_status").drop(op.get_bind(), checkfirst=True)
