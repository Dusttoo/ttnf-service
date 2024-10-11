from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from enum import Enum
from app.models import ServiceStatus, ShippingType


class TagBase(BaseModel):
    name: str

    class Config:
        from_attributes = True


class TagCreate(TagBase):
    pass


class TagResponse(TagBase):
    id: int


class ServiceCategoryBase(BaseModel):
    name: str
    display: bool = True
    position: int

    class Config:
        from_attributes = True


class ServiceCategoryCreate(ServiceCategoryBase):
    pass


class ServiceCategoryResponse(ServiceCategoryBase):
    id: int


class ShippingInfo(BaseModel):
    eta: Optional[datetime] = None
    estimated_price: Optional[str] = None
    shipping_type: Optional[ShippingType] = None

    class Config:
        from_attributes = True


class ServiceBase(BaseModel):
    name: str
    description: str
    price: Optional[str] = None
    availability: ServiceStatus
    cta_name: Optional[str] = None
    cta_link: Optional[str] = None
    disclaimer: Optional[str] = None
    eta: Optional[datetime] = None
    estimated_price: Optional[str] = None
    shipping_type: Optional[ShippingType] = None
    image: Optional[str] = None
    tags: List[str] = []

    class Config:
        from_attributes = True


class ServiceCreate(ServiceBase):
    category_id: Optional[int] = None


class ServiceResponse(ServiceBase):
    id: int
    category: Optional[ServiceCategoryResponse]


class ServiceListResponse(BaseModel):
    services: List[ServiceResponse]