"""Add admin role and tests table

Revision ID: add_admin_and_tests
Revises: 
Create Date: 2025-10-01 16:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_admin_and_tests'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add is_admin column to user table
    op.add_column('user', sa.Column('is_admin', sa.Boolean(), nullable=True))
    
    # Set default value for existing users
    op.execute("UPDATE user SET is_admin = 0 WHERE is_admin IS NULL")
    
    # Make column non-nullable
    op.alter_column('user', 'is_admin', nullable=False)
    
    # Create tests table
    op.create_table('test',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('pdf_filename', sa.String(length=255), nullable=False),
        sa.Column('pdf_path', sa.String(length=500), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('is_parsed', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    # Drop tests table
    op.drop_table('test')
    
    # Remove is_admin column
    op.drop_column('user', 'is_admin')
