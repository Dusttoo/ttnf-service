from fastapi import Depends, APIRouter, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app.core import get_database_session, create_access_token
from app.schemas import (
    UserCreateSchema,
    UserSchema,
    TokenSchema,
)
from app.services import UserService
from app.models import User
from app.utils import NotFoundError

user_router = APIRouter()
user_service = UserService()


@user_router.get("/", response_model=List[UserSchema])
async def read_users(db: Session = Depends(get_database_session)):
    users = await user_service.get_all_users(db)
    return users

@user_router.post("/", response_model=TokenSchema)
async def create_a_user(
    user_create: UserCreateSchema, db: Session = Depends(get_database_session)
):
    try:
        user = await user_service.create_user(user_create, db)
        access_token = await create_access_token(data={"sub": user.username})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserSchema.from_orm(user),
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@user_router.get("/{user_id}", response_model=UserSchema)
async def read_user(user_id: int, db: Session = Depends(get_database_session)):
    user = await user_service.get_user(user_id, db)
    if not user:
        raise NotFoundError(name="User", message="User not found")
    return user
