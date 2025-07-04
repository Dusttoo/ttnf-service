"""added global updated at

Revision ID: ae2f6cf9fb81
Revises: 1800297b99eb
Create Date: 2024-09-17 20:20:53.576484

"""

from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "ae2f6cf9fb81"
down_revision: Union[str, None] = "1800297b99eb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "announcements",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column(
            "date",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column(
            "category",
            sa.Enum(
                "LITTER",
                "BREEDING",
                "STUD",
                "ANNOUNCEMENT",
                "SERVICE",
                "INFO",
                name="announcementtype",
            ),
            nullable=False,
        ),
        sa.Column("page_id", sa.UUID(), nullable=True),
        sa.ForeignKeyConstraint(
            ["page_id"],
            ["pages.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_announcements_id"), "announcements", ["id"], unique=False)
    op.add_column("pages", sa.Column("carousel", sa.JSON(), nullable=True))
    op.drop_column("pages", "invalid_block_types")
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        "pages",
        sa.Column(
            "invalid_block_types",
            postgresql.JSON(astext_type=sa.Text()),
            autoincrement=False,
            nullable=True,
        ),
    )
    op.drop_column("pages", "carousel")
    op.drop_index(op.f("ix_announcements_id"), table_name="announcements")
    op.drop_table("announcements")
    # ### end Alembic commands ###
