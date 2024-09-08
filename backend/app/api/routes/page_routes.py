from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.schemas import Page, PageCreate, PageUpdate
from app.core.database import get_database_session
from app.services.page_service import PageService

page_router = APIRouter()
page_service = PageService()


@page_router.get("/", response_model=List[Page])
async def read_pages(
    skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_database_session)
):
    return await page_service.get_pages(db, skip=skip, limit=limit)


@page_router.get("/{page_id}", response_model=Page)
async def get_page_by_id(
    page_id: int, db: AsyncSession = Depends(get_database_session)
):
    db_page = await page_service.get_page(db, page_id)
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
    page: PageCreate, db: AsyncSession = Depends(get_database_session)
):
    created_page = await page_service.create_page(db, page)
    return created_page


@page_router.put("/{page_id}", response_model=Page)
async def update_existing_page(
    page_id: int, page: PageUpdate, db: AsyncSession = Depends(get_database_session)
):
    db_page = await page_service.update_page(db, page_id, page)
    if not db_page:
        raise HTTPException(status_code=404, detail="Page not found")
    return db_page


@page_router.delete("/{page_id}", response_model=Page)
async def delete_existing_page(
    page_id: int, db: AsyncSession = Depends(get_database_session)
):
    db_page = await page_service.delete_page(db, page_id)
    if not db_page:
        raise HTTPException(status_code=404, detail="Page not found")
    return db_page
