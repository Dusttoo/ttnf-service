import json
import logging
from typing import Dict, List, Optional

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.redis import get_redis_client
from app.models import Breeding, Dog
from app.schemas import BreedingCreate, BreedingUpdate
from app.utils import DateTimeEncoder
from app.utils.schema_converters import convert_to_breeding_schema

logger = logging.getLogger(__name__)


class BreedingService:
    async def get_all_breedings(
        self, page: int, page_size: int, db: AsyncSession
    ) -> Dict[str, any]:
        try:
            redis_client = await get_redis_client()
            cache_key = f"all_breedings:{page}:{page_size}"
            cached_data = await redis_client.get(cache_key)

            if cached_data:
                return json.loads(cached_data)

            offset = (page - 1) * page_size
            query = (
                select(Breeding)
                .options(
                    selectinload(Breeding.female_dog).options(
                        selectinload(Dog.health_infos),
                        selectinload(Dog.photos),
                        selectinload(Dog.productions),
                        selectinload(Dog.children),
                    ),
                    selectinload(Breeding.male_dog).options(
                        selectinload(Dog.health_infos),
                        selectinload(Dog.photos),
                        selectinload(Dog.productions),
                        selectinload(Dog.children),
                    ),
                )
                .offset(offset)
                .limit(page_size)
            )
            result = await db.execute(query)
            breedings = result.scalars().all()

            total_count_query = select(func.count(Breeding.id))
            total_count_result = await db.execute(total_count_query)
            total_count = total_count_result.scalar_one()

            data = {
                "items": [
                    convert_to_breeding_schema(breeding).dict()
                    for breeding in breedings
                ],
                "total_count": total_count,
            }
            await redis_client.set(
                cache_key,
                json.dumps(data, cls=DateTimeEncoder),
                ex=3600,  # Cache for 1 hour
            )
            return data
        except SQLAlchemyError as e:
            logger.error(f"Error in get_all_breedings: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def get_breeding_by_id(
        self, breeding_id: int, db: AsyncSession
    ) -> Optional[Breeding]:
        try:
            redis_client = await get_redis_client()
            cache_key = f"breeding:{breeding_id}"
            cached_data = await redis_client.get(cache_key)

            if cached_data:
                return json.loads(cached_data)

            result = await db.execute(
                select(Breeding)
                .options(
                    selectinload(Breeding.female_dog).options(
                        selectinload(Dog.health_infos),
                        selectinload(Dog.photos),
                        selectinload(Dog.productions),
                        selectinload(Dog.children),
                    ),
                    selectinload(Breeding.male_dog).options(
                        selectinload(Dog.health_infos),
                        selectinload(Dog.photos),
                        selectinload(Dog.productions),
                        selectinload(Dog.children),
                    ),
                )
                .filter(Breeding.id == breeding_id)
            )
            breeding = result.scalars().first()
            breeding_schema = convert_to_breeding_schema(breeding) if breeding else None

            if breeding_schema:
                await redis_client.set(
                    cache_key,
                    json.dumps(breeding_schema.dict(), cls=DateTimeEncoder),
                    ex=3600,  # Cache for 1 hour
                )

            return breeding_schema
        except SQLAlchemyError as e:
            logger.error(f"Error in get_breeding_by_id: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def create_breeding(
        self, breeding_data: BreedingCreate, db: AsyncSession
    ) -> Breeding:
        try:
            new_breeding = Breeding(**breeding_data.dict())
            db.add(new_breeding)
            await db.commit()
            await db.refresh(new_breeding)

            await db.refresh(new_breeding, attribute_names=["female_dog", "male_dog"])

            return new_breeding
        except SQLAlchemyError as e:
            logger.error(f"Error in create_breeding: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def update_breeding(
        self, breeding_id: int, breeding_data: BreedingUpdate, db: AsyncSession
    ) -> Optional[Breeding]:
        try:
            result = await db.execute(
                select(Breeding).filter(Breeding.id == breeding_id)
            )
            breeding = result.scalars().first()
            if breeding:
                for var, value in breeding_data.dict(exclude_unset=True).items():
                    setattr(breeding, var, value)
                await db.commit()
                await db.refresh(breeding, attribute_names=["female_dog", "male_dog"])
                return breeding
            return None
        except SQLAlchemyError as e:
            logger.error(f"Error in update_breeding: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def delete_breeding(self, breeding_id: int, db: AsyncSession) -> bool:
        try:
            result = await db.execute(
                select(Breeding).filter(Breeding.id == breeding_id)
            )
            breeding = result.scalars().first()
            if breeding:
                await db.delete(breeding)
                await db.commit()
                return True
            return False
        except SQLAlchemyError as e:
            logger.error(f"Error in delete_breeding: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def get_breedings_by_parent(
        self, parent_id: int, db: AsyncSession
    ) -> List[Breeding]:
        try:
            query = (
                select(Breeding)
                .options(
                    selectinload(Breeding.female_dog).options(
                        selectinload(Dog.health_infos),
                        selectinload(Dog.photos),
                        selectinload(Dog.productions),
                        selectinload(Dog.children),
                    ),
                    selectinload(Breeding.male_dog).options(
                        selectinload(Dog.health_infos),
                        selectinload(Dog.photos),
                        selectinload(Dog.productions),
                        selectinload(Dog.children),
                    ),
                )
                .filter(
                    (Breeding.female_dog_id == parent_id)
                    | (Breeding.male_dog_id == parent_id)
                )
            )
            result = await db.execute(query)
            return result.scalars().all()
        except SQLAlchemyError as e:
            logger.error(f"Error in get_breedings_by_parent: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
