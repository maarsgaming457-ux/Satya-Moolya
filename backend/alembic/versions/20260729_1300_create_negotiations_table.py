"""create negotiations table

Revision ID: 20260729_1300
Revises: 20260729_1230
Create Date: 2026-07-29 13:00:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260729_1300"
down_revision: str | None = "20260729_1230"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "negotiations",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("listing_id", sa.Uuid(), nullable=False),
        sa.Column("buyer_id", sa.Uuid(), nullable=False),
        sa.Column("offered_price", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column(
            "suggested_counter_offer", sa.Numeric(precision=12, scale=2), nullable=False
        ),
        sa.Column("acceptance_probability", sa.Integer(), nullable=False),
        sa.Column("negotiation_summary", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["listing_id"], ["marketplace_listings.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["buyer_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_negotiations_listing_id"),
        "negotiations",
        ["listing_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_negotiations_buyer_id"),
        "negotiations",
        ["buyer_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_negotiations_buyer_id"),
        table_name="negotiations",
    )
    op.drop_index(
        op.f("ix_negotiations_listing_id"),
        table_name="negotiations",
    )
    op.drop_table("negotiations")
