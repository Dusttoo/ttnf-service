import logging
from typing import Dict, List, Optional

from fastapi import HTTPException
from sqlalchemy import func, and_
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models import WaitlistEntry, Dog, Breeding
from app.schemas import WaitlistCreate, WaitlistUpdate, WaitlistResponse
from app.utils.schema_converters import convert_to_waitlist_schema

logger = logging.getLogger(__name__)


class WaitlistService:

    # Public method to create a new waitlist entry
    async def create_waitlist_entry(
        self, waitlist_data: WaitlistCreate, db: AsyncSession
    ) -> WaitlistResponse:
        try:
            new_entry = WaitlistEntry(
                name=waitlist_data.name,
                email=waitlist_data.email,
                phone=waitlist_data.phone,
                gender_preference=waitlist_data.gender_preference,
                color_preference=waitlist_data.color_preference,
                additional_info=waitlist_data.additional_info,
            )

            # Load the related sires and dams if provided
            if waitlist_data.sire_ids:
                sires = await db.execute(
                    select(Dog).filter(Dog.id.in_(waitlist_data.sire_ids))
                )
                new_entry.sires = sires.scalars().all()

            if waitlist_data.dam_ids:
                dams = await db.execute(
                    select(Dog).filter(Dog.id.in_(waitlist_data.dam_ids))
                )
                new_entry.dams = dams.scalars().all()

            db.add(new_entry)
            await db.commit()

            # Manually query the newly created entry with selectinload to fetch related entities
            result = await db.execute(
                select(WaitlistEntry)
                .filter(WaitlistEntry.id == new_entry.id)
                .options(
                    selectinload(WaitlistEntry.sires).options(
                        selectinload(Dog.health_infos),
                        selectinload(Dog.photos),
                        selectinload(Dog.productions),
                        selectinload(Dog.children),
                        selectinload(Dog.statuses),
                    ),
                    selectinload(WaitlistEntry.dams).options(
                        selectinload(Dog.health_infos),
                        selectinload(Dog.photos),
                        selectinload(Dog.productions),
                        selectinload(Dog.children),
                        selectinload(Dog.statuses),
                    ),
                    selectinload(WaitlistEntry.breeding),
                )
            )
            refreshed_entry = result.scalars().first()

            return convert_to_waitlist_schema(refreshed_entry)
        except SQLAlchemyError as e:
            logger.error(f"Error in create_waitlist_entry: {e}", exc_info=True)
            raise HTTPException(
                status_code=500, detail="Could not create waitlist entry"
            )

    # Public method to get all waitlist entries (admin functionality)
    async def get_all_waitlist_entries(
        self, page: int, page_size: int, db: AsyncSession
    ) -> Dict[str, any]:
        try:
            offset = (page - 1) * page_size
            query = (
                select(WaitlistEntry)
                .offset(offset)
                .limit(page_size)
                .options(
                    selectinload(WaitlistEntry.sires).options(
                        selectinload(Dog.health_infos),
                        selectinload(Dog.photos),
                        selectinload(Dog.productions),
                        selectinload(Dog.children),
                        selectinload(Dog.statuses),
                    ),
                    selectinload(WaitlistEntry.dams).options(
                        selectinload(Dog.health_infos),
                        selectinload(Dog.photos),
                        selectinload(Dog.productions),
                        selectinload(Dog.children),
                        selectinload(Dog.statuses),
                    ),
                    selectinload(WaitlistEntry.breeding),
                )
            )
            result = await db.execute(query)
            entries = result.scalars().all()

            total_count_query = select(func.count(WaitlistEntry.id))
            total_count_result = await db.execute(total_count_query)
            total_count = total_count_result.scalar_one()

            return {
                "items": [
                    convert_to_waitlist_schema(entry).dict() for entry in entries
                ],
                "total_count": total_count,
            }
        except SQLAlchemyError as e:
            logger.error(f"Error in get_all_waitlist_entries: {e}", exc_info=True)
            raise HTTPException(
                status_code=500, detail="Could not fetch waitlist entries"
            )

    # Public method to get a specific waitlist entry by ID
    async def get_waitlist_entry_by_id(
        self, entry_id: int, db: AsyncSession
    ) -> Optional[WaitlistResponse]:
        try:
            result = await db.execute(
                select(WaitlistEntry)
                .filter(WaitlistEntry.id == entry_id)
                .options(
                    selectinload(WaitlistEntry.sires).options(
                        selectinload(Dog.health_infos),
                        selectinload(Dog.photos),
                        selectinload(Dog.productions),
                        selectinload(Dog.children),
                        selectinload(Dog.statuses),
                    ),
                    selectinload(WaitlistEntry.dams).options(
                        selectinload(Dog.health_infos),
                        selectinload(Dog.photos),
                        selectinload(Dog.productions),
                        selectinload(Dog.children),
                        selectinload(Dog.statuses),
                    ),
                    selectinload(WaitlistEntry.breeding),
                )
            )
            entry = result.scalars().first()
            if entry:
                return convert_to_waitlist_schema(entry)
            else:
                raise HTTPException(status_code=404, detail="Waitlist entry not found")
        except SQLAlchemyError as e:
            logger.error(f"Error in get_waitlist_entry_by_id: {e}", exc_info=True)
            raise HTTPException(
                status_code=500, detail="Could not fetch waitlist entry"
            )

    # Admin method to update a waitlist entry
    async def update_waitlist_entry(
        self, entry_id: int, waitlist_data: WaitlistUpdate, db: AsyncSession
    ) -> Optional[WaitlistResponse]:
        try:
            result = await db.execute(
                select(WaitlistEntry).filter(WaitlistEntry.id == entry_id)
            )
            entry = result.scalars().first()

            if entry:
                # Update the entry with new values
                for var, value in waitlist_data.dict(exclude_unset=True).items():
                    if var == "sire_ids":
                        sires = await db.execute(select(Dog).filter(Dog.id.in_(value)))
                        entry.sires = sires.scalars().all()
                    elif var == "dam_ids":
                        dams = await db.execute(select(Dog).filter(Dog.id.in_(value)))
                        entry.dams = dams.scalars().all()
                    else:
                        setattr(entry, var, value)

                await db.commit()

                # Manually query the updated entry with selectinload to fetch related entities
                result = await db.execute(
                    select(WaitlistEntry)
                    .filter(WaitlistEntry.id == entry.id)
                    .options(
                        selectinload(WaitlistEntry.sires).options(
                            selectinload(Dog.health_infos),
                            selectinload(Dog.photos),
                            selectinload(Dog.productions),
                            selectinload(Dog.children),
                            selectinload(Dog.statuses),
                        ),
                        selectinload(WaitlistEntry.dams).options(
                            selectinload(Dog.health_infos),
                            selectinload(Dog.photos),
                            selectinload(Dog.productions),
                            selectinload(Dog.children),
                            selectinload(Dog.statuses),
                        ),
                        selectinload(WaitlistEntry.breeding),
                    )
                )
                refreshed_entry = result.scalars().first()

                return convert_to_waitlist_schema(refreshed_entry)
            else:
                raise HTTPException(status_code=404, detail="Waitlist entry not found")
        except SQLAlchemyError as e:
            logger.error(f"Error in update_waitlist_entry: {e}", exc_info=True)
            raise HTTPException(
                status_code=500, detail="Could not update waitlist entry"
            )

    # Admin method to delete a waitlist entry
    async def delete_waitlist_entry(self, entry_id: int, db: AsyncSession) -> bool:
        try:
            result = await db.execute(
                select(WaitlistEntry).filter(WaitlistEntry.id == entry_id)
            )
            entry = result.scalars().first()

            if entry:
                await db.delete(entry)
                await db.commit()
                return True
            else:
                raise HTTPException(status_code=404, detail="Waitlist entry not found")
        except SQLAlchemyError as e:
            logger.error(f"Error in delete_waitlist_entry: {e}", exc_info=True)
            raise HTTPException(
                status_code=500, detail="Could not delete waitlist entry"
            )

    # Method to get filtered waitlist entries
    async def get_filtered_waitlist_entries(
        self,
        db: AsyncSession,
        sire_ids: Optional[List[int]] = None,
        dam_ids: Optional[List[int]] = None,
        color: Optional[str] = None,
        page: int = 1,
        page_size: int = 10,
    ) -> List[WaitlistResponse]:
        try:
            query = (
                select(WaitlistEntry)
                .filter(
                    and_(
                        WaitlistEntry.color_preference == color if color else True,
                    )
                )
                .options(
                    selectinload(WaitlistEntry.sires).options(
                        selectinload(Dog.health_infos),
                        selectinload(Dog.photos),
                        selectinload(Dog.productions),
                        selectinload(Dog.children),
                        selectinload(Dog.statuses),
                    ),
                    selectinload(WaitlistEntry.dams).options(
                        selectinload(Dog.health_infos),
                        selectinload(Dog.photos),
                        selectinload(Dog.productions),
                        selectinload(Dog.children),
                        selectinload(Dog.statuses),
                    ),
                    selectinload(WaitlistEntry.breeding),
                )
            )

            if sire_ids:
                query = query.filter(WaitlistEntry.sires.any(Dog.id.in_(sire_ids)))

            if dam_ids:
                query = query.filter(WaitlistEntry.dams.any(Dog.id.in_(dam_ids)))

            offset = (page - 1) * page_size
            query = query.offset(offset).limit(page_size)

            result = await db.execute(query)
            entries = result.scalars().all()

            return [convert_to_waitlist_schema(entry) for entry in entries]
        except SQLAlchemyError as e:
            logger.error(f"Error in get_filtered_waitlist_entries: {e}", exc_info=True)
            raise HTTPException(
                status_code=500, detail="Could not fetch waitlist entries"
            )

    async def get_waitlist_submissions_count(self, db: AsyncSession) -> int:
        try:
            query = select(func.count(WaitlistEntry.id))
            result = await db.execute(query)
            count = result.scalar_one()
            return count
        except Exception as e:
            logger.error(f"Error in get_waitlist_submissions_count: {e}", exc_info=True)
            raise HTTPException(
                status_code=500, detail="Could not retrieve waitlist submissions count"
            )
