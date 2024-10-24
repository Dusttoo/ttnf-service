from fastapi import APIRouter, Depends, HTTPException, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.core import (
    create_access_token,
    authenticate_user,
    get_database_session,
    get_current_user,
)
from app.core.auth import verify_token
from app.schemas import UserSchema
from app.services.user_service import UserService
from app.core.config import settings

auth_router = APIRouter()
user_service = UserService()


@auth_router.post(
    "/token", summary="Authenticate user and retrieve token", tags=["Authentication"]
)
async def login_for_access_token(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_database_session),
):
    """
    Authenticates the user with a username and password.
    Returns a Bearer token in the response for Swagger UI.
    Sets an HTTP-only cookie for frontend usage.
    """
    user = await authenticate_user(db, form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.username})
    max_age = 24 * 3600
    user_agent = request.headers.get("User-Agent", "")
    if "Mozilla" in user_agent:
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            max_age=max_age,
            expires=max_age,
            secure=True,
            samesite="strict" if not settings.env == "development" else "none",
        )

        return {
            "message": "Login successful (cookie-based authentication)",
            "user": UserSchema.model_validate(user),
        }
    else:
        return {
            "message": "Login successful (Bearer token)",
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserSchema.model_validate(user),
        }


@auth_router.get("/validate-session", tags=["Authentication"])
async def validate_session(
    request: Request,  # To access cookies
    db: AsyncSession = Depends(get_database_session),
):
    """
    Validates the current session using the JWT token.
    """

    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Try to extract token from Authorization header or cookie
    token = request.cookies.get("access_token")
    if not token:
        token = request.headers.get("Authorization")
        if token and token.startswith("Bearer "):
            token = token[7:]
        else:
            raise credentials_exception

    user = await verify_token(token, credentials_exception, db)
    return user


@auth_router.post("/logout", tags=["Authentication"])
async def logout(response: Response):
    """
    Logs out the user by deleting the access token cookie.
    """
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}
