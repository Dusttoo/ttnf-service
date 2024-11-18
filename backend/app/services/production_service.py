import json
import logging
from typing import Dict, List, Optional, Tuple

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.redis import get_redis_client
from app.models import GenderEnum, Production, dog_production_link
from app.schemas import ProductionCreate, ProductionUpdate, GenderEnum as GenderEnumSchema
from app.utils import DateTimeEncoder, convert_to_production_schema
from app.core.config import settings    

logger = logging.getLogger(__name__)


class ProductionService:
    async def get_all_productions(
        self,
        page: int,
        page_size: int,
        db: AsyncSession,
        gender: Optional[GenderEnumSchema] = None,
        sire: Optional[int] = None,
        dam: Optional[int] = None,
        order_by: Optional[str] = "name",
    ) -> Dict[str, any]:
        try:
            if gender:
                try:
                    gender = GenderEnum[gender.upper()]
                except KeyError:
                    raise HTTPException(status_code=400, detail="Invalid gender value")

            redis_client = await get_redis_client()
            cache_key = f"all_productions:{page}:{page_size}:{gender}:{sire}:{dam}:{settings.env}"
            cached_data = await redis_client.get(cache_key)

            if cached_data:
                return json.loads(cached_data)

            offset = (page - 1) * page_size

            # Map order_by parameter to columns
            order_by_mapping = {
                "name": Production.name,
                "gender": Production.gender,
                "sire_id": Production.sire_id,
                "dam_id": Production.dam_id,
            }

            order_by_column = order_by_mapping.get(order_by, Production.name)

            # Build the base query
            query = select(Production)

            # Apply filters if present
            if gender:
                query = query.where(Production.gender == gender)
            if sire:
                query = query.where(Production.sire_id == sire)
            if dam:
                query = query.where(Production.dam_id == dam)

            # Add ordering, limit, and offset
            query = query.order_by(order_by_column).offset(offset).limit(page_size)

            # Execute the query and fetch the results
            results = await db.execute(query)
            productions = results.scalars().all()

            # Fetch the total count for pagination metadata
            count_query = select(func.count(Production.id))
            if gender:
                count_query = count_query.where(Production.gender == gender)
            if sire:
                count_query = count_query.where(Production.sire_id == sire)
            if dam:
                count_query = count_query.where(Production.dam_id == dam)

            total_count = (await db.execute(count_query)).scalar_one()

            data = {
                "items": [convert_to_production_schema(production).dict() for production in productions],
                "total_count": total_count
            }

            await redis_client.set(cache_key, json.dumps(data, cls=DateTimeEncoder), ex=3600)
            # Return results with metadata
            return {
                "items": productions,
                "total_count": total_count,
                "page": page,
                "page_size": page_size,
            }
            

        except SQLAlchemyError as e:
            logging.error(f"Error in get_all_productions: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")


    async def get_production_by_id(
        self, production_id: int, db: AsyncSession
    ) -> Optional[Production]:
        try:
            redis_client = await get_redis_client()
            cache_key = f"production:{production_id}:{settings.env}"
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
            print(f'\n\n\n{production_schema}\n\n\n')

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

            redis_client = await get_redis_client()
            cache_key = f"production:{new_production.id}:{settings.env}"
            production_schema = convert_to_production_schema(new_production)
            await redis_client.set(cache_key, production_schema.json(), ex=3600)

            paginated_cache_prefix = f"all_productions:*:{settings.env}"
            for key in await redis_client.keys(paginated_cache_prefix):
                await redis_client.delete(key)

            return new_production
        except SQLAlchemyError as e:
            logger.error(f"SQLAlchemyError in create_production: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
        except Exception as e:
            logger.error(f"Exception in create_production: {str(e)}", exc_info=True)
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

                redis_client = await get_redis_client()
                cache_key = f"production:{production_id}:{settings.env}"
                paginated_cache_prefix = f"all_productions:*:{settings.env}"

                production_schema = convert_to_production_schema(production)
                await redis_client.set(cache_key, production_schema.json(), ex=3600)

                for key in await redis_client.keys(paginated_cache_prefix):
                    await redis_client.delete(key)

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

                redis_client = await get_redis_client()
                cache_key = f"production:{production_id}:{settings.env}"
                await redis_client.delete(cache_key)
                
                paginated_cache_prefix = f"all_productions:*:{settings.env}"
                for key in await redis_client.keys(paginated_cache_prefix):
                    await redis_client.delete(key)

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
