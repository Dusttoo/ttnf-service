from fastapi import APIRouter, Request, Depends, HTTPException
from app.services.user_service import UserService
from app.services.page_service import PageService
from app.core.database import get_database_session
from sqlalchemy.ext.asyncio import AsyncSession

user_service = UserService()
page_service = PageService()
rb_router = APIRouter()


@rb_router.post("/")
async def reactbricks_webhook(
    request: Request, db: AsyncSession = Depends(get_database_session)
):
    payload = await request.json()
    event_type = payload.get("event")
    data = payload.get("data")

    if not data:
        raise HTTPException(status_code=400, detail="Missing data")

    try:
        # Handle User Events
        if event_type in ["user.created", "user.updated"]:
            # Sync user data
            user = await user_service.create_or_update_user(data, db)
            return {"message": f"User {event_type} processed", "user_id": user.id}

        # Handle Page Events
        elif event_type == "page.created":
            # Create the page in your database
            page = await page_service.create_page_from_rb(db, data)
            return {"message": f"Page {event_type} processed", "page_id": page.id}

        elif event_type == "page.updated":
            # Update the existing page in your database
            page = await page_service.update_page_from_rb(db, data)
            return {"message": f"Page {event_type} processed", "page_id": page.id}

        elif event_type == "page.deleted":
            # Delete the page in your database
            await page_service.delete_page_from_rb(db, data)
            return {"message": f"Page {event_type} processed"}

        else:
            raise HTTPException(status_code=400, detail="Invalid event type")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
