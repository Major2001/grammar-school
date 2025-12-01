"""Add answers column to exam table

Revision ID: a1b2c3d4e5f6
Revises: fb20eeb780e4
Create Date: 2025-12-01 09:22:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'fb20eeb780e4'
branch_labels = None
depends_on = None


def upgrade():
    # Add answers column to exam table
    # Using JSON type for SQLite (which stores as TEXT)
    op.add_column('exam', sa.Column('answers', sqlite.JSON(), nullable=True))


def downgrade():
    # Remove answers column from exam table
    op.drop_column('exam', 'answers')

