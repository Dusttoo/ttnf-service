"""updated page content type

Revision ID: 842259c814e6
Revises: f251457f4d29
Create Date: 2024-09-09 18:00:39.723729

"""

from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "842259c814e6"
down_revision: Union[str, None] = "f251457f4d29"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "pages",
        "content",
        existing_type=postgresql.JSON(astext_type=sa.Text()),
        type_=sa.Text(),
        existing_nullable=False,
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column(
        "pages",
        "content",
        existing_type=sa.Text(),
        type_=postgresql.JSON(astext_type=sa.Text()),
        existing_nullable=False,
    )
    # ### end Alembic commands ###
