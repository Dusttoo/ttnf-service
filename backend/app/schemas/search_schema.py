from pydantic import BaseModel
from typing import List, Union


class DogOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class ProductionOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class BreedingOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class LitterOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class SearchResult(BaseModel):
    type: str
    data: Union[DogOut, ProductionOut, BreedingOut, LitterOut]


class SearchResponse(BaseModel):
    results: List[SearchResult]
