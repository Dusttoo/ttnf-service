import json
from fastapi import HTTPException
from typing import List, Optional, Dict, Tuple, Union
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql import func
from sqlalchemy.exc import SQLAlchemyError
from app.models import Dog, Production, Photo, HealthInfo, GenderEnum, StatusEnum
from app.schemas import (
    DogCreate,
    DogUpdate,
    ProductionCreate,
    Dog as DogSchema,
    Production as ProductionSchema,
)
from app.utils.schema_converters import convert_to_dog_schema
from app.core.redis import get_redis_client
import logging
from app.utils import DateTimeEncoder

logger = logging.getLogger(__name__)

STATUS_MAPPING = {
    "retired": StatusEnum.retired,
    "sold": StatusEnum.sold,
    "stud": StatusEnum.stud,
    "available": StatusEnum.available,
}

class DogService:
    def __init__(self):
        self.redis_client = None

    async def get_redis_client(self):
        if self.redis_client is None:
            self.redis_client = await get_redis_client()
        return self.redis_client

    async def get_all_dogs(
        self, page: int, page_size: int, db: AsyncSession
    ) -> Dict[str, any]:
        try:
            redis_client = await get_redis_client()
            cache_key = f"all_dogs:{page}:{page_size}"
            cached_data = await redis_client.get(cache_key)

            if cached_data:
                return json.loads(cached_data)

            offset = (page - 1) * page_size
            query = (
                select(Dog)
                .options(
                    selectinload(Dog.health_infos),
                    selectinload(Dog.photos),
                    selectinload(Dog.productions),
                    selectinload(Dog.children),
                )
                .offset(offset)
                .limit(page_size)
            )
            result = await db.execute(query)
            dogs = result.scalars().all()

            total_query = select(func.count(Dog.id))
            total_result = await db.execute(total_query)
            total_count = total_result.scalar_one()

            data = {
                "items": [convert_to_dog_schema(dog).dict() for dog in dogs],
                "total_count": total_count,
            }
            await redis_client.set(
                cache_key, json.dumps(data), ex=3600
            )  # Cache for 1 hour
            return data
        except SQLAlchemyError as e:
            logger.error(f"Error in get_all_dogs: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def get_dog_by_id(self, dog_id: int, db: AsyncSession) -> Optional[DogSchema]:
        try:
            redis_client = await get_redis_client()
            cache_key = f"dog:{dog_id}"
            cached_data = await redis_client.get(cache_key)

            if cached_data:
                return DogSchema(**json.loads(cached_data))

            result = await db.execute(
                select(Dog)
                .filter(Dog.id == dog_id)
                .options(
                    selectinload(Dog.health_infos),
                    selectinload(Dog.photos),
                    selectinload(Dog.productions),
                    selectinload(Dog.children),
                )
            )
            dog = result.scalars().first()
            dog_schema = convert_to_dog_schema(dog) if dog else None

            if dog_schema:
                await redis_client.set(
                    cache_key, dog_schema.json(), ex=3600
                )  # Cache for 1 hour

            return dog_schema
        except SQLAlchemyError as e:
            logger.error(f"Error in get_dog_by_id: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def create_dog(self, dog_data: DogCreate, db: AsyncSession) -> DogSchema:
        try:
            new_dog = Dog(
                name=dog_data.name,
                dob=dog_data.dob,
                gender=GenderEnum(dog_data.gender),
                color=dog_data.color,
                status=StatusEnum(dog_data.status),
                profile_photo=dog_data.profile_photo,
                is_production=dog_data.is_production,
                parent_male_id=dog_data.parent_male_id,
                parent_female_id=dog_data.parent_female_id,
                kennel_own=dog_data.kennel_own,
                is_retired=dog_data.is_retired,
            )
            db.add(new_dog)
            await db.commit()
            await db.refresh(new_dog)

            new_photo = Photo(
                dog_id=new_dog.id,
                photo_url=dog_data.profile_photo,
                alt=f"{new_dog.name}",
            )
            db.add(new_photo)
            await db.commit()

            for photo_url in dog_data.gallery_photos:
                gallery_photo = Photo(
                    dog_id=new_dog.id,
                    photo_url=photo_url,
                    alt=f"{new_dog.name}",
                )
                db.add(gallery_photo)
            await db.commit()

            if new_dog.parent_male_id or new_dog.parent_female_id:
                new_production = Production(
                    name=new_dog.name,
                    dob=new_dog.dob,
                    owner="Kristen Harper - Texas Top Notch Frenchies",
                    description=new_dog.description,
                    sire_id=new_dog.parent_male_id,
                    dam_id=new_dog.parent_female_id,
                    gender=new_dog.gender
                )
                db.add(new_production)
                await db.commit()
                await db.refresh(new_production)

            if dog_data.health_infos:
                new_health_info = HealthInfo(
                    dog_id=new_dog.id,
                    dna=dog_data.health_infos[0].dna,
                    carrier_status=dog_data.health_infos[0].carrier_status,
                    extra_info=dog_data.health_infos[0].extra_info,
                )
                db.add(new_health_info)
                await db.commit()
                await db.refresh(new_health_info)

            await db.refresh(
                new_dog,
                attribute_names=["health_infos", "photos", "productions", "children"],
            )
            return convert_to_dog_schema(new_dog)

        except SQLAlchemyError as e:
            logger.error(f"SQLAlchemyError in create_dog: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
        except Exception as e:
            logger.error(f"Exception in create_dog: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def update_dog(
        self, dog_id: int, dog_data: DogUpdate, db: AsyncSession
    ) -> Optional[DogSchema]:
        try:
            result = await db.execute(
                select(Dog)
                .options(
                    selectinload(Dog.health_infos),
                    selectinload(Dog.photos),
                    selectinload(Dog.productions),
                    selectinload(Dog.children),
                )
                .filter(Dog.id == dog_id)
            )
            dog = result.scalars().first()
            if dog:
                logger.info(f"Updating dog with ID: {dog_id}")

                for var, value in dog_data.dict(exclude_unset=True).items():
                    if var in ["gender", "status"] and isinstance(value, str):
                        value = GenderEnum(value) if var == "gender" else StatusEnum(value)
                    setattr(dog, var, value)

                logger.info(f"Updated main attributes for dog ID: {dog_id}")
                await db.commit()

                # Update or add profile photo
                profile_photo = next((photo for photo in dog.photos if photo.photo_url == dog.profile_photo), None)
                if profile_photo:
                    profile_photo.photo_url = dog_data.profile_photo
                    logger.info(f"Updated profile photo for dog ID: {dog_id}")
                else:
                    new_photo = Photo(
                        dog_id=dog.id,
                        photo_url=dog_data.profile_photo,
                        alt=f"{dog.name}",
                    )
                    db.add(new_photo)
                    logger.info(f"Added new profile photo for dog ID: {dog_id}")

                # Update or add gallery photos
                existing_photo_urls = [photo.photo_url for photo in dog.photos]
                new_photo_urls = [url for url in dog_data.gallery_photos if url not in existing_photo_urls]
                for photo_url in new_photo_urls:
                    gallery_photo = Photo(
                        dog_id=dog.id,
                        photo_url=photo_url,
                        alt=f"{dog.name}",
                    )
                    db.add(gallery_photo)
                logger.info(f"Updated gallery photos for dog ID: {dog_id}")

                # Add or update production info
                if dog.parent_male_id or dog.parent_female_id:
                    if dog.productions:
                        production = dog.productions[0]
                        production.name = dog.name
                        production.dob = dog.dob
                        production.owner = "Kristen Harper - Texas Top Notch Frenchies"
                        production.description = dog.description
                        production.sire_id = dog.parent_male_id
                        production.dam_id = dog.parent_female_id
                        production.gender = dog.gender
                        logger.info(f"Updated production info for dog ID: {dog_id}")
                    else:
                        new_production = Production(
                            name=dog.name,
                            dob=dog.dob,
                            owner="Kristen Harper - Texas Top Notch Frenchies",
                            description=dog.description,
                            sire_id=dog.parent_male_id,
                            dam_id=dog.parent_female_id,
                            gender=dog.gender
                        )
                        db.add(new_production)
                        await db.commit()
                        await db.refresh(new_production)
                        logger.info(f"Added new production for dog ID: {dog_id}")

                await db.commit()

                # Invalidate cache for this dog
                redis_client = await self.get_redis_client()
                cache_key = f"dog:{dog_id}"
                await redis_client.delete(cache_key)
                logger.info(f"Invalidated cache for dog ID: {dog_id}")

                await db.refresh(
                    dog,
                    attribute_names=["health_infos", "photos", "productions", "children"],
                )

                updated_dog_schema = convert_to_dog_schema(dog)

                # Update paginated lists
                pattern = "all_dogs:*"
                cache_keys = await redis_client.keys(pattern)
                for cache_key in cache_keys:
                    cached_data = await redis_client.get(cache_key)
                    if cached_data:
                        dogs_data = json.loads(cached_data)
                        for item in dogs_data["items"]:
                            if item["id"] == dog_id:
                                index = dogs_data["items"].index(item)
                                dogs_data["items"][index] = updated_dog_schema.dict()
                                await redis_client.set(
                                    cache_key, json.dumps(dogs_data, cls=DateTimeEncoder), ex=3600
                                )
                                logger.info(f"Updated dog in paginated list cache: {cache_key}")
                                break

                return updated_dog_schema
            else:
                logger.warning(f"Dog with ID: {dog_id} not found")
            return None
        except SQLAlchemyError as e:
            logger.error(f"SQLAlchemyError in update_dog: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
        except Exception as e:
            logger.error(f"Exception in update_dog: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def delete_dog(self, dog_id: int, db: AsyncSession) -> bool:
        try:
            result = await db.execute(select(Dog).filter(Dog.id == dog_id))
            dog = result.scalars().first()
            if dog:
                await db.delete(dog)
                await db.commit()

                # Invalidate cache for this dog
                redis_client = await self.get_redis_client()
                cache_key = f"dog:{dog_id}"
                await redis_client.delete(cache_key)

                return True
            return False
        except SQLAlchemyError as e:
            logger.error(f"Error in delete_dog: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def add_production_to_dog(
        self, dog_id: int, production_data: ProductionCreate, db: AsyncSession
    ) -> Optional[ProductionSchema]:
        try:
            result = await db.execute(select(Dog).filter(Dog.id == dog_id))
            dog = result.scalars().first()
            if dog:
                new_production = Production(**production_data.dict())
                dog.productions.append(new_production)
                await db.commit()
                await db.refresh(new_production)
                return new_production
            return None
        except SQLAlchemyError as e:
            logger.error(f"Error in add_production_to_dog: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def get_productions_for_dog(
        self, dog_id: int, db: AsyncSession
    ) -> List[ProductionSchema]:
        try:
            redis = await get_redis_client()
            cache_key = f"dog_productions_{dog_id}"
            cached_data = await redis.get(cache_key)

            if cached_data:
                productions = [ProductionSchema(**prod) for prod in json.loads(cached_data)]
            else:
                result = await db.execute(select(Dog).filter(Dog.id == dog_id))
                dog = result.scalars().first()
                if dog:
                    productions = [prod for prod in dog.productions]
                    await redis.set(
                        cache_key,
                        json.dumps([prod.dict() for prod in productions]),
                        ex=3600,
                    )
                else:
                    productions = []

            return productions
        except SQLAlchemyError as e:
            logger.error(f"Error in get_productions_for_dog: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def get_dogs_filtered(
        self,
        db: AsyncSession,
        filters: Dict[str, Optional[Union[str, int]]],
        page: int,
        page_size: int,
    ) -> Dict[str, any]:
        try:
            redis = await get_redis_client()
            cache_key = f"dogs_filtered_{json.dumps(filters)}_{page}_{page_size}"
            cached_data = await redis.get(cache_key)

            if cached_data:
                dogs_data = json.loads(cached_data)
                dogs = [DogSchema(**dog_data) for dog_data in dogs_data["items"]]
                total_count = dogs_data["total_count"]
            else:
                query = select(Dog).options(
                    selectinload(Dog.health_infos),
                    selectinload(Dog.photos),
                    selectinload(Dog.productions),
                    selectinload(Dog.children),
                )

                if filters.get("gender"):
                    query = query.filter(Dog.gender == filters["gender"].lower())

                if filters.get("status"):
                    statuses = filters["status"]
                    # Handle the "active" logic: map "active" to dogs that are not retired or sold or have a null status
                    if "active" in statuses:
                        query = query.filter(
                            (Dog.status == None) |  # Include dogs with null status
                            (~Dog.status.in_([StatusEnum.retired, StatusEnum.sold]))
                        )
                        statuses = [status for status in statuses if status != "active"]  # Remove "active" for further filtering

                    # If there are any other statuses after the "active" filter
                    if statuses:
                        mapped_statuses = [status.lower() for status in statuses]
                        query = query.filter(Dog.status.in_(mapped_statuses))


                if filters.get("owned"):
                    query = query.filter(
                        Dog.kennel_own == (filters["owned"].lower() == "true")
                    )
                if filters.get("sire"):
                    query = query.filter(Dog.parent_male_id == filters["sire"])
                if filters.get("dam"):
                    query = query.filter(Dog.parent_female_id == filters["dam"])

                offset = (page - 1) * page_size
                query = query.offset(offset).limit(page_size)
                result = await db.execute(query)
                dogs = result.scalars().all()

                total_query = select(func.count(Dog.id)).filter(
                    (
                        (Dog.gender == filters["gender"].lower())
                        if filters.get("gender")
                        else True
                    ),
                    (
                        Dog.status.in_(mapped_statuses)
                        if filters.get("status") and statuses
                        else True
                    ),
                    (
                        (Dog.kennel_own == (filters["owned"].lower() == "true"))
                        if filters.get("owned")
                        else True
                    ),
                    (
                        (Dog.parent_male_id == filters["sire"])
                        if filters.get("sire")
                        else True
                    ),
                    (
                        (Dog.parent_female_id == filters["dam"])
                        if filters.get("dam")
                        else True
                    ),
                )
                total_result = await db.execute(total_query)
                total_count = total_result.scalar_one()

                dogs_data = {
                    "items": [convert_to_dog_schema(dog).dict() for dog in dogs],
                    "total_count": total_count,
                }

                await redis.set(
                    cache_key, json.dumps(dogs_data, cls=DateTimeEncoder), ex=3600
                )

            return {
                "items": [DogSchema(**dog_data) for dog_data in dogs_data["items"]],
                "total_count": dogs_data["total_count"],
            }

        except SQLAlchemyError as e:
            logger.error(f"Error in get_dogs_filtered: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
        except Exception as e:
            logger.error(f"Error in get_dogs_filtered: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
