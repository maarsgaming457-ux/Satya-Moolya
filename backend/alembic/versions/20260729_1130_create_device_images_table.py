"""create device images table

Revision ID: 20260729_1130
Revises: 20260729_1100
Create Date: 2026-07-29 11:30:00
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260729_1130"
down_revision: str | None = "20260729_1100"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "device_images",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("device_id", sa.Uuid(), nullable=False),
        sa.Column("image_url", sa.String(length=2048), nullable=False),
        sa.Column("storage_path", sa.String(length=1024), nullable=False),
        sa.Column("image_order", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["device_id"], ["devices.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("device_id", "image_order", name="uq_device_images_order"),
    )
    op.create_index(
        op.f("ix_device_images_device_id"),
        "device_images",
        ["device_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_device_images_storage_path"),
        "device_images",
        ["storage_path"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_device_images_storage_path"), table_name="device_images")
    op.drop_index(op.f("ix_device_images_device_id"), table_name="device_images")
    op.drop_table("device_images")
