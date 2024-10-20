import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, Security, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.config import settings
from app.core.database import get_database_session
from app.models import User
from app.services.user_service import UserService

SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes
user_service = UserService()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


# Token creation function
def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


# Token verification function
async def verify_token(token: str, credentials_exception, db: AsyncSession) -> int:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        print(f"Decoded username: {username}")  # Debugging
        if not username:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Fetch user by username
    user = await user_service.get_user_by_username(username, db)
    if not user:
        raise credentials_exception
    return user.id


# Authentication function (check username and password)
async def authenticate_user(db: AsyncSession, username: str, password: str):
    # Check user by username
    query = select(User).filter(User.username == username)
    result = await db.execute(query)
    user = result.scalars().first()

    # Verify password
    if user and user.verify_password(password):
        return user
    return None


# Get the current user from token
async def get_current_user(
    request: Request,
    token: str = Security(oauth2_scheme),
    db: AsyncSession = Depends(get_database_session),
):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        token = request.cookies.get("access_token")
        if not token:
            return credentials_exception

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        username = payload.get("sub")
        if username is None:
            return credentials_exception

    except JWTError:
        return credentials_exception

    user = await user_service.get_user_by_username(username, db)
    if user is None:
        return credentials_exception

    return user
