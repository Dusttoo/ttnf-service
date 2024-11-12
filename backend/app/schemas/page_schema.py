from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, HttpUrl


class CarouselImage(BaseModel):
    id: str
    src: str
    alt: str

    class Config:
        from_attributes = True


class AnnouncementType(str, Enum):
    LITTER = "litter"
    BREEDING = "breeding"
    STUD = "stud"
    ANNOUNCEMENT = "announcement"
    SERVICE = "service"
    INFO = "info"


class Announcement(BaseModel):
    id: int
    title: str
    date: str
    message: str
    category: Optional[AnnouncementType] = AnnouncementType.ANNOUNCEMENT

    class Config:
        from_attributes = True

class AnnouncementCreate(BaseModel):
    title: str
    date: str
    message: str
    category: Optional[AnnouncementType] = AnnouncementType.ANNOUNCEMENT

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    message: Optional[str] = None
    category: Optional[AnnouncementType] = None


class IMeta(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    language: Optional[str] = None
    featuredImage: Optional[str] = None


class Author(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    avatar_url: Optional[HttpUrl] = None
    company: Optional[str] = None


class Translation(BaseModel):
    name: str
    slug: str
    language: str


class PageBase(BaseModel):
    type: str
    name: str
    slug: str
    meta: Optional[IMeta] = None
    custom_values: Optional[Dict[str, Any]] = None
    external_data: Optional[Dict[str, Any]] = None
    content: str
    author_id: Optional[int] = None
    status: Optional[str] = "draft"
    is_locked: Optional[bool] = False
    tags: Optional[List[str]] = None
    announcements: Optional[List[Announcement]] = None
    created_at: Optional[datetime] = None
    published_at: Optional[datetime] = None
    language: str
    translations: Optional[List[Translation]] = None
    updated_at: Optional[datetime] = None
    # carousel_images: Optional[List[CarouselImage]] = None


class PageCreate(PageBase):
    # carousel_images: Optional[List[CarouselImage]] = None
    pass


class PageUpdate(BaseModel):
    type: Optional[str] = None
    name: Optional[str] = None
    slug: Optional[str] = None
    meta: Optional[IMeta] = None
    custom_values: Optional[Dict[str, Any]] = None
    external_data: Optional[Dict[str, Any]] = None
    content: Optional[str] = None
    author_id: Optional[int] = None
    status: Optional[str] = None
    is_locked: Optional[bool] = None
    tags: Optional[List[str]] = None
    announcements: Optional[List[Announcement]] = None
    language: Optional[str] = None
    translations: Optional[List[Translation]] = None
    # carousel_images: Optional[List[CarouselImage]] = None


class Page(PageBase):
    id: str
    author: Optional[Author] = None

    class Config:
        from_attributes = True
