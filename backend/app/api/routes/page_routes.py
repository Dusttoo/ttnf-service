from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.database import get_database_session
from app.core.settings import update_global_updated_at
from app.schemas import Page, PageCreate, PageUpdate, UserSchema
from app.services.page_service import PageService

page_router = APIRouter()
page_service = PageService()


@page_router.get("/", response_model=List[Page])
async def read_pages(
    skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_database_session)
):
    return await page_service.get_pages(db, skip=skip, limit=limit)


@page_router.get("/{page_id}", response_model=Page)
async def get_page_by_id(
    page_id: UUID, db: AsyncSession = Depends(get_database_session)
):
    db_page = await page_service.get_page(db, str(page_id))
    if not db_page:
        raise HTTPException(status_code=404, detail="Page not found")
    return db_page


@page_router.get("/slug/{slug}", response_model=Page)
async def read_page_by_slug(
    slug: str, db: AsyncSession = Depends(get_database_session)
):
    db_page = await page_service.get_page_by_slug(db, slug)
    if not db_page:
        raise HTTPException(status_code=404, detail="Page not found")
    return db_page


@page_router.post("/", response_model=Page)
async def create_new_page(
    page: PageCreate,
    db: AsyncSession = Depends(get_database_session),
    current_user: UserSchema = Depends(get_current_user),
    update_timestamp: None = Depends(update_global_updated_at),
):
    created_page = await page_service.create_page(db, page)
    return created_page


@page_router.put("/{page_id}", response_model=Page)
async def update_existing_page(
    page_id: UUID,
    page: PageUpdate,
    db: AsyncSession = Depends(get_database_session),
    current_user: UserSchema = Depends(get_current_user),
    update_timestamp: None = Depends(update_global_updated_at),
):
    db_page = await page_service.update_page(db, str(page_id), page)
    if not db_page:
        raise HTTPException(status_code=404, detail="Page not found")
    return db_page


@page_router.delete("/{page_id}", response_model=Page)
async def delete_existing_page(
    page_id: UUID,
    db: AsyncSession = Depends(get_database_session),
    current_user: UserSchema = Depends(get_current_user),
    update_timestamp: None = Depends(update_global_updated_at),
):
    db_page = await page_service.delete_page(db, str(page_id))
    if not db_page:
        raise HTTPException(status_code=404, detail="Page not found")
    return db_page
