from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_database_session
from app.schemas import Announcement, AnnouncementCreate, AnnouncementUpdate
from app.services.announcement_service import AnnouncementService

announcement_router = APIRouter()
announcement_service = AnnouncementService()


@announcement_router.get("/", response_model=List[Announcement])
async def get_all_announcements(db: AsyncSession = Depends(get_database_session)):
    return await announcement_service.get_all_announcements(db)


@announcement_router.get("/{announcement_id}", response_model=Announcement)
async def get_announcement_by_id(announcement_id: UUID, db: AsyncSession = Depends(get_database_session)):
    announcement = await announcement_service.get_announcement(db, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return announcement

@announcement_router.get("/page/{page_id}", response_model=List[Announcement])
async def get_announcements_by_page_id(page_id: UUID, db: AsyncSession = Depends(get_database_session)):
    announcements = await announcement_service.get_announcements_by_page(db, page_id)
    if not announcements:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return announcements



@announcement_router.post("/", response_model=Announcement)
async def create_announcement(announcement: AnnouncementCreate, db: AsyncSession = Depends(get_database_session)):
    return await announcement_service.create_announcement(db, announcement)


@announcement_router.put("/{announcement_id}", response_model=Announcement)
async def update_announcement(
    announcement_id: UUID, announcement: AnnouncementUpdate, db: AsyncSession = Depends(get_database_session)
):
    updated_announcement = await announcement_service.update_announcement(db, announcement_id, announcement)
    if not updated_announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return updated_announcement


@announcement_router.delete("/{announcement_id}", response_model=Announcement)
async def delete_announcement(announcement_id: int, db: AsyncSession = Depends(get_database_session)):
    deleted_announcement = await announcement_service.delete_announcement(db, announcement_id)
    if not deleted_announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return deleted_announcement