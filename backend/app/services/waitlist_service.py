import logging
from typing import Dict, List, Optional

from fastapi import HTTPException
from sqlalchemy import func, and_
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models import WaitlistEntry, Dog, Breeding
from app.schemas import WaitlistCreate, WaitlistUpdate
from app.utils.schema_converters import convert_to_waitlist_schema

logger = logging.getLogger(__name__)


class WaitlistService:

    # Public method to create a new waitlist entry
    async def create_waitlist_entry(
        self, waitlist_data: WaitlistCreate, db: AsyncSession
    ) -> WaitlistEntry:
        try:
            new_entry = WaitlistEntry(**waitlist_data.dict())
            db.add(new_entry)
            await db.commit()
            await db.refresh(new_entry)
            return convert_to_waitlist_schema(new_entry)
        except SQLAlchemyError as e:
            logger.error(f"Error in create_waitlist_entry: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Could not create waitlist entry")

    # Public method to get all waitlist entries (admin functionality)
    async def get_all_waitlist_entries(
        self, page: int, page_size: int, db: AsyncSession
    ) -> Dict[str, any]:
        try:
            offset = (page - 1) * page_size
            query = select(WaitlistEntry).offset(offset).limit(page_size)
            result = await db.execute(query)
            entries = result.scalars().all()

            total_count_query = select(func.count(WaitlistEntry.id))
            total_count_result = await db.execute(total_count_query)
            total_count = total_count_result.scalar_one()

            return {
                "items": [convert_to_waitlist_schema(entry).dict() for entry in entries],
                "total_count": total_count,
            }
        except SQLAlchemyError as e:
            logger.error(f"Error in get_all_waitlist_entries: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Could not fetch waitlist entries")

    # Public method to get a specific waitlist entry by ID
    async def get_waitlist_entry_by_id(
        self, entry_id: int, db: AsyncSession
    ) -> Optional[WaitlistEntry]:
        try:
            result = await db.execute(
                select(WaitlistEntry)
                .options(
                    selectinload(WaitlistEntry.sire),
                    selectinload(WaitlistEntry.dam),
                    selectinload(WaitlistEntry.breeding),
                )
                .filter(WaitlistEntry.id == entry_id)
            )
            entry = result.scalars().first()
            if entry:
                return convert_to_waitlist_schema(entry)
            else:
                raise HTTPException(status_code=404, detail="Waitlist entry not found")
        except SQLAlchemyError as e:
            logger.error(f"Error in get_waitlist_entry_by_id: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Could not fetch waitlist entry")

    # Admin method to update a waitlist entry
    async def update_waitlist_entry(
        self, entry_id: int, waitlist_data: WaitlistUpdate, db: AsyncSession
    ) -> Optional[WaitlistEntry]:
        try:
            result = await db.execute(select(WaitlistEntry).filter(WaitlistEntry.id == entry_id))
            entry = result.scalars().first()
            if entry:
                for var, value in waitlist_data.dict(exclude_unset=True).items():
                    setattr(entry, var, value)
                await db.commit()
                await db.refresh(entry)
                return convert_to_waitlist_schema(entry)
            else:
                raise HTTPException(status_code=404, detail="Waitlist entry not found")
        except SQLAlchemyError as e:
            logger.error(f"Error in update_waitlist_entry: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Could not update waitlist entry")

    # Admin method to delete a waitlist entry
    async def delete_waitlist_entry(self, entry_id: int, db: AsyncSession) -> bool:
        try:
            result = await db.execute(select(WaitlistEntry).filter(WaitlistEntry.id == entry_id))
            entry = result.scalars().first()
            if entry:
                await db.delete(entry)
                await db.commit()
                return True
            else:
                raise HTTPException(status_code=404, detail="Waitlist entry not found")
        except SQLAlchemyError as e:
            logger.error(f"Error in delete_waitlist_entry: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Could not delete waitlist entry")

    async def get_filtered_waitlist_entries(
        self,
        db: AsyncSession,
        sire_id: Optional[int] = None,
        dam_id: Optional[int] = None,
        color: Optional[str] = None,
        page: int = 1,
        page_size: int = 10
    ) -> List[WaitlistEntry]:
        try:
            query = select(WaitlistEntry).filter(
                and_(
                    WaitlistEntry.sire_id == sire_id if sire_id else True,
                    WaitlistEntry.dam_id == dam_id if dam_id else True,
                    WaitlistEntry.color_preference == color if color else True,
                )
            )

            # Apply pagination
            offset = (page - 1) * page_size
            query = query.offset(offset).limit(page_size)

            result = await db.execute(query)
            entries = result.scalars().all()

            return [convert_to_waitlist_schema(entry) for entry in entries]
        except SQLAlchemyError as e:
            logger.error(f"Error in get_filtered_waitlist_entries: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Could not fetch waitlist entries")
