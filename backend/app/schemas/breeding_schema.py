from pydantic import BaseModel
from typing import List, Optional, Union, Dict
from datetime import date
from app.schemas import Dog


class BreedingBase(BaseModel):
    female_dog_id: int
    male_dog_id: int
    breeding_date: date
    expected_birth_date: date
    description: Optional[str] = None


class BreedingCreate(BreedingBase):
    pass


class BreedingUpdate(BaseModel):
    breeding_date: Optional[date]
    expected_birth_date: Optional[date]
    description: Optional[str] = None


class Breeding(BreedingBase):
    id: int
    female_dog: Dog
    male_dog: Dog

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
