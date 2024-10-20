from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models import GenderEnum


# Schema for creating a new waitlist entry
class WaitlistCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    gender_preference: Optional[GenderEnum] = None
    color_preference: Optional[str] = Field(None, max_length=255)
    sire_id: Optional[int] = None
    dam_id: Optional[int] = None
    breeding_id: Optional[int] = None
    additional_info: Optional[str] = None


# Schema for returning a waitlist entry to the client
class WaitlistResponse(BaseModel):
    id: int
    name: str
    email: Optional[EmailStr]
    phone: Optional[str]
    gender_preference: Optional[GenderEnum]
    color_preference: Optional[str]
    sire_id: Optional[int]
    dam_id: Optional[int]
    breeding_id: Optional[int]
    additional_info: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# Schema for updating an existing waitlist entry
class WaitlistUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    gender_preference: Optional[GenderEnum] = None
    color_preference: Optional[str] = Field(None, max_length=255)
    sire_id: Optional[int] = None
    dam_id: Optional[int] = None
    breeding_id: Optional[int] = None
    additional_info: Optional[str] = None
