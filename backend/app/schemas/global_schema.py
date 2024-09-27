from datetime import datetime
from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel

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
