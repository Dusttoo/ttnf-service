"""Add many-to-many relationship for dog statuses

Revision ID: 959126f83342
Revises: 0befc4378d86
Create Date: 2024-11-13 03:19:08.117063

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ENUM

# revision identifiers, used by Alembic.
revision: str = '959126f83342'
down_revision: Union[str, None] = '0befc4378d86'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Reference the existing type
status_enum_type = ENUM(
    'available', 'sold', 'stud', 'retired', 'active', 'abkc_champion', 
    name='statusenum', 
    create_type=False  # Ensure it doesn't attempt to create the type again
)

def upgrade() -> None:
    # Ensure the StatusEnum type exists in the database
    op.execute("""
    DO $$ 
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'statusenum') THEN
            CREATE TYPE statusenum AS ENUM ('available', 'sold', 'stud', 'retired', 'active', 'abkc_champion');
        END IF;
    END$$;
    """)

    # Create the association table with existing type
    op.create_table(
        'dog_status_association',
        sa.Column('dog_id', sa.Integer(), nullable=False),
        sa.Column('status', status_enum_type, nullable=False),
        sa.ForeignKeyConstraint(['dog_id'], ['dogs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('dog_id', 'status')
    )

def downgrade() -> None:
    # Drop the association table
    op.drop_table('dog_status_association')