from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from app.core.database import get_database_session
from app.models import WebsiteSettings
from app.schemas import WebsiteSettingsSchema, UpdateWebsiteSettingsSchema

settings_router = APIRouter()

@settings_router.get("/", response_model=WebsiteSettingsSchema)
def get_website_settings(db: Session = Depends(get_database_session)):
    settings = db.query(WebsiteSettings).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Website settings not found.")
    return settings

@settings_router.put("/", response_model=WebsiteSettingsSchema)
def update_website_settings(
    update_data: UpdateWebsiteSettingsSchema,
    db: Session = Depends(get_database_session)
):
    settings = db.query(WebsiteSettings).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Website settings not found.")

    if update_data.title is not None:
        settings.title = update_data.title
    if update_data.description is not None:
        settings.description = update_data.description

    settings.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(settings)
    return settings

@settings_router.put("/update-timestamp", response_model=WebsiteSettingsSchema)
def update_timestamp_manually(db: Session = Depends(get_database_session)):
    settings = db.query(WebsiteSettings).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Website settings not found.")

    settings.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(settings)
    return settings