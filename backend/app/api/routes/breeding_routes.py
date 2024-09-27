from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_database_session
from app.schemas import BreedingCreate, BreedingUpdate, Breeding, UserSchema
from app.services import BreedingService
from app.core.auth import get_current_user
from app.schemas import PaginatedResponse
from app.core.settings import update_global_updated_at

breeding_router = APIRouter()
breeding_svc = BreedingService()


@breeding_router.get("/", response_model=PaginatedResponse)
async def get_all_breedings(
    page: int = 1, page_size: int = 10, db: AsyncSession = Depends(get_database_session)
):
    response = await breeding_svc.get_all_breedings(page, page_size, db)
    return response


@breeding_router.get("/{breeding_id}", response_model=Breeding)
async def get_breeding_by_id(
    breeding_id: int, db: AsyncSession = Depends(get_database_session)
):
    breeding = await breeding_svc.get_breeding_by_id(breeding_id, db)
    if not breeding:
        raise HTTPException(status_code=404, detail="Breeding not found")
    return breeding


@breeding_router.post("/", response_model=Breeding)
async def create_breeding(
    breeding_data: BreedingCreate,
    db: AsyncSession = Depends(get_database_session),
    current_user: UserSchema = Depends(get_current_user),
    update_timestamp: None = Depends(update_global_updated_at)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You are not authorized to perform this action",
        )
    breeding = await breeding_svc.create_breeding(breeding_data, db)
    return breeding


@breeding_router.put("/{breeding_id}", response_model=Breeding)
async def update_breeding(
    breeding_id: int,
    breeding_data: BreedingUpdate,
    db: AsyncSession = Depends(get_database_session),
    current_user: UserSchema = Depends(get_current_user),
    update_timestamp: None = Depends(update_global_updated_at)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You are not authorized to perform this action",
        )
    breeding = await breeding_svc.update_breeding(breeding_id, breeding_data, db)
    if not breeding:
        raise HTTPException(status_code=404, detail="Breeding not found")
    return breeding


@breeding_router.delete("/{breeding_id}")
async def delete_breeding(
    breeding_id: int,
    db: AsyncSession = Depends(get_database_session),
    current_user: UserSchema = Depends(get_current_user),
    update_timestamp: None = Depends(update_global_updated_at)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You are not authorized to perform this action",
        )
    result = await breeding_svc.delete_breeding(breeding_id, db)
    if not result:
        raise HTTPException(status_code=404, detail="Breeding not found")
    return {"message": "Breeding deleted successfully"}


@breeding_router.get("/parent/{parent_id}", response_model=List[Breeding])
async def get_breedings_by_parent(
    parent_id: int, db: AsyncSession = Depends(get_database_session)
):
    breedings = await breeding_svc.get_breedings_by_parent(parent_id, db)
    return breedings
