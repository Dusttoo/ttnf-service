from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.core import (
    create_access_token,
    authenticate_user,
    get_database_session,
    get_current_user,
)
from app.schemas import UserSchema
from app.services.user_service import UserService

auth_router = APIRouter()
user_service = UserService()


@auth_router.post(
    "/token", summary="Authenticate user and retrieve token", tags=["Authentication"]
)
async def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_database_session),
):
    # Assume token is passed as password for token-based auth
    token = form_data.password

    # Authenticate using password or token
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        user = await authenticate_user(db, form_data.username, token=token)
        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials or token",
                headers={"WWW-Authenticate": "Bearer"},
            )

    # Create the access token
    access_token = create_access_token(data={"sub": user.username})
    max_age = 24 * 3600
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=max_age,
        expires=max_age,
        secure=True,
        samesite="strict",
    )
    return {
        "message": "Login successful",
        "access_token": access_token,
        "user": UserSchema.from_orm(user),
    }


@auth_router.get("/validate-session", tags=["Authentication"])
async def validate_session(
    user: UserSchema = Depends(get_current_user),
    db: AsyncSession = Depends(get_database_session),
):
    return await user_service.get_user(user.id, db)


@auth_router.post("/logout", tags=["Authentication"])
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}
