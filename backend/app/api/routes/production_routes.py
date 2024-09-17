from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_database_session
from app.schemas import ProductionCreate, ProductionUpdate, Production, UserSchema
from app.services import ProductionService
from app.core.auth import get_current_user
from app.schemas import PaginatedResponse
import logging
from app.core.settings import update_global_updated_at


logger = logging.getLogger(__name__)

production_router = APIRouter()
production_svc = ProductionService()


@production_router.get("/", response_model=PaginatedResponse[Production])
async def get_all_productions(
    page: int = 1, page_size: int = 10, db: AsyncSession = Depends(get_database_session)
):
    response = await production_svc.get_all_productions(
        page, page_size, db
    )
    return response


@production_router.get("/{production_id}", response_model=Production)
async def get_production_by_id(
    production_id: int, db: AsyncSession = Depends(get_database_session)
):
    production = await production_svc.get_production_by_id(production_id, db)
    if not production:
        raise HTTPException(status_code=404, detail="Production not found")
    return production


@production_router.post("/", response_model=Production)
async def create_production(
    production_data: ProductionCreate,
    db: AsyncSession = Depends(get_database_session),
    current_user: UserSchema = Depends(get_current_user),
    update_timestamp: None = Depends(update_global_updated_at)
):
    try:
        production = await production_svc.create_production(production_data, db)
        return production
    except HTTPException as e:
        logger.error(f"HTTPException in create_production: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"Exception in create_production: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

@production_router.put("/{production_id}", response_model=Production)
async def update_production(
    production_id: int,
    production_data: ProductionUpdate,
    db: AsyncSession = Depends(get_database_session),
    current_user: UserSchema = Depends(get_current_user),
    update_timestamp: None = Depends(update_global_updated_at)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You are not authorized to perform this action",
        )
    production = await production_svc.update_production(
        production_id, production_data, db
    )
    if not production:
        raise HTTPException(status_code=404, detail="Production not found")
    return production


@production_router.delete("/{production_id}")
async def delete_production(
    production_id: int,
    db: AsyncSession = Depends(get_database_session),
    current_user: UserSchema = Depends(get_current_user),
    update_timestamp: None = Depends(update_global_updated_at)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You are not authorized to perform this action",
        )
    result = await production_svc.delete_production(production_id, db)
    if not result:
        raise HTTPException(status_code=404, detail="Production not found")
    return {"message": "Production deleted successfully"}


@production_router.get("/by-parent/{parent_id}", response_model=List[Production])
async def get_productions_by_parent(
    parent_id: int, db: AsyncSession = Depends(get_database_session)
):
    productions = await production_svc.get_productions_by_parent(parent_id, db)
    return productions
