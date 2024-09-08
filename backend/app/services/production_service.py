from fastapi import HTTPException
from typing import List, Optional, Tuple, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import SQLAlchemyError
from app.models import Production, dog_production_link, GenderEnum
from app.schemas import ProductionCreate, ProductionUpdate
from app.utils import convert_to_production_schema
from app.core.redis import get_redis_client
import logging
import json
from app.utils import DateTimeEncoder

logger = logging.getLogger(__name__)


class ProductionService:
    async def get_all_productions(
        self, page: int, page_size: int, db: AsyncSession
    ) -> Dict[str, any]:
        try:
            redis_client = await get_redis_client()
            cache_key = f"all_productions:{page}:{page_size}"
            cached_data = await redis_client.get(cache_key)

            if cached_data:
                return json.loads(cached_data)

            offset = (page - 1) * page_size
            query = (
                select(Production)
                .offset(offset)
                .limit(page_size)
                .options(selectinload(Production.dogs))
            )
            result = await db.execute(query)
            productions = result.scalars().all()

            total_count_query = select(func.count(Production.id))
            total_count_result = await db.execute(total_count_query)
            total_count = total_count_result.scalar_one()

            data = {
                "items": [convert_to_production_schema(production).dict() for production in productions],
                "total_count": total_count,
            }
            await redis_client.set(cache_key, json.dumps(data, cls=DateTimeEncoder), ex=3600)  # Cache for 1 hour
            return data
        except SQLAlchemyError as e:
            logger.error(f"Error in get_all_productions: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def get_production_by_id(
        self, production_id: int, db: AsyncSession
    ) -> Optional[Production]:
        try:
            redis_client = await get_redis_client()
            cache_key = f"production:{production_id}"
            cached_data = await redis_client.get(cache_key)

            if cached_data:
                return Production(**json.loads(cached_data))

            result = await db.execute(
                select(Production)
                .filter(Production.id == production_id)
                .options(selectinload(Production.dogs))
            )
            production = result.scalars().first()
            production_schema = (
                convert_to_production_schema(production) if production else None
            )

            if production_schema:
                await redis_client.set(
                    cache_key, production_schema.json(), ex=3600
                )  # Cache for 1 hour

            return production_schema
        except SQLAlchemyError as e:
            logger.error(f"Error in get_production_by_id: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def create_production(
        self, production_data: ProductionCreate, db: AsyncSession
    ) -> Production:
        try:
            new_production = Production(
                name=production_data.name,
                owner=production_data.owner,
                dob=production_data.dob,
                description=production_data.description,
                sire_id=production_data.sire_id,
                dam_id=production_data.dam_id,
                gender=GenderEnum(production_data.gender),
                profile_photo=production_data.profile_photo,
            )
            db.add(new_production)
            await db.commit()
            await db.refresh(new_production)
            return new_production
        except SQLAlchemyError as e:
            logger.error(f"SQLAlchemyError in create_dog: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
        except Exception as e:
            logger.error(f"Exception in create_dog: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def update_production(
        self, production_id: int, production_data: ProductionUpdate, db: AsyncSession
    ) -> Optional[Production]:
        try:
            result = await db.execute(
                select(Production).filter(Production.id == production_id)
            )
            production = result.scalars().first()
            if production:
                for var, value in production_data.dict(exclude_unset=True).items():
                    setattr(production, var, value)
                await db.commit()
                await db.refresh(production)
                return production
            return None
        except SQLAlchemyError as e:
            logger.error(f"Error in update_production: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def delete_production(self, production_id: int, db: AsyncSession) -> bool:
        try:
            result = await db.execute(
                select(Production).filter(Production.id == production_id)
            )
            production = result.scalars().first()
            if production:
                await db.delete(production)
                await db.commit()
                return True
            return False
        except SQLAlchemyError as e:
            logger.error(f"Error in delete_production: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def get_productions_by_parent(
        self, parent_id: int, db: AsyncSession
    ) -> List[Production]:
        try:
            query = (
                select(Production)
                .join(dog_production_link)
                .filter(
                    (dog_production_link.c.dog_id == parent_id)
                    & (dog_production_link.c.production_id == Production.id)
                )
            ).options(selectinload(Production.dogs))
            result = await db.execute(query)
            return result.scalars().all()
        except SQLAlchemyError as e:
            logger.error(f"Error in get_productions_by_parent: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
