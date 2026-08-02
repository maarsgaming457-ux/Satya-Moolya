"""create inspection reports table

Revision ID: 20260729_1200
Revises: 20260729_1130
Create Date: 2026-07-29 12:00:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260729_1200"
down_revision: str | None = "20260729_1130"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    inspection_status = sa.Enum(
        "pending",
        "processing",
        "completed",
        "failed",
        name="inspection_status",
    )

    op.create_table(
        "inspection_reports",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("device_id", sa.Uuid(), nullable=False),
        sa.Column("status", inspection_status, nullable=False),
        sa.Column(
            "detected_defects", sa.JSON(), nullable=False
        ),
        sa.Column("inspection_summary", sa.Text(), nullable=False),
        sa.Column("estimated_price", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("trust_score", sa.Integer(), nullable=False),
        sa.Column("inspection_score", sa.Integer(), nullable=False),
        sa.Column("confidence_score", sa.Integer(), nullable=False),
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
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_inspection_reports_device_id"),
        "inspection_reports",
        ["device_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_inspection_reports_device_id"),
        table_name="inspection_reports",
    )
    op.drop_table("inspection_reports")
    sa.Enum(name="inspection_status").drop(op.get_bind(), checkfirst=True)
