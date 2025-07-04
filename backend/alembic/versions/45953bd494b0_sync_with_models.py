from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from google.protobuf.service import Service

from app.models import GenderEnum, ShippingType, ServiceStatus
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '45953bd494b0'
down_revision: Union[str, None] = 'e21f4d0c9045'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('waitlist_entries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('gender_preference', postgresql.ENUM(GenderEnum, create_type=False), nullable=True),
        sa.Column('color_preference', sa.String(length=255), nullable=True),
        sa.Column('sire_id', sa.Integer(), nullable=True),
        sa.Column('dam_id', sa.Integer(), nullable=True),
        sa.Column('additional_info', sa.Text(), nullable=True),
        sa.Column('breeding_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['breeding_id'], ['breedings.id'], ),
        sa.ForeignKeyConstraint(['dam_id'], ['dogs.id'], ),
        sa.ForeignKeyConstraint(['sire_id'], ['dogs.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_waitlist_entries_id'), 'waitlist_entries', ['id'], unique=False)
    op.create_table('service_categories',
        sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('service_categories_id_seq'::regclass)"), autoincrement=True, nullable=False),
        sa.Column('name', sa.VARCHAR(length=100), autoincrement=False, nullable=False),
        sa.Column('display', sa.BOOLEAN(), autoincrement=False, nullable=False),
        sa.Column('position', sa.INTEGER(), autoincrement=False, nullable=False),
        sa.PrimaryKeyConstraint('id', name='service_categories_pkey'),
        postgresql_ignore_search_path=False
    )
    op.create_table('services',
        sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('services_id_seq'::regclass)"), autoincrement=True, nullable=False),
        sa.Column('name', sa.VARCHAR(length=150), autoincrement=False, nullable=False),
        sa.Column('description', sa.TEXT(), autoincrement=False, nullable=False),
        sa.Column('price', sa.VARCHAR(length=50), autoincrement=False, nullable=True),
        sa.Column('availability', postgresql.ENUM(ServiceStatus, create_type=False), server_default=sa.text("'AVAILABLE'::servicestatus"), autoincrement=False, nullable=False),
        sa.Column('cta_name', sa.VARCHAR(length=100), autoincrement=False, nullable=True),
        sa.Column('cta_link', sa.VARCHAR(length=250), autoincrement=False, nullable=True),
        sa.Column('disclaimer', sa.TEXT(), autoincrement=False, nullable=True),
        sa.Column('eta', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
        sa.Column('estimated_price', sa.VARCHAR(length=50), autoincrement=False, nullable=True),
        sa.Column('shipping_type', postgresql.ENUM(ShippingType, create_type=False), autoincrement=False, nullable=True),
        sa.Column('image', sa.VARCHAR(length=250), autoincrement=False, nullable=True),
        sa.Column('category_id', sa.INTEGER(), autoincrement=False, nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['service_categories.id'], name='services_category_id_fkey'),
        sa.PrimaryKeyConstraint('id', name='services_pkey'),
        postgresql_ignore_search_path=False
    )
    op.create_table('tags',
                    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
                    sa.Column('name', sa.VARCHAR(length=50), autoincrement=False, nullable=False),
                    sa.PrimaryKeyConstraint('id', name='tags_pkey')
                )
    op.create_table('service_tags',
        sa.Column('service_id', sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column('tag_id', sa.INTEGER(), autoincrement=False, nullable=False),
        sa.ForeignKeyConstraint(['service_id'], ['services.id'], name='service_tags_service_id_fkey'),
        sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], name='service_tags_tag_id_fkey'),
        sa.PrimaryKeyConstraint('service_id', 'tag_id', name='service_tags_pkey')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('tags')
    op.drop_table('service_tags')
    op.drop_table('services')
    op.drop_table('service_categories')
    op.drop_index(op.f('ix_waitlist_entries_id'), table_name='waitlist_entries')
    op.drop_table('waitlist_entries')
    # ### end Alembic commands ###