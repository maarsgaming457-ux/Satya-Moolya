"""create marketplace listings table

Revision ID: 20260729_1230
Revises: 20260729_1200
Create Date: 2026-07-29 12:30:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260729_1230"
down_revision: str | None = "20260729_1200"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    listing_status = sa.Enum(
        "active",
        "sold",
        "removed",
        name="listing_status",
    )

    op.create_table(
        "marketplace_listings",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("device_id", sa.Uuid(), nullable=False),
        sa.Column("seller_id", sa.Uuid(), nullable=False),
        sa.Column("price", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", listing_status, nullable=False),
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
        sa.ForeignKeyConstraint(["device_id"], ["devices.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["seller_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_marketplace_listings_device_id"),
        "marketplace_listings",
        ["device_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_marketplace_listings_seller_id"),
        "marketplace_listings",
        ["seller_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_marketplace_listings_status"),
        "marketplace_listings",
        ["status"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_marketplace_listings_status"),
        table_name="marketplace_listings",
    )
    op.drop_index(
        op.f("ix_marketplace_listings_seller_id"),
        table_name="marketplace_listings",
    )
    op.drop_index(
        op.f("ix_marketplace_listings_device_id"),
        table_name="marketplace_listings",
    )
    op.drop_table("marketplace_listings")
    sa.Enum(name="listing_status").drop(op.get_bind(), checkfirst=True)
