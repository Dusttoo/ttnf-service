from typing import List, Generic, TypeVar, Optional
from pydantic import BaseModel
from datetime import datetime

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total_count: int

class WebsiteSettingsSchema(BaseModel):
    id: int
    setting_key: str
    updated_at: datetime

    class Config:
        from_attributes = True

class UpdateWebsiteSettingsSchema(BaseModel):
    setting_key: Optional[str]

    class Config:
        from_attributes = True