import json
import logging
from typing import List, Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models import Page
from app.schemas import PageCreate, PageUpdate, Page as PageSchema
from app.utils.schema_converters import convert_to_page_schema
from app.core.redis import get_redis_client, delete_pattern
from app.utils import DateTimeEncoder
from uuid import UUID

logger = logging.getLogger(__name__)


class PageService:
    def __init__(self):
        self.redis_client = None

    async def get_redis_client(self):
        if self.redis_client is None:
            self.redis_client = await get_redis_client()
        return self.redis_client

    async def clear_cache(self, pattern: str = "pages:*"):
        redis_client = await self.get_redis_client()
        await delete_pattern(redis_client, pattern)

    async def get_page(self, db: AsyncSession, page_id: str) -> Optional[PageSchema]:
        cache_key = f"page:{page_id}"
        redis_client = await self.get_redis_client()

        cached_page = await redis_client.get(cache_key)
        if cached_page:
            try:
                page_data = json.loads(cached_page)
                return PageSchema(**page_data)
            except (json.JSONDecodeError, TypeError) as e:
                logger.error(f"Failed to decode cache for page {page_id}: {e}")
                await redis_client.delete(cache_key)

        result = await db.execute(select(Page).filter(Page.id == page_id))
        db_page = result.scalars().first()
        if db_page:
            page_schema = convert_to_page_schema(db_page)
            try:
                page_data = page_schema.dict()
                await redis_client.set(
                    cache_key, json.dumps(page_data, cls=DateTimeEncoder), ex=3600
                )  # Cache for 1 hour
            except Exception as e:
                logger.error(f"Failed to cache page {page_id}: {e}")

            return page_schema

        return None

    async def get_page_by_slug(self, db: AsyncSession, slug: str) -> Optional[PageSchema]:
        cache_key = f"page:slug:{slug}"
        redis_client = await self.get_redis_client()

        cached_page = await redis_client.get(cache_key)
        if cached_page:
            try:
                page_data = json.loads(cached_page)
                return convert_to_page_schema(page_data)
            except (json.JSONDecodeError, TypeError) as e:
                logger.error(f"Failed to decode cache for page slug {slug}: {e}")
                await redis_client.delete(cache_key)

        result = await db.execute(select(Page).filter(Page.slug == slug))
        db_page = result.scalars().first()
        if db_page:
            page_schema = convert_to_page_schema(db_page)
            try:
                page_data = page_schema.dict()
                await redis_client.set(
                    cache_key, json.dumps(page_data, cls=DateTimeEncoder), ex=3600
                )
            except Exception as e:
                logger.error(f"Failed to cache page slug {slug}: {e}")

            return page_schema

        return None

    async def create_page(self, db: AsyncSession, page: PageCreate) -> PageSchema:
        db_page = Page(
            type=page.type,
            name=page.name,
            slug=page.slug,
            content=page.content,  # Now content is HTML string
            meta=page.meta,
            custom_values=page.custom_values,
            external_data=page.external_data,
            author_id=page.author_id,
            status=page.status,
            is_locked=page.is_locked,
            tags=page.tags,
            language=page.language,
            translations=page.translations,
        )
        db.add(db_page)
        await db.commit()
        await db.refresh(db_page)

        await self.clear_cache()

        return convert_to_page_schema(db_page)

    async def update_page(self, db: AsyncSession, page_id: str, page: PageUpdate) -> Optional[PageSchema]:
        result = await db.execute(select(Page).filter(Page.id == page_id))
        db_page = result.scalars().first()

        if db_page:
            update_data = page.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_page, key, value)
            await db.commit()
            await db.refresh(db_page)

            redis_client = await self.get_redis_client()
            await redis_client.delete(f"page:{page_id}")
            await redis_client.delete(f"page:slug:{db_page.slug}")
            await self.clear_cache()

            return convert_to_page_schema(db_page)

        return None

    async def get_pages(
        self, db: AsyncSession, skip: int = 0, limit: int = 10
    ) -> List[PageSchema]:
        cache_key = f"pages:{skip}:{limit}"
        redis_client = await self.get_redis_client()

        cached_pages = await redis_client.get(cache_key)
        if cached_pages:
            try:
                pages_data = json.loads(cached_pages)
                for page_data in pages_data:
                    if isinstance(page_data["content"], str):
                        page_data["content"] = json.loads(
                            page_data["content"]
                        )  # Deserialize content
                return [PageSchema(**page) for page in pages_data]
            except (json.JSONDecodeError, TypeError) as e:
                logger.error(f"Failed to decode cached pages for key {cache_key}: {e}")
                await redis_client.delete(cache_key)  # Invalidate corrupt cache

        result = await db.execute(select(Page).offset(skip).limit(limit))
        db_pages = result.scalars().all()
        page_schemas = [convert_to_page_schema(page) for page in db_pages]
        try:
            pages_data = [page.dict() for page in page_schemas]
            for page_data in pages_data:
                page_data["content"] = json.dumps(
                    page_data["content"], cls=DateTimeEncoder
                )
            await redis_client.set(
                cache_key, json.dumps(pages_data, cls=DateTimeEncoder), ex=3600
            )  # Cache for 1 hour
        except Exception as e:
            logger.error(f"Failed to cache pages list for key {cache_key}: {e}")

        return page_schemas

    async def delete_page(self, db: AsyncSession, page_id: str) -> Optional[PageSchema]:
        result = await db.execute(select(Page).filter(Page.id == page_id))
        db_page = result.scalars().first()

        if db_page:
            await db.delete(db_page)
            await db.commit()

            redis_client = await self.get_redis_client()
            await redis_client.delete(f"page:{page_id}")
            await redis_client.delete(f"page:slug:{db_page.slug}")
            await self.clear_cache()

            return convert_to_page_schema(db_page)

        return None
