from pydantic import BaseModel
from typing import List, Optional


class NavLinkBase(BaseModel):
    title: str
    slug: str
    editable: bool
    parent_id: Optional[int] = None
    position: int


class NavLinkCreate(NavLinkBase):
    pass


class NavLinkUpdate(NavLinkBase):
    id: int


class NavLink(NavLinkBase):
    id: int
    parent: Optional["NavLink"] = None

    class Config:
        from_attributes = True  


NavLink.update_forward_refs()
