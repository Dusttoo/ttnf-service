import json
import logging
from typing import Dict, List, Optional

from app.core.config import settings
from app.core.redis import get_redis_client
from app.models import (
    Breeding,
    Dog,
    GenderEnum,
    Litter,
    Photo,
    Production,
    StatusEnum,
    litter_puppies,
)
from app.schemas import Litter as LitterSchema
from app.schemas import LitterCreate, LitterUpdate, PuppyCreate
from app.utils import DateTimeEncoder, convert_to_litter_schema
from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

logger = logging.getLogger(__name__)


class LitterService:

    async def get_all_litters(
        self, page: int, page_size: int, db: AsyncSession
    ) -> Dict[str, any]:
        try:
            redis_client = await get_redis_client()
            cache_key = f"all_litters:{page}:{page_size}:{settings.env}"
            cached_data = await redis_client.get(cache_key)

            if cached_data:
                return json.loads(cached_data)

            offset = (page - 1) * page_size
            query = (
                select(Litter)
                .options(
                    selectinload(Litter.puppies).options(
                        selectinload(Dog.health_infos),
                        selectinload(Dog.photos),
                        selectinload(Dog.productions).options(
                            selectinload(Production.sire), selectinload(Production.dam)
                        ),
                        selectinload(Dog.children).options(
                            selectinload(Dog.statuses),
                            selectinload(Dog.health_infos),
                            selectinload(Dog.photos),
                        ),
                        selectinload(Dog.statuses),
                    ),
                    selectinload(Litter.breeding).options(
                        selectinload(Breeding.female_dog).options(
                            selectinload(Dog.health_infos),
                            selectinload(Dog.photos),
                            selectinload(Dog.productions),
                            selectinload(Dog.children),
                            selectinload(Dog.statuses),
                        ),
                        selectinload(Breeding.male_dog).options(
                            selectinload(Dog.health_infos),
                            selectinload(Dog.photos),
                            selectinload(Dog.productions),
                            selectinload(Dog.children),
                            selectinload(Dog.statuses),
                        ),
                    ),
                )
                .offset(offset)
                .limit(page_size)
            )
            result = await db.execute(query)
            litters = result.scalars().all()

            total_count_query = select(func.count(Litter.id))
            total_count_result = await db.execute(total_count_query)
            total_count = total_count_result.scalar_one()

            data = {
                "items": [
                    convert_to_litter_schema(litter).dict() for litter in litters
                ],
                "total_count": total_count,
            }
            await redis_client.set(
                cache_key, json.dumps(data, cls=DateTimeEncoder), ex=3600
            )  # Cache for 1 hour

            return data
        except SQLAlchemyError as e:
            logger.error(f"Error in get_all_litters: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def get_litter_by_id(
        self, litter_id: int, db: AsyncSession
    ) -> Optional[LitterSchema]:
        try:
            redis_client = await get_redis_client()
            cache_key = f"litter:{litter_id}:{settings.env}"
            cached_data = await redis_client.get(cache_key)

            if cached_data:
                cached_data_dict = json.loads(cached_data)
                if isinstance(cached_data_dict.get("description"), str):
                    cached_data_dict["description"] = json.loads(
                        cached_data_dict["description"]
                    )
                return LitterSchema(**cached_data_dict)

            result = await db.execute(
                select(Litter)
                .filter(Litter.id == litter_id)
                .options(
                    selectinload(Litter.puppies).options(
                        selectinload(Dog.health_infos),
                        selectinload(Dog.photos),
                        selectinload(Dog.productions).options(
                            selectinload(Production.sire), selectinload(Production.dam)
                        ),
                        selectinload(Dog.children).options(
                            selectinload(Dog.statuses),
                            selectinload(Dog.health_infos),
                            selectinload(Dog.photos),
                        ),
                        selectinload(Dog.statuses),
                    ),
                    selectinload(Litter.breeding).options(
                        selectinload(Breeding.female_dog).options(
                            selectinload(Dog.health_infos),
                            selectinload(Dog.photos),
                            selectinload(Dog.productions),
                            selectinload(Dog.children),
                            selectinload(Dog.statuses),
                        ),
                        selectinload(Breeding.male_dog).options(
                            selectinload(Dog.health_infos),
                            selectinload(Dog.photos),
                            selectinload(Dog.productions),
                            selectinload(Dog.children),
                            selectinload(Dog.statuses),
                        ),
                    ),
                )
            )
            litter = result.scalars().first()
            litter_schema = convert_to_litter_schema(litter) if litter else None

            if litter_schema:
                await redis_client.set(
                    cache_key,
                    json.dumps(litter_schema.dict(), cls=DateTimeEncoder),
                    ex=3600,
                )  # Cache for 1 hour

            return litter_schema
        except SQLAlchemyError as e:
            logger.error(f"Error in get_litter_by_id: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def create_litter(
        self, litter_data: LitterCreate, db: AsyncSession
    ) -> LitterSchema:
        try:
            new_litter = Litter(
                breeding_id=litter_data.breeding_id,
                birth_date=litter_data.birth_date,
                number_of_puppies=litter_data.number_of_puppies,
                description=(
                    litter_data.description.dict() if litter_data.description else None
                ),
            )
            db.add(new_litter)
            await db.commit()
            await db.refresh(new_litter)

            result = await db.execute(
                select(Litter)
                .filter(Litter.id == new_litter.id)
                .options(
                    selectinload(Litter.puppies),
                    selectinload(Litter.breeding).options(
                        selectinload(Breeding.female_dog).options(
                            selectinload(Dog.health_infos),
                            selectinload(Dog.photos),
                            selectinload(Dog.productions),
                            selectinload(Dog.children),
                            selectinload(Dog.statuses),
                        ),
                        selectinload(Breeding.male_dog).options(
                            selectinload(Dog.health_infos),
                            selectinload(Dog.photos),
                            selectinload(Dog.productions),
                            selectinload(Dog.children),
                            selectinload(Dog.statuses),
                        ),
                    ),
                )
            )
            new_litter_with_relations = result.scalars().first()

            return convert_to_litter_schema(new_litter_with_relations)
        except SQLAlchemyError as e:
            logger.error(f"Error in create_litter: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def update_litter(
        self, litter_id: int, litter_data: LitterUpdate, db: AsyncSession
    ) -> Optional[LitterSchema]:
        try:
            result = await db.execute(
                select(Litter)
                .filter(Litter.id == litter_id)
                .options(
                    selectinload(Litter.puppies).options(
                        selectinload(Dog.health_infos),
                        selectinload(Dog.photos),
                        selectinload(Dog.productions).options(
                            selectinload(Production.sire), selectinload(Production.dam)
                        ),
                        selectinload(Dog.children).options(
                            selectinload(Dog.statuses),
                            selectinload(Dog.health_infos),
                            selectinload(Dog.photos),
                        ),
                    ),
                    selectinload(Litter.breeding).options(
                        selectinload(Breeding.female_dog).options(
                            selectinload(Dog.health_infos),
                            selectinload(Dog.photos),
                            selectinload(Dog.productions),
                            selectinload(Dog.children),
                            selectinload(Dog.statuses),
                        ),
                        selectinload(Breeding.male_dog).options(
                            selectinload(Dog.health_infos),
                            selectinload(Dog.photos),
                            selectinload(Dog.productions),
                            selectinload(Dog.children),
                            selectinload(Dog.statuses),
                        ),
                    ),
                )
            )
            litter = result.scalars().first()
            if litter:
                for var, value in litter_data.dict(exclude_unset=True).items():
                    setattr(litter, var, value)
                await db.commit()
                await db.refresh(litter)

                # Ensure all relationships are fully loaded
                result = await db.execute(
                    select(Litter)
                    .filter(Litter.id == litter_id)
                    .options(
                        selectinload(Litter.puppies).options(
                            selectinload(Dog.health_infos),
                            selectinload(Dog.photos),
                            selectinload(Dog.productions).options(
                                selectinload(Production.sire),
                                selectinload(Production.dam),
                            ),
                            selectinload(Dog.children).options(
                                selectinload(Dog.statuses),
                                selectinload(Dog.health_infos),
                                selectinload(Dog.photos),
                            ),
                            selectinload(Dog.statuses),
                        ),
                        selectinload(Litter.breeding).options(
                            selectinload(Breeding.female_dog).options(
                                selectinload(Dog.health_infos),
                                selectinload(Dog.photos),
                                selectinload(Dog.productions),
                                selectinload(Dog.children),
                                selectinload(Dog.statuses),
                            ),
                            selectinload(Breeding.male_dog).options(
                                selectinload(Dog.health_infos),
                                selectinload(Dog.photos),
                                selectinload(Dog.productions),
                                selectinload(Dog.children),
                                selectinload(Dog.statuses),
                            ),
                        ),
                    )
                )
                litter = result.scalars().first()

                # Convert to schema
                litter_schema = convert_to_litter_schema(litter)

                # Invalidate cache for this litter
                redis_client = await get_redis_client()
                cache_key = f"litter:{litter_id}:{settings.env}"
                await redis_client.delete(cache_key)

                # Invalidate cache for all paginated lists
                all_litters_keys = await redis_client.keys("all_litters:*")
                for key in all_litters_keys:
                    await redis_client.delete(key)

                return litter_schema
            return None
        except SQLAlchemyError as e:
            logger.error(f"Error in update_litter: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def delete_litter(self, litter_id: int, db: AsyncSession) -> bool:
        try:
            redis_client = await get_redis_client()
            result = await db.execute(select(Litter).filter(Litter.id == litter_id))
            litter = result.scalars().first()
            if litter:
                await db.delete(litter)
                await db.commit()

                cache_key = f"litter:{litter_id}:{settings.env}"
                await redis_client.delete(cache_key)

                all_litters_keys = await redis_client.keys("all_litters:*")
                for key in all_litters_keys:
                    cached_data = await redis_client.get(key)
                    if cached_data:
                        data = json.loads(cached_data)
                        if not data["items"]:
                            await redis_client.delete(key)
                    else:
                        await redis_client.delete(key)

                return True
            return False
        except SQLAlchemyError as e:
            logger.error(f"Error in delete_litter: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def get_litters_by_breeding(
        self, breeding_id: int, db: AsyncSession
    ) -> List[LitterSchema]:
        try:
            redis_client = await get_redis_client()
            cache_key = f"litters:{breeding_id}:{settings.env}"
            cached_data = await redis_client.get(cache_key)

            if cached_data:
                return [LitterSchema(**litter) for litter in json.loads(cached_data)]

            query = (
                select(Litter)
                .where(Litter.breeding_id == breeding_id)
                .options(
                    selectinload(Litter.puppies).options(
                        selectinload(Dog.health_infos),
                        selectinload(Dog.photos),
                        selectinload(Dog.productions).options(
                            selectinload(Dog.statuses),
                            selectinload(Production.sire),
                            selectinload(Production.dam),
                        ),
                        selectinload(Dog.children).options(
                            selectinload(Dog.statuses),
                            selectinload(Dog.health_infos),
                            selectinload(Dog.photos),
                        ),
                        selectinload(Dog.statuses),
                    ),
                    selectinload(Litter.breeding).options(
                        selectinload(Breeding.female_dog).options(
                            selectinload(Dog.health_infos),
                            selectinload(Dog.photos),
                            selectinload(Dog.productions),
                            selectinload(Dog.children),
                            selectinload(Dog.statuses),
                        ),
                        selectinload(Breeding.male_dog).options(
                            selectinload(Dog.health_infos),
                            selectinload(Dog.photos),
                            selectinload(Dog.productions),
                            selectinload(Dog.children),
                            selectinload(Dog.statuses),
                        ),
                    ),
                )
            )
            result = await db.execute(query)
            litters = result.scalars().all()
            litter_schemas = [convert_to_litter_schema(litter) for litter in litters]

            if litter_schemas:
                await redis_client.set(
                    cache_key,
                    json.dumps([l.dict() for l in litter_schemas], cls=DateTimeEncoder),
                    ex=3600,
                )  # Cache for 1 hour
            return litter_schemas
        except SQLAlchemyError as e:
            logger.error(f"Error in get_litters_by_breeding: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def populate_litter(
        self, db: AsyncSession, breeding_id: int, litter: LitterCreate
    ) -> Litter:
        try:
            db_litter = Litter(
                breeding_id=breeding_id,
                birth_date=litter.birth_date,
                number_of_puppies=litter.number_of_puppies,
                litter_url=litter.pedigree_url,
                description=litter.description.dict() if litter.description else None,
            )
            db.add(db_litter)
            await db.commit()
            await db.refresh(db_litter)

            # Generate default puppy objects based on the number_of_puppies
            default_puppies = []
            for i in range(litter.number_of_puppies or 0):
                new_puppy = Dog(
                    name=f"Default Puppy {i+1}",
                    dob=litter.birth_date,  # using the litter's birth_date as a placeholder
                    gender=GenderEnum.male,  # default placeholder; update later as needed
                    status=StatusEnum.available,  # default status
                )
                db.add(new_puppy)
                await db.commit()
                await db.refresh(new_puppy)
                default_puppies.append(new_puppy)
                # Associate the puppy with the litter
                await db.execute(
                    litter_puppies.insert().values(
                        litter_id=db_litter.id, dog_id=new_puppy.id
                    )
                )
            await db.commit()
            query = (
                select(Litter)
                .options(
                    # Eager load the breeding relationship and its nested relationships
                    selectinload(Litter.breeding)
                    .selectinload(Breeding.female_dog)
                    .options(
                        selectinload(Dog.health_infos),
                        selectinload(Dog.photos),
                        selectinload(Dog.productions),
                        selectinload(Dog.children),
                        selectinload(Dog.statuses),
                    ),
                    selectinload(Litter.breeding)
                    .selectinload(Breeding.male_dog)
                    .options(
                        selectinload(Dog.health_infos),
                        selectinload(Dog.photos),
                        selectinload(Dog.productions),
                        selectinload(Dog.children),
                        selectinload(Dog.statuses),
                    ),
                    # Eager load the puppies relationship and its nested relationships
                    selectinload(Litter.puppies).selectinload(Dog.statuses),
                    selectinload(Litter.puppies).selectinload(Dog.health_infos),
                    selectinload(Litter.puppies).selectinload(Dog.photos),
                    selectinload(Litter.puppies).selectinload(Dog.children),
                    selectinload(Litter.puppies).selectinload(Dog.productions),
                )
                .where(Litter.id == db_litter.id)
            )
            result = await db.execute(query)
            litter_with_relations = result.scalar_one()
            redis_client = await get_redis_client()
            litter_cache_key = f"litter:{litter_with_relations.id}:{settings.env}"
            await redis_client.delete(litter_cache_key)

            all_litters_keys = await redis_client.keys("all_litters:*")
            for key in all_litters_keys:
                await redis_client.delete(key)
            return litter_with_relations
        except SQLAlchemyError as e:
            logger.error(f"Error in populate_litter: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def add_puppies_to_litter(
        self, db: AsyncSession, litter_id: int, puppies: List[PuppyCreate]
    ):
        try:
            result = await db.execute(select(Litter).filter(Litter.id == litter_id))
            db_litter = result.scalars().first()
            if not db_litter:
                return None

            puppy_objs = []
            for puppy in puppies:
                # Create Dog instance without gallery_photos
                new_puppy = Dog(
                    name=puppy.name,
                    dob=puppy.dob,
                    gender=GenderEnum(puppy.gender),
                    color=puppy.color,
                    status=StatusEnum.available,
                    profile_photo=puppy.profile_photo,
                    is_production=True,
                    parent_male_id=puppy.parent_male_id,
                    parent_female_id=puppy.parent_female_id,
                    kennel_own=False,
                    is_retired=False,
                )
                db.add(new_puppy)
                await db.commit()
                await db.refresh(new_puppy)

                # Add gallery photos separately
                for photo_url in puppy.gallery_photos:
                    gallery_photo = Photo(
                        dog_id=new_puppy.id,
                        photo_url=photo_url,
                        alt=f"{new_puppy.name}",
                    )
                    db.add(gallery_photo)
                await db.commit()

                puppy_objs.append(new_puppy)

                await db.execute(
                    litter_puppies.insert().values(
                        litter_id=litter_id, dog_id=new_puppy.id
                    )
                )
                await db.commit()

            result = await db.execute(
                select(Litter)
                .filter(Litter.id == litter_id)
                .options(
                    selectinload(Litter.puppies).options(
                        selectinload(Dog.health_infos),
                        selectinload(Dog.photos),
                        selectinload(Dog.productions),
                        selectinload(Dog.children),
                        selectinload(Dog.statuses),
                    )
                )
            )
            db_litter = result.scalars().first()

            return puppy_objs

        except SQLAlchemyError as e:
            logger.error(f"Error in add_puppies_to_litter: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
