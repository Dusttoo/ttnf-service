from typing import List, Optional

from pydantic import BaseModel


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
    sub_links: Optional[List["NavLink"]] = []

    class Config:
        from_attributes = True


NavLink.update_forward_refs()
