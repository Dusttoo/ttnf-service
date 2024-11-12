# services/announcement_service.py

from typing import List, Optional
from uuid import UUID
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models import Announcement, AnnouncementType
from app.schemas import Announcement as AnnouncementSchema, AnnouncementCreate, AnnouncementUpdate
from app.utils.schema_converters import convert_to_announcement_schema


class AnnouncementService:
    async def get_all_announcements(self, db: AsyncSession) -> List[AnnouncementSchema]:
        result = await db.execute(select(Announcement))
        announcements = result.scalars().all()
        return [convert_to_announcement_schema(a) for a in announcements]

    async def get_announcement(self, db: AsyncSession, announcement_id: UUID) -> Optional[AnnouncementSchema]:
        result = await db.execute(select(Announcement).filter(Announcement.id == announcement_id))
        announcement = result.scalars().first()
        return convert_to_announcement_schema(announcement) if announcement else None
    

    async def get_announcements_by_page(self, db: AsyncSession, page_id: UUID) -> List[AnnouncementSchema]:
        result = await db.execute(select(Announcement).filter(Announcement.page_id == page_id))
        announcements = result.scalars().first()
        return [convert_to_announcement_schema(a) for a in announcements]


    async def create_announcement(self, db: AsyncSession, data: AnnouncementCreate) -> AnnouncementSchema:
        new_announcement = Announcement(
            title=data.title,
            date=data.date or datetime.utcnow(),
            message=data.message,
            category=data.category,
            page_id=data.page_id,
        )
        db.add(new_announcement)
        await db.commit()
        await db.refresh(new_announcement)
        return convert_to_announcement_schema(new_announcement)

    async def update_announcement(
        self, db: AsyncSession, announcement_id: UUID, data: AnnouncementUpdate
    ) -> Optional[AnnouncementSchema]:
        result = await db.execute(select(Announcement).filter(Announcement.id == announcement_id))
        announcement = result.scalars().first()

        if announcement:
            for key, value in data.dict(exclude_unset=True).items():
                setattr(announcement, key, value)
            await db.commit()
            await db.refresh(announcement)
            return convert_to_announcement_schema(announcement)
        return None

    async def delete_announcement(self, db: AsyncSession, announcement_id: UUID) -> Optional[AnnouncementSchema]:
        result = await db.execute(select(Announcement).filter(Announcement.id == announcement_id))
        announcement = result.scalars().first()

        if announcement:
            await db.delete(announcement)
            await db.commit()
            return convert_to_announcement_schema(announcement)
        return None