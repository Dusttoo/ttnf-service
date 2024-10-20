from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models import User
from app.schemas import UserSchema


class UserService:
    async def get_user_by_username(self, username: str, db: AsyncSession):
        """Fetch a user by username."""
        query = select(User).filter(User.username == username)
        result = await db.execute(query)
        return result.scalars().first()

    async def get_user(self, user_id: int, db: AsyncSession):
        """Fetch a user by ID."""
        query = select(User).filter(User.id == user_id)
        result = await db.execute(query)
        return result.scalars().first()

    async def create_or_update_user(self, user_data: dict, db: AsyncSession):
        query = select(User).filter(User.email == user_data["email"])
        result = await db.execute(query)
        user = result.scalars().first()

        if user:
            user.username = user_data["username"] if "username" in user_data else user_data["email"]
            user.email = user_data["email"]
            user.first_name = user_data["firstName"]
            user.last_name = user_data["lastName"]
        else:
            # Create a new user
            user = User(
                username=user_data["username"] if "username" in user_data else user_data["email"],
                email=user_data["email"],
                first_name=user_data["firstName"],
                last_name=user_data["lastName"],
            )
            user.set_password(user_data["password"])

            db.add(user)

        await db.commit()
        await db.refresh(user)
        return UserSchema.model_validate(user)
