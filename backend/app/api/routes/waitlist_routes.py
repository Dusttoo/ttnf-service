from alembic.command import current
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_database_session
from app.schemas import WaitlistCreate, WaitlistUpdate, WaitlistResponse, PaginatedResponse
from app.services import WaitlistService
from app.core.auth import get_current_user
from app.core.settings import update_global_updated_at
from app.schemas import UserSchema
from app.utils.schema_converters import convert_to_waitlist_schema

waitlist_router = APIRouter()
waitlist_svc = WaitlistService()


# Public route to create a new waitlist entry
@waitlist_router.post("/", response_model=WaitlistResponse)
async def create_waitlist_entry(
    waitlist_data: WaitlistCreate,
    db: AsyncSession = Depends(get_database_session),
):
    entry = await waitlist_svc.create_waitlist_entry(waitlist_data, db)
    return entry


# Admin route to get all waitlist entries with pagination
@waitlist_router.get("/", response_model=PaginatedResponse)
async def get_all_waitlist_entries(
    page: int = 1, page_size: int = 10, db: AsyncSession = Depends(get_database_session)
):
    response = await waitlist_svc.get_all_waitlist_entries(page, page_size, db)
    return response


# Public route to get filtered waitlist entries
@waitlist_router.get("/filter", response_model=List[WaitlistResponse])
async def get_filtered_waitlist_entries(
    sire_id: Optional[List[int]] = None,
    dam_id: Optional[List[int]] = None,
    color: Optional[str] = None,
    page: int = 1,
    page_size: int = 10,
    db: AsyncSession = Depends(get_database_session)
):
    entries = await waitlist_svc.get_filtered_waitlist_entries(
        db=db, sire_ids=sire_id, dam_ids=dam_id, color=color, page=page, page_size=page_size
    )
    return [convert_to_waitlist_schema(entry) for entry in entries]


# Public route to get a waitlist entry by ID
@waitlist_router.get("/{entry_id}", response_model=WaitlistResponse)
async def get_waitlist_entry_by_id(
    entry_id: int, db: AsyncSession = Depends(get_database_session)
):
    entry = await waitlist_svc.get_waitlist_entry_by_id(entry_id, db)
    if not entry:
        raise HTTPException(status_code=404, detail="Waitlist entry not found")
    return entry


# Admin route to update a waitlist entry
@waitlist_router.put("/{entry_id}", response_model=WaitlistResponse)
async def update_waitlist_entry(
    entry_id: int,
    waitlist_data: WaitlistUpdate,
    db: AsyncSession = Depends(get_database_session),
    current_user: UserSchema = Depends(get_current_user),
    update_timestamp: None = Depends(update_global_updated_at)
):
    entry = await waitlist_svc.update_waitlist_entry(entry_id, waitlist_data, db)
    if not entry:
        raise HTTPException(status_code=404, detail="Waitlist entry not found")
    return entry


# Admin route to delete a waitlist entry
@waitlist_router.delete("/{entry_id}")
async def delete_waitlist_entry(
    entry_id: int,
    db: AsyncSession = Depends(get_database_session),
    current_user: UserSchema = Depends(get_current_user),
    update_timestamp: None = Depends(update_global_updated_at)
):
    result = await waitlist_svc.delete_waitlist_entry(entry_id, db)
    if not result:
        raise HTTPException(status_code=404, detail="Waitlist entry not found")
    return {"message": "Waitlist entry deleted successfully"}
