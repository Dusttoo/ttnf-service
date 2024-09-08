from sqlalchemy import or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select
from typing import List
from app.models import Dog, Production, Breeding, Litter, dog_production_link
from app.schemas import SearchResult
from app.utils import (
    convert_to_breeding_schema,
    convert_to_dog_schema,
    convert_to_litter_schema,
    convert_to_production_schema,
)
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import joinedload
import logging

logger = logging.getLogger(__name__)


async def search_resources(
    db: AsyncSession, query: str, resources: List[str], limit: int
) -> List[SearchResult]:
    results = []
    resources = resources[0].split(",")
    dog_ids = set()  

    try:
        if "dogs" in resources:
            dogs_query = (
                select(Dog)
                .options(
                    selectinload(Dog.health_infos),
                    selectinload(Dog.photos),
                    selectinload(Dog.productions),
                    selectinload(Dog.children),
                )
                .where(Dog.name.ilike(f"%{query}%"))
                .limit(limit)
            )
            dogs_result = await db.execute(dogs_query)
            dogs = dogs_result.scalars().unique().all()  
            for dog in dogs:
                dog_ids.add(dog.id)
                results.append(
                    SearchResult(type="dogs", data=convert_to_dog_schema(dog).dict())
                )
    except SQLAlchemyError as e:
        logger.error(f"Error querying dogs: {e}")

    try:
        if "productions" in resources:
            productions_query = (
                select(Production)
                .join(
                    dog_production_link,
                    Production.id == dog_production_link.c.production_id,
                )
                .filter(dog_production_link.c.dog_id.notin_(dog_ids))
                .where(Production.name.ilike(f"%{query}%"))
                .limit(limit)
            )
            productions_result = await db.execute(productions_query)
            productions = (
                productions_result.scalars().unique().all()
            ) 
            for production in productions:
                results.append(
                    SearchResult(
                        type="productions",
                        data=convert_to_production_schema(production).dict(),
                    )
                )
    except SQLAlchemyError as e:
        logger.error(f"Error querying productions: {e}")

    try:
        if "breedings" in resources:
            breedings_query = (
                select(Breeding)
                .where(
                    or_(
                        Breeding.female_dog.has(Dog.name.ilike(f"%{query}%")),
                        Breeding.male_dog.has(Dog.name.ilike(f"%{query}%")),
                    )
                )
                .limit(limit)
            )
            breedings_result = await db.execute(breedings_query)
            breedings = breedings_result.scalars().all()
            results.extend(
                [
                    SearchResult(
                        type="breedings",
                        data=convert_to_breeding_schema(breeding).dict(),
                    )
                    for breeding in breedings
                ]
            )

    except SQLAlchemyError as e:
        logger.error(f"Error querying breedings: {e}")

    try:
        if "litters" in resources:
            litters_query = (
                select(Litter)
                .options(joinedload(Litter.breeding).joinedload(Breeding.female_dog))
                .options(joinedload(Litter.breeding).joinedload(Breeding.male_dog))
                .where(
                    or_(
                        Breeding.female_dog.has(Dog.name.ilike(f"%{query}%")),
                        Breeding.male_dog.has(Dog.name.ilike(f"%{query}%")),
                    )
                )
                .limit(limit)
            )
            litters_result = await db.execute(litters_query)
            litters = litters_result.scalars().all()
            results.extend(
                [
                    SearchResult(
                        type="litters", data=convert_to_litter_schema(litter).dict()
                    )
                    for litter in litters
                ]
            )

    except SQLAlchemyError as e:
        logger.error(f"Error querying litters: {e}")

    return results
