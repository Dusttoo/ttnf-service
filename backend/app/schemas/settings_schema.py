from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class WebsiteSettingsSchema(BaseModel):
    id: int
    title: str
    description: Optional[str]
    updated_at: datetime

    class Config:
        from_attributes = True

class UpdateWebsiteSettingsSchema(BaseModel):
    title: Optional[str]
    description: Optional[str]