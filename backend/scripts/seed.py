import logging
import json
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from app.core.database import Base
from app.models import (
    User,
    Dog,
    Production,
    HealthInfo,
    Photo,
    Breeding,
    Litter,
    Page,
    NavLink,
)
from app.models import GenderEnum, StatusEnum
from app.core.config import settings
from sqlalchemy import text
from scripts.page_data import default_page_data
import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_URL = settings.sqlalchemy_database_url

# Create the async engine and session factory
engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

dog_name_to_id = {}

async def create_session():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database connected and session created.")
    except SQLAlchemyError as e:
        logger.error("Error connecting to the database: %s", e)
        raise


async def is_table_seeded(session, model):
    result = await session.execute(text(f"SELECT COUNT(1) FROM {model.__tablename__}"))
    count = result.scalar_one_or_none()
    return count > 0 if count is not None else False


async def seed_data():
    async with SessionLocal() as session:
        try:
            # Seed Users
            if not await is_table_seeded(session, User):
                try:
                    users = [
                        User(
                            username="kharper",
                            email="kharper16@gmail.com",
                            phone_number="9037809969",
                            first_name="Kelsey",
                            last_name="Harper",
                            avatar_url="https://via.placeholder.com/150",
                            company="Harper Breeding Co.",
                        ),
                        User(
                            username="admin",
                            email="dusty.mumphrey@gmail.com",
                            phone_number="4304355503",
                            first_name="Dusty",
                            last_name="Mumphrey",
                            avatar_url="https://via.placeholder.com/150",
                            company="Admin Co.",
                        ),
                    ]

                    # Set passwords
                    users[0].set_password("kharper16")
                    users[1].set_password("Mushu!0621")

                    session.add_all(users)
                    await session.commit()
                    logger.info("Users seeded successfully.")
                except Exception as e:
                    logger.error(f"Error seeding Users: {e}")
                    await session.rollback()
                else:
                    logger.info("Users table already seeded. Skipping...")

            # Read JSON data from file
            with open("seed_data.json", "r") as file:
                data = json.load(file)

            # Seed Dogs
            if not await is_table_seeded(session, Dog):
                try:
                    dogs_data = data["dogs"]
                    for dog in dogs_data:
                        status_value = dog.get("status", "")
                        status_enum = (
                            StatusEnum[status_value]
                            if status_value in StatusEnum.__members__
                            else None
                        )

                        new_dog = Dog(
                            name=dog["name"],
                            description=dog.get("description", ""),
                            profile_photo=dog.get("profile_photo", None),
                            dob=dog.get("dob", None),
                            gender=GenderEnum[dog["gender"].lower()],
                            color=dog.get("color", None),
                            status=status_enum,
                            stud_fee=dog.get("stud_fee", None),
                            sale_fee=dog.get("sale_fee", None),
                            pedigree_link=dog.get("pedigree_link", None),
                            video_url=dog.get("video_url", None),
                            parent_male_id=None,
                            parent_female_id=None,
                            is_production=dog.get("is_production", False),
                            kennel_own=dog.get("kennel_own", True),
                            is_retired=dog.get("is_retired", False),
                        )
                        session.add(new_dog)
                        await session.flush()
                        dog_name_to_id[dog["name"]] = new_dog.id

                    # Set parent relationships
                    for dog in dogs_data:
                        if "parent_male_name" in dog or "parent_female_name" in dog:
                            dog_id = dog_name_to_id[dog["name"]]
                            parent_male_id = dog_name_to_id.get(dog.get("parent_male_name"))
                            parent_female_id = dog_name_to_id.get(dog.get("parent_female_name"))
                            await session.execute(
                                session.query(Dog)
                                .filter_by(id=dog_id)
                                .update(
                                    {
                                        "parent_male_id": parent_male_id,
                                        "parent_female_id": parent_female_id,
                                    }
                                )
                            )

                    await session.commit()
                    logger.info("Dogs seeded successfully.")
                except Exception as e:
                    logger.error(f"Error seeding Dogs: {e}")
                    await session.rollback()
            else:
                logger.info("Dogs table already seeded. Skipping...")

            # Seed Health Info
            if not await is_table_seeded(session, HealthInfo):
                try:
                    health_infos_data = data["health_infos"]
                    for info in health_infos_data:
                        dog_id = dog_name_to_id.get(info["dog_name"])
                        if dog_id:
                            new_health_info = HealthInfo(
                                dog_id=dog_id,
                                dna=info.get("dna", ""),
                                carrier_status=info.get("carrier_status", ""),
                                extra_info=info.get("extra_info", ""),
                            )
                            session.add(new_health_info)
                        else:
                            logger.warning(
                                f"Dog name '{info['dog_name']}' not found in dogs list. Health info not added."
                            )

                    await session.commit()
                    logger.info("Health infos seeded successfully.")
                except Exception as e:
                    logger.error(f"Error seeding Health Info: {e}")
                    await session.rollback()
            else:
                logger.info("HealthInfo table already seeded. Skipping...")

            # Seed Photos
            if not await is_table_seeded(session, Photo):
                try:
                    photos_data = data["photos"]
                    for photo in photos_data:
                        dog_id = dog_name_to_id.get(photo["dog_name"])
                        if dog_id:
                            new_photo = Photo(
                                dog_id=dog_id,
                                photo_url=photo.get("photo_url", ""),
                                alt=photo.get("alt", ""),
                            )
                            session.add(new_photo)
                        else:
                            logger.warning(
                                f"Dog name '{photo['dog_name']}' not found in dogs list. Photo not added."
                            )

                    await session.commit()
                    logger.info("Photos seeded successfully.")
                except Exception as e:
                    logger.error(f"Error seeding Photos: {e}")
                    await session.rollback()
            else:
                logger.info("Photos table already seeded. Skipping...")

            # Seed Breedings
            if not await is_table_seeded(session, Breeding):
                try:
                    breedings_data = data["breedings"]
                    for breed in breedings_data:
                        female_dog_id = dog_name_to_id.get(breed.get("female_dog_name"))
                        male_dog_id = dog_name_to_id.get(breed.get("male_dog_name"))

                        if female_dog_id and male_dog_id:
                            new_breeding = Breeding(
                                female_dog_id=female_dog_id,
                                male_dog_id=male_dog_id,
                                breeding_date=breed.get("breeding_date"),
                                expected_birth_date=breed.get("expected_birth_date"),
                                description=breed.get("description", ""),
                            )
                            session.add(new_breeding)
                        else:
                            if not female_dog_id:
                                logger.warning(
                                    f"Female dog name '{breed.get('female_dog_name')}' not found in dogs list. Breeding not added."
                                )
                            if not male_dog_id:
                                logger.warning(
                                    f"Male dog name '{breed.get('male_dog_name')}' not found in dogs list. Breeding not added."
                                )

                    await session.commit()
                    logger.info("Breedings seeded successfully.")
                except Exception as e:
                    logger.error(f"Error seeding Breedings: {e}")
                    await session.rollback()
            else:
                logger.info("Breedings table already seeded. Skipping...")

            # Seed Productions
            if not await is_table_seeded(session, Production):
                try:
                    productions_data = data["productions"]
                    for prod in productions_data:
                        sire_id = dog_name_to_id.get(prod.get("sire_name"))
                        dam_id = dog_name_to_id.get(prod.get("dam_name"))

                        associated_dogs = [
                            session.query(Dog).filter_by(name=name).first()
                            for name in prod.get("dog_names", [])
                            if name in dog_name_to_id
                        ]

                        new_production = Production(
                            name=prod["name"],
                            description=prod.get("description", ""),
                            owner=prod.get("owner", ""),
                            sire_id=sire_id,
                            dam_id=dam_id,
                            gender=GenderEnum[prod["gender"].lower()],
                            profile_photo=prod.get("profile_photo", ""),
                            dogs=associated_dogs,
                        )
                        session.add(new_production)

                    await session.commit()
                    logger.info("Productions seeded successfully.")
                except Exception as e:
                    logger.error(f"Error seeding Productions: {e}")
                    await session.rollback()
            else:
                logger.info("Productions table already seeded. Skipping...")

            # Seed Pages
            if not await is_table_seeded(session, Page):
                try:
                    for page_data in default_page_data:
                        new_page = Page(
                            id=page_data["id"],
                            type=page_data["type"],
                            name=page_data["name"],
                            slug=page_data["slug"],
                            meta=page_data["meta"],
                            content=page_data["content"],
                            status=page_data["status"],
                            is_locked=page_data["is_locked"],
                            tags=page_data["tags"],
                            language=page_data["language"],
                            created_at=datetime.datetime.fromisoformat(page_data["created_at"]),
                            published_at=datetime.datetime.fromisoformat(page_data["published_at"]),
                        )
                        session.add(new_page)

                    await session.commit()
                    logger.info("Pages seeded successfully.")
                except Exception as e:
                    logger.error(f"Error seeding Pages: {e}")
                    await session.rollback()
            else:
                logger.info("Pages table already seeded. Skipping...")
            # Seed NavLinks
            if not await is_table_seeded(session, NavLink):
                try:
                    nav_links_data = [
                        {
                            "title": "Home",
                            "slug": "home",
                            "editable": True,
                            "parent_title": None,
                            "position": 1,
                        },
                        {
                            "title": "Dogs",
                            "slug": "dogs",
                            "editable": False,
                            "parent_title": None,
                            "position": 2,
                        },
                        {
                            "title": "Males",
                            "slug": "males",
                            "editable": False,
                            "parent_title": "Dogs",
                            "position": 1,
                        },
                        {
                            "title": "Females",
                            "slug": "females",
                            "editable": False,
                            "parent_title": "Dogs",
                            "position": 2,
                        },
                        {
                            "title": "Available",
                            "slug": "available",
                            "editable": False,
                            "parent_title": None,
                            "position": 3,
                        },
                        {
                            "title": "Breedings",
                            "slug": "breedings",
                            "editable": False,
                            "parent_title": "Available",
                            "position": 1,
                        },
                        {
                            "title": "Litters",
                            "slug": "litters",
                            "editable": False,
                            "parent_title": "Available",
                            "position": 2,
                        },
                        {
                            "title": "Productions",
                            "slug": "productions",
                            "editable": False,
                            "parent_title": None,
                            "position": 4,
                        },
                        {
                            "title": "About",
                            "slug": "about",
                            "editable": True,
                            "parent_title": None,
                            "position": 5,
                        },
                        {
                            "title": "Our Services",
                            "slug": "our-services",
                            "editable": True,
                            "parent_title": None,
                            "position": 6,
                        },
                        {
                            "title": "Contact",
                            "slug": "contact",
                            "editable": True,
                            "parent_title": None,
                            "position": 7,
                        },
                    ]

                    nav_title_to_id = {}
                    for nav_data in nav_links_data:
                        parent_id = (
                            nav_title_to_id.get(nav_data["parent_title"])
                            if nav_data["parent_title"]
                            else None
                        )
                        new_nav_link = NavLink(
                            title=nav_data["title"],
                            slug=nav_data["slug"],
                            editable=nav_data["editable"],
                            parent_id=parent_id,
                            position=nav_data["position"],
                        )
                        session.add(new_nav_link)
                        await session.flush()  # Get the ID of the newly added nav link
                        nav_title_to_id[nav_data["title"]] = new_nav_link.id

                    await session.commit()
                    logger.info("NavLinks seeded successfully.")
                except Exception as e:
                    logger.error(f"Error seeding NavLinks: {e}")
                    await session.rollback()
            else:
                logger.info("NavLinks table already seeded. Skipping...")

        except SQLAlchemyError as e:
            logger.error("Error in seed_data: %s", e)
            await session.rollback()
        except Exception as general_e:
            logger.error("General error occurred: %s", general_e)
            await session.rollback()

if __name__ == "__main__":
    import asyncio

    loop = asyncio.get_event_loop()
    loop.run_until_complete(create_session())
    loop.run_until_complete(seed_data())
    loop.close()
    logger.info("Seed data process completed.")
