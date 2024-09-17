from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.services import search_resources
from app.schemas import SearchResponse
from app.core.database import get_database_session
from app.core.settings import update_global_updated_at


search_router = APIRouter()


@search_router.get("/", response_model=SearchResponse)
async def search(
    query: str,
    resources: List[str] = Query(...),
    limit: int = 5,
    db: Session = Depends(get_database_session),
):
    results = await search_resources(db, query, resources, limit)
    return SearchResponse(results=results)
