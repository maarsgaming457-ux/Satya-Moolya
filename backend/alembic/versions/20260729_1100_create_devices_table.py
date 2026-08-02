"""create devices table

Revision ID: 20260729_1100
Revises: 20260729_1027
Create Date: 2026-07-29 11:00:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260729_1100"
down_revision: str | None = "20260729_1027"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    device_status = sa.Enum(
        "draft",
        "pending_inspection",
        "inspected",
        "listed",
        "sold",
        name="device_status",
    )

    op.create_table(
        "devices",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("owner_id", sa.Uuid(), nullable=False),
        sa.Column("brand", sa.String(length=120), nullable=False),
        sa.Column("model", sa.String(length=160), nullable=False),
        sa.Column("category", sa.String(length=120), nullable=False),
        sa.Column("serial_number", sa.String(length=120), nullable=True),
        sa.Column("purchase_year", sa.Integer(), nullable=False),
        sa.Column("condition", sa.String(length=80), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("status", device_status, nullable=False),
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
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_devices_owner_id"), "devices", ["owner_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_devices_owner_id"), table_name="devices")
    op.drop_table("devices")
    sa.Enum(name="device_status").drop(op.get_bind(), checkfirst=True)
