from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models import User
from app.schemas import UserSchema
from app.core.database import get_database_session


class UserService:
    async def create_or_update_user(self, user_data: dict, db: AsyncSession):
        """Create or update a user based on the React Bricks data."""
        query = select(User).filter(User.email == user_data["email"])
        result = await db.execute(query)
        user = result.scalars().first()

        if user:
            # Update existing user
            user.username = user_data["email"]  # or user_data['username'] if available
            user.first_name = user_data["firstName"]
            user.last_name = user_data["lastName"]
            user.company = user_data.get("company")
            user.avatar_url = user_data.get("avatarUrl")
            user.role = user_data.get("role", "user")
        else:
            # Create a new user
            user = User(
                username=user_data["email"],  # or user_data['username'] if available
                email=user_data["email"],
                first_name=user_data["firstName"],
                last_name=user_data["lastName"],
                company=user_data.get("company"),
                avatar_url=user_data.get("avatarUrl"),
                role=user_data.get("role", "user"),
            )
            # You might need to set a default password or request it later
            user.set_password(
                "default_password"
            )  # Set a default password or generate one

            db.add(user)

        await db.commit()
        await db.refresh(user)
        return UserSchema.from_orm(user)
