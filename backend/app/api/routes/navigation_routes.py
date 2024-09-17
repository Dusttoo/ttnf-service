from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.services import NavigationService
from app.schemas import NavLink, NavLinkCreate, NavLinkUpdate, UserSchema
from app.core.database import get_database_session
from app.core.settings import update_global_updated_at
from app.core.auth import get_current_user


navigation_router = APIRouter()
navigation_svc = NavigationService()


@navigation_router.get("/links", response_model=List[NavLink])
async def read_nav_links(skip: int = 0, limit: int = 100, db: Session = Depends(get_database_session)):
    nav_links = await navigation_svc.get_nav_links(db, skip=skip, limit=limit)
    return nav_links


@navigation_router.get("/links/{nav_link_id}", response_model=NavLink)
async def read_nav_link(nav_link_id: int, db: Session = Depends( get_database_session)):
    nav_link = await navigation_svc.get_nav_link(db, nav_link_id=nav_link_id)
    if nav_link is None:
        raise HTTPException(status_code=404, detail="NavLink not found")
    return nav_link


@navigation_router.post("/links", response_model=NavLink)
async def create_nav_link(
    nav_link: NavLinkCreate,
    db: Session = Depends( get_database_session),
    current_user: UserSchema = Depends(get_current_user),
    update_timestamp: None = Depends(update_global_updated_at)
):
    return await navigation_svc.create_nav_link(db, nav_link=nav_link)


@navigation_router.put("/links", response_model=NavLink)
async def update_nav_link(
    nav_link: NavLinkUpdate,
    db: Session = Depends( get_database_session),
    current_user: UserSchema = Depends(get_current_user),
    update_timestamp: None = Depends(update_global_updated_at)
):
    return await navigation_svc.update_nav_link(db, nav_link=nav_link)


@navigation_router.delete("/links/{nav_link_id}")
async def delete_nav_link(
    nav_link_id: int,
    db: Session = Depends( get_database_session),
    current_user: UserSchema = Depends(get_current_user),
    update_timestamp: None = Depends(update_global_updated_at)
):
    await navigation_svc.delete_nav_link(db, nav_link_id=nav_link_id)
    return {"message": "NavLink deleted successfully"}
