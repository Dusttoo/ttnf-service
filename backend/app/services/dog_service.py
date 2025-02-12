import json
import logging
from typing import Dict, List, Optional, Tuple, Union

from app.core.config import settings
from app.core.redis import get_redis_client
from app.models import (
    Dog,
    DogStatusAssociation,
    GenderEnum,
    HealthInfo,
    Photo,
    Production,
)
from app.models import StatusEnum as ModelStatusEnum
from app.schemas import Dog as DogSchema
from app.schemas import DogCreate, DogUpdate
from app.schemas import Production as ProductionSchema
from app.schemas import ProductionCreate
from app.utils import DateTimeEncoder
from app.utils.schema_converters import convert_to_dog_schema
from fastapi import HTTPException
from sqlalchemy import delete
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.sql import func

logger = logging.getLogger(__name__)

STATUS_MAPPING = {
    "retired": ModelStatusEnum.retired,
    "sold": ModelStatusEnum.sold,
    "stud": ModelStatusEnum.stud,
    "available": ModelStatusEnum.available,
    "active": ModelStatusEnum.active,
    "abkc_champion": ModelStatusEnum.abkc_champion,
    "production": ModelStatusEnum.production,
    "available_for_stud": ModelStatusEnum.stud,
}


def normalize_url(url: str) -> str:
    return url.strip().lower()


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
            cache_key = f"all_dogs:{page}:{page_size}:{settings.env}"
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
                    selectinload(Dog.statuses),
                )
                .order_by(Dog.dob.asc().nulls_last())
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
                cache_key, json.dumps(data, cls=DateTimeEncoder), ex=3600
            )
            return data
        except SQLAlchemyError as e:
            logger.error(f"Error in get_all_dogs: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def get_dog_by_id(self, dog_id: int, db: AsyncSession) -> Optional[DogSchema]:
        try:
            redis_client = await get_redis_client()
            cache_key = f"dog:{dog_id}:{settings.env}"
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
                    selectinload(Dog.statuses),
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

        except Exception as e:
            logger.error(f"Error in get_dog_by_id: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    from app.models.dog import StatusEnum as ModelStatusEnum

    async def create_dog(self, dog_data: DogCreate, db: AsyncSession) -> DogSchema:
        try:
            new_dog = Dog(
                name=dog_data.name,
                dob=dog_data.dob,
                gender=GenderEnum(dog_data.gender),
                color=dog_data.color,
                profile_photo=dog_data.profile_photo,
                is_production=dog_data.is_production,
                parent_male_id=dog_data.parent_male_id,
                parent_female_id=dog_data.parent_female_id,
                kennel_own=dog_data.kennel_own,
                is_retired=dog_data.is_retired,
            )

            db.add(new_dog)
            await db.flush()

            if dog_data.statuses:
                for status in dog_data.statuses:
                    model_status = ModelStatusEnum[status.name]
                    status = DogStatusAssociation(
                        dog_id=new_dog.id, status=model_status
                    )
                    db.add(status)
                await db.flush()

            new_photo = Photo(
                dog_id=new_dog.id,
                photo_url=dog_data.profile_photo,
                alt=f"{new_dog.name}",
            )
            db.add(new_photo)
            await db.flush()

            for photo_url in dog_data.gallery_photos:
                gallery_photo = Photo(
                    dog_id=new_dog.id,
                    photo_url=photo_url,
                    alt=f"{new_dog.name}",
                )
                db.add(gallery_photo)
            await db.flush()

            if new_dog.parent_male_id or new_dog.parent_female_id:
                new_production = Production(
                    name=new_dog.name,
                    dob=new_dog.dob,
                    owner="Kristen Harper - Texas Top Notch Frenchies",
                    description=new_dog.description,
                    sire_id=new_dog.parent_male_id,
                    dam_id=new_dog.parent_female_id,
                    gender=new_dog.gender,
                )
                db.add(new_production)
                await db.flush()

            if dog_data.health_infos:
                for health_info in dog_data.health_infos:
                    new_health_info = HealthInfo(
                        dog_id=new_dog.id,
                        dna=health_info.dna,
                        carrier_status=health_info.carrier_status,
                        extra_info=health_info.extra_info,
                    )
                    db.add(new_health_info)
            await db.flush()

            await db.commit()
            await db.refresh(
                new_dog,
                attribute_names=[
                    "health_infos",
                    "photos",
                    "productions",
                    "children",
                    "statuses",
                ],
            )
            new_dog_schema = convert_to_dog_schema(new_dog)
            redis_client = await self.get_redis_client()
            dog_cache_key = f"dog:{new_dog.id}:{settings.env}"
            await redis_client.set(
                dog_cache_key,
                json.dumps(new_dog_schema.dict(), cls=DateTimeEncoder),
                ex=3600,
            )
            logger.info(f"Added new dog to cache with key {dog_cache_key}")

            pattern = f"all_dogs:*"
            cache_keys = await redis_client.keys(pattern)
            for cache_key in cache_keys:
                cached_data = await redis_client.get(cache_key)
                if cached_data:
                    dogs_data = json.loads(cached_data)
                    dogs_data["items"].append(new_dog_schema.dict())
                    await redis_client.set(
                        cache_key,
                        json.dumps(dogs_data, cls=DateTimeEncoder),
                        ex=3600,
                    )
                    logger.info(f"Updated paginated list cache: {cache_key}")

            return new_dog_schema

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
                    selectinload(Dog.statuses),
                )
                .filter(Dog.id == dog_id)
            )
            dog = result.scalars().first()
            if dog:
                logger.info(f"Updating dog with ID: {dog_id}")
                print(f"\n\n\nStatuses: {dog_data.statuses}\n\n\n")
                for var, value in dog_data.dict(exclude_unset=True).items():
                    if var == "gender" and isinstance(value, str):
                        value = GenderEnum(value)
                    elif var == "statuses":
                        await db.execute(
                            delete(DogStatusAssociation).where(
                                DogStatusAssociation.dog_id == dog_id
                            )
                        )
                        for status in value:
                            model_status = ModelStatusEnum[status.name]
                            new_status = DogStatusAssociation(
                                dog_id=dog.id, status=model_status
                            )
                            db.add(new_status)
                    else:
                        setattr(dog, var, value)

                logger.info(f"Updated main attributes for dog ID: {dog_id}")
                await db.commit()

                if dog_data.profile_photo:
                    if dog.profile_photo != dog_data.profile_photo:
                        dog.profile_photo = dog_data.profile_photo
                        profile_photo = next(
                            (
                                photo
                                for photo in dog.photos
                                if photo.photo_url == dog.profile_photo
                            ),
                            None,
                        )
                        if not profile_photo:
                            new_photo = Photo(
                                dog_id=dog.id,
                                photo_url=dog_data.profile_photo,
                                alt=f"{dog.name}",
                                position=0,
                            )
                            db.add(new_photo)
                            logger.info(f"Added new profile photo for dog ID: {dog_id}")
                    await db.commit()

                # Update gallery photos (unchanged)
                if dog_data.gallery_photos:
                    gallery_photos = [
                        url
                        for url in dog_data.gallery_photos
                        if url != dog_data.profile_photo
                    ]
                    updated_gallery_photos = [
                        {
                            "photo_url": url,
                            "position": idx + 1,
                        }
                        for idx, url in enumerate(gallery_photos)
                    ]
                    existing_photos = {
                        photo.photo_url: photo
                        for photo in dog.photos
                        if photo.photo_url != dog.profile_photo
                    }
                    updated_photo_urls = set()
                    for photo_data in updated_gallery_photos:
                        photo_url = photo_data["photo_url"]
                        position = photo_data["position"]
                        updated_photo_urls.add(photo_url)
                        if photo_url in existing_photos:
                            photo = existing_photos[photo_url]
                            photo.position = position
                            logger.info(
                                f"Updated position for photo {photo_url} to {position}"
                            )
                        else:
                            new_photo = Photo(
                                dog_id=dog.id,
                                photo_url=photo_url,
                                alt=f"{dog.name}",
                                position=position,
                            )
                            db.add(new_photo)
                            logger.info(
                                f"Added new gallery photo {photo_url} at position {position} for dog ID: {dog_id}"
                            )

                    existing_photo_urls = set(existing_photos.keys())
                    photos_to_delete_urls = existing_photo_urls - updated_photo_urls
                    photos_to_delete = [
                        photo
                        for url, photo in existing_photos.items()
                        if url in photos_to_delete_urls
                    ]
                    for photo in photos_to_delete:
                        await db.delete(photo)
                        logger.info(
                            f"Deleted photo {photo.photo_url} for dog ID: {dog_id}"
                        )

                    logger.info(f"Updated gallery photos for dog ID: {dog_id}")
                    await db.commit()

                # Add or update production info (unchanged)
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
                            gender=dog.gender,
                        )
                        db.add(new_production)
                        await db.commit()
                        await db.refresh(new_production)
                        logger.info(f"Added new production for dog ID: {dog_id}")

                await db.commit()

                # Invalidate cache for this dog
                redis_client = await self.get_redis_client()
                cache_key = f"dog:{dog_id}:{settings.env}"
                await redis_client.flushall()
                logger.info(f"Invalidated cache for dog ID: {dog_id}")

                # Refresh dog with updated relations
                await db.refresh(
                    dog,
                    attribute_names=[
                        "health_infos",
                        "photos",
                        "productions",
                        "children",
                        "statuses",
                    ],
                )
                dog.photos.sort(
                    key=lambda photo: (
                        photo.position if photo.position is not None else float("inf")
                    )
                )
                updated_dog_schema = convert_to_dog_schema(dog)

                await redis_client.set(
                    cache_key,
                    json.dumps(updated_dog_schema.dict(), cls=DateTimeEncoder),
                    ex=3600,
                )

                # Update paginated lists in cache
                pattern = f"all_dogs:*"
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
                                    cache_key,
                                    json.dumps(dogs_data, cls=DateTimeEncoder),
                                    ex=3600,
                                )
                                logger.info(
                                    f"Updated dog in paginated list cache: {cache_key}"
                                )
                                break

                return updated_dog_schema
            else:
                logger.warning(f"Dog with ID: {dog_id} not found")
            return None
        except SQLAlchemyError as e:
            logger.error(f"SQLAlchemyError in update_dog: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Internal Server Error")
        except Exception as e:
            logger.error(f"Exception in update_dog: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Internal Server Error")

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
                productions = [
                    ProductionSchema(**prod) for prod in json.loads(cached_data)
                ]
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
        filters: Dict[str, Union[str, int, List[str], None]],
        page: Optional[int] = None,
        page_size: Optional[int] = None,
    ) -> Dict[str, any]:
        try:
            redis = await get_redis_client()
            cache_key = (
                f"dogs_filtered_{json.dumps(filters)}_{page}_{page_size}:{settings.env}"
            )
            cached_data = await redis.get(cache_key)

            if cached_data:
                dogs_data = json.loads(cached_data)
                dogs = [DogSchema(**dog_data) for dog_data in dogs_data["items"]]
                total_count = dogs_data["total_count"]
            else:
                query = (
                    select(Dog)
                    .options(
                        selectinload(Dog.health_infos),
                        selectinload(Dog.photos),
                        selectinload(Dog.productions),
                        selectinload(Dog.children),
                        selectinload(Dog.statuses),
                    )
                    .order_by(Dog.dob.asc().nulls_last())
                )

                filters_list = []

                if filters.get("gender"):
                    gender = filters["gender"]
                    print("gender", gender)
                    if isinstance(gender, str):
                        filters_list.append(Dog.gender == gender.lower())

                if filters.get("status"):
                    status_list = filters["status"]
                    if isinstance(status_list, list) and status_list:
                        try:
                            # Map user input to database Enum values using STATUS_MAPPING
                            status_values = [
                                STATUS_MAPPING[status.replace(" ", "_").lower()]
                                for status in status_list
                                if status.replace(" ", "_").lower() in STATUS_MAPPING
                            ]
                            if status_values:
                                query = query.join(DogStatusAssociation).filter(
                                    DogStatusAssociation.status.in_(status_values)
                                )
                        except KeyError as e:
                            logger.error(f"Invalid status provided: {e}")
                            raise HTTPException(
                                status_code=400, detail=f"Invalid status: {e}"
                            )

                if filters.get("owned") is not None:
                    owned = filters["owned"]
                    print("owned", owned)
                    if isinstance(owned, str):
                        filters_list.append(Dog.kennel_own == (owned.lower() == "true"))

                if filters.get("sire"):
                    sire = filters["sire"]
                    print("sire", sire)
                    if isinstance(sire, int):
                        filters_list.append(Dog.parent_male_id == sire)

                if filters.get("dam"):
                    dam = filters["dam"]
                    print("dam", dam)
                    if isinstance(dam, int):
                        filters_list.append(Dog.parent_female_id == dam)

                if "retired" in filters and filters["retired"] is not None:
                    print("retired", filters["retired"])
                    filters_list.append(Dog.is_retired == filters["retired"])

                query = query.filter(*filters_list)

                if page is not None and page_size is not None:
                    offset = (page - 1) * page_size
                    query = query.offset(offset).limit(page_size)
                print("query", query)

                result = await db.execute(query)
                dogs = result.scalars().all()

                total_query = select(func.count(Dog.id)).filter(*filters_list)
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
