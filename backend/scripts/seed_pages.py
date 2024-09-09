import logging
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from app.core.database import Base
from app.models.page import Page
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_URL = (
    "postgresql://ttnf_app:password123!@ttnf.postgres.database.azure.com:5432/ttnf"
)

def create_session(database_url: str):
    try:
        engine = create_engine(database_url)
        Base.metadata.create_all(bind=engine)
        session = Session(bind=engine)
        logger.info("Database connected and session created.")
        return session
    except SQLAlchemyError as e:
        logger.error("Error connecting to the database: %s", e)
        raise


def seed_pages(session: Session):
    try:
        # Define the initial pages
        pages = [
            Page(
                title="Landing Page",
                slug="landing",
                editable=True,
            ),
            Page(
                title="About Page",
                slug="about",
                editable=True,
            ),
            Page(
                title="Males Page",
                slug="males",
                editable=False,
            ),
            Page(
                title="Females Page",
                slug="females",
                editable=False,
            ),
            Page(
                title="Breeding Page",
                slug="breedings",
                editable=False,
            ),
            Page(
                title="Litter Page",
                slug="litters",
                editable=False,
            ),
            Page(
                title="Productions Page",
                slug="productions",
                editable=False,
            ),
        ]

        # Add pages to the session
        session.add_all(pages)
        session.commit()
        logger.info("Pages seeded successfully.")
    except SQLAlchemyError as e:
        logger.error("Error seeding pages: %s", e)
        session.rollback()
    finally:
        session.close()


if __name__ == "__main__":
    session = create_session(DATABASE_URL)
    seed_pages(session)
    logger.info("Page seeding process completed.")
