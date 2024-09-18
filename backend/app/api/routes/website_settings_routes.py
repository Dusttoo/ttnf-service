from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from app.core.database import get_database_session
from app.models import WebsiteSettings
from app.schemas import WebsiteSettingsSchema, UpdateWebsiteSettingsSchema

settings_router = APIRouter()

@settings_router.get("/", response_model=WebsiteSettingsSchema)
async def get_website_settings(db: AsyncSession = Depends(get_database_session)):
    result = await db.execute(select(WebsiteSettings))
    settings = result.scalars().first()

    if not settings:
        raise HTTPException(status_code=404, detail="Website settings not found.")

    return settings

@settings_router.put("/", response_model=WebsiteSettingsSchema)
async def update_website_settings(
    update_data: UpdateWebsiteSettingsSchema,
    db: AsyncSession = Depends(get_database_session)
):
    result = await db.execute(select(WebsiteSettings))
    settings = result.scalars().first()

    if not settings:
        raise HTTPException(status_code=404, detail="Website settings not found.")

    if update_data.title is not None:
        settings.title = update_data.title
    if update_data.description is not None:
        settings.description = update_data.description

    settings.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(settings)
    return settings

@settings_router.put("/update-timestamp", response_model=WebsiteSettingsSchema)
async def update_timestamp_manually(db: AsyncSession = Depends(get_database_session)):
    result = await db.execute(select(WebsiteSettings))
    settings = result.scalars().first()

    if not settings:
        raise HTTPException(status_code=404, detail="Website settings not found.")

    settings.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(settings)
    return settings