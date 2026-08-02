"""Add Inspection persistence fields

Revision ID: 6e64d06552b1
Revises: 467ad9e41d1f
Create Date: 2026-08-01 14:39:45.970676
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = '6e64d06552b1'
down_revision: str | None = '467ad9e41d1f'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table('inspections', schema=None) as batch_op:
        batch_op.add_column(sa.Column('evidence_schema', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('pricing_schema', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('claim_verification_results', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('user_id', sa.Uuid(), nullable=True))
        batch_op.add_column(sa.Column('device_brand', sa.String(length=120), nullable=True))
        batch_op.add_column(sa.Column('device_model', sa.String(length=160), nullable=True))
        batch_op.add_column(sa.Column('device_storage', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('device_color', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('status', sa.String(length=50), nullable=False))
        batch_op.add_column(sa.Column('quality_metrics', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('tracking_results', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('component_detection', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('damage_detection', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('gemini_output', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('generated_files', sa.JSON(), nullable=True))
        batch_op.create_foreign_key('fk_inspections_user_id', 'users', ['user_id'], ['id'], ondelete='SET NULL')
    # ### end Alembic commands ###


def downgrade() -> None:
    with op.batch_alter_table('inspections', schema=None) as batch_op:
        batch_op.drop_constraint('fk_inspections_user_id', type_='foreignkey')
        batch_op.drop_column('generated_files')
        batch_op.drop_column('gemini_output')
        batch_op.drop_column('damage_detection')
        batch_op.drop_column('component_detection')
        batch_op.drop_column('tracking_results')
        batch_op.drop_column('quality_metrics')
        batch_op.drop_column('status')
        batch_op.drop_column('device_color')
        batch_op.drop_column('device_storage')
        batch_op.drop_column('device_model')
        batch_op.drop_column('device_brand')
        batch_op.drop_column('user_id')
        batch_op.drop_column('claim_verification_results')
        batch_op.drop_column('pricing_schema')
        batch_op.drop_column('evidence_schema')
    # ### end Alembic commands ###

