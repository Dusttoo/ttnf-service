from datetime import date
from typing import Dict, List, Optional, Union

from pydantic import BaseModel

from app.schemas import Dog


class BreedingBase(BaseModel):
    female_dog_id: int
    male_dog_id: Optional[int] = None  # Nullable for manual sire details
    breeding_date: date
    expected_birth_date: date
    description: Optional[str] = None

    # Manual sire details
    manual_sire_name: Optional[str] = None
    manual_sire_color: Optional[str] = None
    manual_sire_image_url: Optional[str] = None
    manual_sire_pedigree_link: Optional[str] = None


class BreedingCreate(BreedingBase):
    pass


class BreedingUpdate(BaseModel):
    breeding_date: Optional[date]
    expected_birth_date: Optional[date]
    description: Optional[str] = None
    # Manual sire details for updating
    manual_sire_name: Optional[str] = None
    manual_sire_color: Optional[str] = None
    manual_sire_image_url: Optional[str] = None
    manual_sire_pedigree_link: Optional[str] = None


class Breeding(BreedingBase):
    id: int
    female_dog: Dog
    male_dog: Optional[Dog] = None  # Nullable if manual sire is used

    class Config:
        from_attributes = True


class Description(BaseModel):
    content: str
    style: Optional[Dict[str, str]] = None


class LitterBase(BaseModel):
    breeding_id: int
    birth_date: Optional[date] = None
    number_of_puppies: Optional[int] = None
    description: Optional[Description] = None
    pedigree_url: Optional[str] = None


class LitterCreate(LitterBase):
    pass


class LitterUpdate(BaseModel):
    birth_date: Optional[date] = None
    number_of_puppies: Optional[int] = None
    description: Optional[Description] = None
    pedigree_url: Optional[str] = None


class Litter(LitterBase):
    id: int
    breeding: Breeding
    puppies: List[Dog] = []

    class Config:
        from_attributes = True
