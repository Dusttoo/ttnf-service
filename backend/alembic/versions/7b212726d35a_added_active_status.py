from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '7b212726d35a'
down_revision = 'cbe3d49d8595'
branch_labels = None
depends_on = None

# Define the old and new StatusEnum
old_status_enum = postgresql.ENUM('available', 'sold', 'stud', 'retired', name='statusenum')
new_status_enum = postgresql.ENUM('available', 'sold', 'stud', 'retired', 'active', name='statusenum')

def upgrade() -> None:
    # Add the new 'active' value to the StatusEnum in PostgreSQL
    op.execute("ALTER TYPE statusenum ADD VALUE 'active'")

def downgrade() -> None:
    # Downgrade logic in PostgreSQL does not support removing enum values,
    # so usually, you should be careful when downgrading an enum with new values.
    # However, if necessary, you can recreate the enum without the 'active' value.

    # First, drop any constraints or dependencies on the 'statusenum' column.
    op.execute("""
        ALTER TABLE dogs ALTER COLUMN status TYPE VARCHAR;
        DROP TYPE statusenum;
    """)

    # Recreate the original enum without 'active'
    old_status_enum.create(op.get_bind(), checkfirst=False)

    # Convert the column back to the old enum
    op.execute("""
        ALTER TABLE dogs ALTER COLUMN status TYPE statusenum USING status::statusenum;
    """)