from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime


# Meta information about the page
class IMeta(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    language: Optional[str] = None
    featuredImage: Optional[str] = (
        None 
    )


# Information about the author of the page
class Author(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    avatar_url: Optional[HttpUrl] = None
    company: Optional[str] = None


# Information about the translations of the page
class Translation(BaseModel):
    language: str
    slug: str


# Base schema for a page
class PageBase(BaseModel):
    type: str
    name: str
    slug: str
    meta: Optional[IMeta] = None
    custom_values: Optional[Dict[str, Any]] = (
        None  # Represents any custom data associated with the page
    )
    external_data: Optional[Dict[str, Any]] = (
        None  # Represents any external data associated with the page
    )
    content: List[
        Dict[str, Any]
    ]  # List of IContentBlock objects (blocks used in the page)
    author_id: Optional[int] = None
    invalid_block_types: Optional[List[str]] = None
    status: Optional[str] = "draft"  # Could use an enum for PageStatus if needed
    is_locked: Optional[bool] = False
    tags: Optional[List[str]] = None
    created_at: Optional[datetime] = None
    published_at: Optional[datetime] = None
    language: str
    translations: Optional[List[Translation]] = None
    updated_at: Optional[datetime] = None


# Schema for creating a page
class PageCreate(PageBase):
    pass


# Schema for updating a page
class PageUpdate(BaseModel):
    type: Optional[str] = None
    name: Optional[str] = None
    slug: Optional[str] = None
    meta: Optional[IMeta] = None
    custom_values: Optional[Dict[str, Any]] = None
    external_data: Optional[Dict[str, Any]] = None
    content: Optional[List[Dict[str, Any]]] = None
    author_id: Optional[int] = None
    invalid_block_types: Optional[List[str]] = None
    status: Optional[str] = None
    is_locked: Optional[bool] = None
    tags: Optional[List[str]] = None
    language: Optional[str] = None
    translations: Optional[List[Translation]] = None


# Full schema for a page, including ID and author details
class Page(PageBase):
    id: str
    author: Optional[Author] = None  # Full author information

    class Config:
        from_attributes = True
