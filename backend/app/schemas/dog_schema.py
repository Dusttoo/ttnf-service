from datetime import date
from enum import Enum
from typing import TYPE_CHECKING, List, Optional

from pydantic import BaseModel

if TYPE_CHECKING:
    from app.schemas import Dog


class GenderEnum(str, Enum):
    male = "Male"
    female = "Female"


class StatusEnum(str, Enum):
    available = "Available"
    sold = "Sold"
    stud = "Available For Stud"
    retired = "Retired"
    active = "Active"


class HealthInfoBase(BaseModel):
    dna: Optional[str]
    carrier_status: Optional[str]
    extra_info: Optional[str]


class HealthInfoCreate(HealthInfoBase):
    pass


class HealthInfo(HealthInfoBase):
    id: int
    dog_id: int

    class Config:
        from_attributes = True


class PhotoBase(BaseModel):
    photo_url: str
    alt: str


class PhotoCreate(PhotoBase):
    pass


class Photo(PhotoBase):
    id: int
    dog_id: int

    class Config:
        from_attributes = True


class ProductionBase(BaseModel):
    name: str
    dob: Optional[date] = None
    gender: Optional[GenderEnum] = None
    owner: Optional[str] = None
    description: Optional[str] = None
    profile_photo: Optional[str] = None
    sire_id: Optional[int] = None
    dam_id: Optional[int] = None


class ProductionCreate(ProductionBase):
    pass


class ProductionUpdate(BaseModel):
    name: Optional[str] = None
    dob: Optional[date] = None
    owner: Optional[str] = None
    description: Optional[str] = None
    profile_photo: Optional[str] = None
    sire_id: Optional[int] = None
    dam_id: Optional[int] = None


class Production(ProductionBase):
    id: int

    class Config:
        from_attributes = True


class DogBase(BaseModel):
    name: str
    dob: Optional[date] = None
    gender: GenderEnum
    color: Optional[str] = None
    status: Optional[StatusEnum] = None
    profile_photo: Optional[str] = None
    stud_fee: Optional[int] = None
    sale_fee: Optional[int] = None
    description: Optional[str] = None
    pedigree_link: Optional[str] = None
    video_url: Optional[str] = None
    parent_male_id: Optional[int] = None
    parent_female_id: Optional[int] = None
    is_production: bool = False
    is_retired: Optional[bool] = False


class DogCreate(DogBase):
    health_infos: Optional[List[HealthInfoCreate]] = None
    kennel_own: Optional[bool] = True
    gallery_photos: Optional[List[str]] = []


class DogUpdate(BaseModel):
    name: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[GenderEnum] = None
    color: Optional[str] = None
    status: Optional[StatusEnum] = None
    profile_photo: Optional[str] = None
    stud_fee: Optional[int] = None
    sale_fee: Optional[int] = None
    description: Optional[str] = None
    pedigree_link: Optional[str] = None
    video_url: Optional[str] = None
    parent_male_id: Optional[int] = None
    parent_female_id: Optional[int] = None
    is_production: Optional[bool] = None
    kennel_own: Optional[bool] = None
    gallery_photos: Optional[List[str]] = []


class Dog(DogBase):
    id: int
    health_infos: List[HealthInfo] = []
    photos: List[Photo] = []
    productions: List["Production"] = []
    children: List["DogChildSchema"] = []

    class Config:
        from_attributes = True


class DogChildSchema(BaseModel):
    id: int
    name: str
    dob: Optional[date] = None
    gender: GenderEnum
    profile_photo: Optional[str] = None


class DogParentSchema(BaseModel):
    id: int
    name: str
    dob: Optional[date] = None
    gender: GenderEnum
    profile_photo: Optional[str] = None


class PuppyCreate(DogCreate):
    pass
