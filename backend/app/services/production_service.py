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
        gender: Optional[GenderEnumSchema] = None,  # Accept gender as an optional string
        sire: Optional[int] = None,
        dam: Optional[int] = None,
    ) -> Dict[str, any]:
        try:
            if gender:
                try:
                    gender = GenderEnum[gender.lower()]
                except KeyError:
                    raise HTTPException(status_code=400, detail="Invalid gender value")

            redis_client = await get_redis_client()
            cache_key = f"all_productions:{page}:{page_size}:{gender}:{sire}:{dam}:{settings.env}"
            cached_data = await redis_client.get(cache_key)

            if cached_data:
                return json.loads(cached_data)

            offset = (page - 1) * page_size
            query = select(Production).offset(offset).limit(page_size).options(selectinload(Production.dogs))

            # Apply filters dynamically if provided
            if gender:
                query = query.filter(Production.gender == gender)
            if sire:
                query = query.filter(Production.sire_id == sire)
            if dam:
                query = query.filter(Production.dam_id == dam)

            result = await db.execute(query)
            productions = result.scalars().all()

            # Count with filters applied
            total_count_query = select(func.count(Production.id))
            if gender:
                total_count_query = total_count_query.filter(Production.gender == gender)
            if sire:
                total_count_query = total_count_query.filter(Production.sire_id == sire)
            if dam:
                total_count_query = total_count_query.filter(Production.dam_id == dam)

            total_count_result = await db.execute(total_count_query)
            total_count = total_count_result.scalar_one()

            data = {
                "items": [convert_to_production_schema(production).dict() for production in productions],
                "total_count": total_count,
            }

            # Cache the result with filters included
            await redis_client.set(cache_key, json.dumps(data, cls=DateTimeEncoder), ex=3600)
            return data

        except SQLAlchemyError as e:
            logger.error(f"Error in get_all_productions: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Internal Server Error")


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
