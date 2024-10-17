"""updated services

Revision ID: e21f4d0c9045
Revises: e5ab7e66b7fd
Create Date: 2024-10-08 23:07:19.821385
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'e21f4d0c9045'
down_revision = 'e5ab7e66b7fd'
branch_labels = None
depends_on = None


def upgrade():
    # ### Create the tags table ###
    op.create_table(
        'tags',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # ### Create the service_categories table ###
    op.create_table(
        'service_categories',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('display', sa.Boolean(), nullable=False, default=True),
        sa.Column('position', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # ### Create the services table ###
    op.create_table(
        'services',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('price', sa.String(length=50), nullable=True),
        sa.Column('availability', sa.Enum('Available', 'Limited', 'Out of Stock', name='servicestatus'), nullable=False, server_default='Available'),
        sa.Column('cta_name', sa.String(length=100), nullable=True),
        sa.Column('cta_link', sa.String(length=250), nullable=True),
        sa.Column('disclaimer', sa.Text(), nullable=True),
        sa.Column('eta', sa.DateTime(), nullable=True),
        sa.Column('estimated_price', sa.String(length=50), nullable=True),
        sa.Column('shipping_type', sa.Enum('Standard', 'Express', 'Overnight', name='shippingtype'), nullable=True),
        sa.Column('image', sa.String(length=250), nullable=True),
        sa.Column('category_id', sa.Integer(), sa.ForeignKey('service_categories.id'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # ### Create the association table for service tags ###
    op.create_table(
        'service_tags',
        sa.Column('service_id', sa.Integer(), sa.ForeignKey('services.id'), primary_key=True),
        sa.Column('tag_id', sa.Integer(), sa.ForeignKey('tags.id'), primary_key=True)
    )


def downgrade():
    # ### Drop the association table first ###
    op.drop_table('service_tags')

    # ### Drop the services table ###
    op.drop_table('services')

    # ### Drop the service_categories table ###
    op.drop_table('service_categories')

    # ### Drop the tags table ###
    op.drop_table('tags')

    # ### Drop the enums ###
    op.execute("DROP TYPE IF EXISTS servicestatus")
    op.execute("DROP TYPE IF EXISTS shippingtype")