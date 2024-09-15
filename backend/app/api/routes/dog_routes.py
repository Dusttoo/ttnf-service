from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import JSONResponse
from app.core.database import get_database_session
from app.schemas import (
    DogCreate,
    DogUpdate,
    ProductionCreate,
    Production,
    Dog,
    UserSchema,
    PaginatedResponse
)
from app.services import DogService
from app.core.auth import get_current_user
import logging

logger = logging.getLogger(__name__)


dog_router = APIRouter()
dog_svc = DogService()


@dog_router.get("/", response_model=PaginatedResponse)
async def get_all_dogs(
    page: int = 1, page_size: int = 10, db: AsyncSession = Depends(get_database_session)
):
    try:
        response = await dog_svc.get_all_dogs(page, page_size, db)
        return response
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")


@dog_router.get("/filtered", response_model=PaginatedResponse)
async def get_dogs_filtered(
    gender: Optional[str] = Query(None),
    status: Optional[List[str]] = Query(None),
    owned: Optional[str] = Query(None),
    sire: Optional[int] = Query(None),
    dam: Optional[int] = Query(None),
    page: int = 1,
    page_size: int = 10,
    db: AsyncSession = Depends(get_database_session),
):
    try:
        filters = {
            "gender": gender,
            "status": status,
            "owned": owned,
            "sire": sire,
            "dam": dam,
        }
        result = await dog_svc.get_dogs_filtered(db, filters, page, page_size)
        return result
    except HTTPException as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")


@dog_router.post("/", response_model=Dog)
async def create_dog(
    dog_data: DogCreate,
    db: AsyncSession = Depends(get_database_session),
    current_user: UserSchema = Depends(get_current_user),
):
    try:
        dog = await dog_svc.create_dog(dog_data, db)
        return dog
    except HTTPException as e:
        logger.error(f"HTTPException in create_dog: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"Exception in create_dog: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")


@dog_router.get("/{dog_id}", response_model=Dog)
async def get_dog_by_id(dog_id: int, db: AsyncSession = Depends(get_database_session)):
    try:
        dog = await dog_svc.get_dog_by_id(dog_id, db)
        if not dog:
            raise HTTPException(status_code=404, detail="Dog not found")
        return dog
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")


@dog_router.put("/{dog_id}", response_model=Dog)
async def update_dog(
    dog_id: int,
    dog_data: DogUpdate,
    db: AsyncSession = Depends(get_database_session),
    current_user: UserSchema = Depends(get_current_user),
):
    try:
        dog = await dog_svc.update_dog(dog_id, dog_data, db)
        if not dog:
            raise HTTPException(status_code=404, detail="Dog not found")
        return dog
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")


@dog_router.delete("/{dog_id}")
async def delete_dog(
    dog_id: int,
    db: AsyncSession = Depends(get_database_session),
    current_user: UserSchema = Depends(get_current_user),
):
    try:
        result = await dog_svc.delete_dog(dog_id, db)
        if not result:
            raise HTTPException(status_code=404, detail="Dog not found")
        return {"message": "Dog deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")


@dog_router.post("/{dog_id}/production", response_model=Production)
async def handle_production(
    dog_id: int,
    production_data: ProductionCreate,
    db: AsyncSession = Depends(get_database_session),
    current_user: UserSchema = Depends(get_current_user),
):
    try:
        production = await dog_svc.add_production_to_dog(dog_id, production_data, db)
        return production
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")
