from logging.config import fileConfig
import asyncio
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlalchemy import pool
from alembic import context
from app.core.config import settings
from app.core.database import Base
from app.models import Breeding, Dog, Photo, HealthInfo, StatusEnum, GenderEnum, Production, dog_production_link
from app.models import Litter, litter_puppies, User, NavLink, Page, AnnouncementType, Announcement, CarouselImage
from app.models import WebsiteSettings, ServiceStatus, ShippingType, Tag, ServiceCategory, Service, service_tags
from app.models import WaitlistEntry

# this is the Alembic Config object, which provides access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here for 'autogenerate' support
target_metadata = Base.metadata

# Set SQLALCHEMY_DATABASE_URL from settings
SQLALCHEMY_DATABASE_URL = settings.sqlalchemy_database_url
config.set_main_option("sqlalchemy.url", SQLALCHEMY_DATABASE_URL)


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = create_async_engine(
        config.get_main_option("sqlalchemy.url"),
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
