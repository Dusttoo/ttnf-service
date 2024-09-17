from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_database_session
from app.schemas import LitterCreate, LitterUpdate, Litter, UserSchema, Dog, PuppyCreate
from app.services import LitterService
from app.core.auth import get_current_user
from app.utils import convert_to_litter_schema
from app.schemas import PaginatedResponse
import logging
from app.core.settings import update_global_updated_at


logger = logging.getLogger(__name__)

litter_router = APIRouter()
litter_svc = LitterService()


@litter_router.get("/", response_model=PaginatedResponse[Litter])
async def get_all_litters(
    page: int = 1, page_size: int = 10, db: AsyncSession = Depends(get_database_session)
):
    try:
        response = await litter_svc.get_all_litters(page, page_size, db)
        return response
    except Exception as e:
        logger.error(f"Error in get_all_litters: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@litter_router.post("/{breeding_id}/populate", response_model=Litter)
async def populate_litter(
    breeding_id: int,
    litter: LitterCreate,
    db: AsyncSession = Depends(get_database_session),
    update_timestamp: None = Depends(update_global_updated_at)
):
    try:
        return await litter_svc.populate_litter(db, breeding_id, litter)
    except Exception as e:
        logger.error(f"Error in populate_litter: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@litter_router.post("/{litter_id}/puppies", response_model=List[Dog])
async def add_puppies_to_litter(
    litter_id: int,
    puppies: List[PuppyCreate],
    db: AsyncSession = Depends(get_database_session),
    update_timestamp: None = Depends(update_global_updated_at)
):
    try:
        return await litter_svc.add_puppies_to_litter(db, litter_id, puppies)
    except Exception as e:
        logger.error(f"Error in add_puppies_to_litter: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@litter_router.get("/{litter_id}", response_model=Litter)
async def get_litter_by_id(
    litter_id: int, db: AsyncSession = Depends(get_database_session)
):
    try:
        litter = await litter_svc.get_litter_by_id(litter_id, db)
        if not litter:
            raise HTTPException(status_code=404, detail="Litter not found")
        return litter
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error in get_litter_by_id: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@litter_router.post("/", response_model=Litter)
async def create_litter(
    litter_data: LitterCreate,
    db: AsyncSession = Depends(get_database_session),
    current_user: UserSchema = Depends(get_current_user),
    update_timestamp: None = Depends(update_global_updated_at)
):
    try:
        litter = await litter_svc.create_litter(litter_data, db)
        return litter
    except Exception as e:
        logger.error(f"Error in create_litter: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@litter_router.put("/{litter_id}", response_model=Litter)
async def update_litter(
    litter_id: int,
    litter_data: LitterUpdate,
    db: AsyncSession = Depends(get_database_session),
    current_user: UserSchema = Depends(get_current_user),
    update_timestamp: None = Depends(update_global_updated_at)
):
    try:
        litter = await litter_svc.update_litter(litter_id, litter_data, db)
        if not litter:
            raise HTTPException(status_code=404, detail="Litter not found")
        return litter
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error in update_litter: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@litter_router.delete("/{litter_id}")
async def delete_litter(
    litter_id: int,
    db: AsyncSession = Depends(get_database_session),
    current_user: UserSchema = Depends(get_current_user),
    update_timestamp: None = Depends(update_global_updated_at)
):
    try:
        result = await litter_svc.delete_litter(litter_id, db)
        if not result:
            raise HTTPException(status_code=404, detail="Litter not found")
        return {"message": "Litter deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error in delete_litter: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@litter_router.get("/by-breeding/{breeding_id}", response_model=List[Litter])
async def get_litters_by_breeding(
    breeding_id: int, db: AsyncSession = Depends(get_database_session)
):
    try:
        litters = await litter_svc.get_litters_by_breeding(breeding_id, db)
        return litters
    except Exception as e:
        logger.error(f"Error in get_litters_by_breeding: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")
