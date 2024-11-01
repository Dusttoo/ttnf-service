import json
import logging
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.redis import get_redis_client
from app.models.navigation import NavLink
from app.schemas import NavLink as NavLinkSchema
from app.schemas import NavLinkCreate, NavLinkUpdate
from app.utils.schema_converters import convert_to_navigation_schema
from app.core.config import settings

logger = logging.getLogger(__name__)


class NavigationService:
    async def get_nav_links(
        self, db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[NavLinkSchema]:
        try:
            redis_client = await get_redis_client()
            cache_key = f"nav_links:{skip}:{limit}:{settings.env}"
            cached_data = await redis_client.get(cache_key)

            if cached_data:
                return json.loads(cached_data)

            # Fetch all nav links in flat structure
            query = select(NavLink).offset(skip).limit(limit)
            result = await db.execute(query)
            nav_links = result.scalars().all()

            # Cache the result
            await redis_client.set(
                cache_key,
                json.dumps(
                    [
                        convert_to_navigation_schema(nav_link).dict()
                        for nav_link in nav_links
                    ]
                ),
                ex=3600,
            )

            return [convert_to_navigation_schema(nav_link) for nav_link in nav_links]
        except SQLAlchemyError as e:
            logger.error(f"Error in get_nav_links: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def get_nav_link(
        self, db: AsyncSession, nav_link_id: int
    ) -> Optional[NavLink]:
        try:
            redis_client = await get_redis_client()
            cache_key = f"nav_link:{nav_link_id}:{settings.env}"
            cached_data = await redis_client.get(cache_key)

            if cached_data:
                return NavLink(**json.loads(cached_data))

            query = select(NavLink).filter(NavLink.id == nav_link_id)
            result = await db.execute(query)
            nav_link = result.scalars().first()

            if nav_link:
                await redis_client.set(
                    cache_key,
                    json.dumps(convert_to_navigation_schema(nav_link).dict()),
                    ex=3600,
                )

            return nav_link
        except SQLAlchemyError as e:
            logger.error(f"Error in get_nav_link: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def create_nav_link(
        self, db: AsyncSession, nav_link: NavLinkCreate
    ) -> NavLink:
        try:
            db_nav_link = NavLink(**nav_link.dict())
            db.add(db_nav_link)
            await db.commit()
            await db.refresh(db_nav_link)

            # Invalidate cache for nav links list
            redis_client = await get_redis_client()
            await redis_client.delete_pattern("nav_links:*")

            return db_nav_link
        except SQLAlchemyError as e:
            logger.error(f"Error in create_nav_link: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def update_nav_link(
        self, db: AsyncSession, nav_link_id: int, nav_link: NavLinkUpdate
    ) -> Optional[NavLink]:
        try:
            query = select(NavLink).filter(NavLink.id == nav_link_id)
            result = await db.execute(query)
            db_nav_link = result.scalars().first()
            if db_nav_link:
                for key, value in nav_link.dict(exclude_unset=True).items():
                    setattr(db_nav_link, key, value)
                await db.commit()
                await db.refresh(db_nav_link)

                # Invalidate cache for this nav link and nav links list
                redis_client = await get_redis_client()
                await redis_client.delete(f"nav_link:{nav_link_id}")
                await redis_client.delete_pattern("nav_links:*")

                return db_nav_link
            return None
        except SQLAlchemyError as e:
            logger.error(f"Error in update_nav_link: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

    async def delete_nav_link(self, db: AsyncSession, nav_link_id: int) -> bool:
        try:
            query = select(NavLink).filter(NavLink.id == nav_link_id)
            result = await db.execute(query)
            db_nav_link = result.scalars().first()
            if db_nav_link:
                await db.delete(db_nav_link)
                await db.commit()

                # Invalidate cache for this nav link and nav links list
                redis_client = await get_redis_client()
                await redis_client.delete(f"nav_link:{nav_link_id}")
                await redis_client.delete_pattern("nav_links:*")

                return True
            return False
        except SQLAlchemyError as e:
            logger.error(f"Error in delete_nav_link: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
