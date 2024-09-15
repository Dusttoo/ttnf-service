"""fix status enum

Revision ID: 22094e69643a
Revises: 7b212726d35a
Create Date: 2024-09-15 15:44:32.230806

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '22094e69643a'
down_revision: Union[str, None] = '7b212726d35a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Define the correct StatusEnum with lowercase 'active'
correct_status_enum = postgresql.ENUM('available', 'sold', 'stud', 'retired', 'active', name='statusenum')

def upgrade() -> None:
    # First, change the status column to VARCHAR temporarily
    op.execute("ALTER TABLE dogs ALTER COLUMN status TYPE VARCHAR")

    # Then, drop the old enum type
    op.execute("DROP TYPE statusenum")

    # Recreate the enum with the correct 'active' value
    correct_status_enum.create(op.get_bind())

    # Convert the column back to the enum
    op.execute("ALTER TABLE dogs ALTER COLUMN status TYPE statusenum USING status::statusenum")


def downgrade() -> None:
    # First, change the status column back to VARCHAR temporarily
    op.execute("ALTER TABLE dogs ALTER COLUMN status TYPE VARCHAR")

    # Drop the corrected enum type
    op.execute("DROP TYPE statusenum")

    # Recreate the original enum with 'Active'
    op.execute("CREATE TYPE statusenum AS ENUM('available', 'sold', 'stud', 'retired', 'Active')")

    # Convert the column back to the old enum
    op.execute("ALTER TABLE dogs ALTER COLUMN status TYPE statusenum USING status::statusenum")