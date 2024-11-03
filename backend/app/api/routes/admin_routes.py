from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_database_session
from app.services.contact_service import ContactService
from app.services.waitlist_service import WaitlistService
from app.core.auth import get_current_user
from app.schemas import UserSchema, PaginatedResponse, ContactForm

admin_router = APIRouter()
contact_svc = ContactService()
waitlist_svc = WaitlistService()

@admin_router.get("/stats", response_model=dict)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_database_session),
    current_user: UserSchema = Depends(get_current_user)
):
    """
    Endpoint to fetch dashboard statistics.
    Only accessible by authenticated admin users.
    """
    # You can add role checks here if necessary
    try:
        contact_count = await contact_svc.get_contact_submissions_count(db)
        waitlist_count = await waitlist_svc.get_waitlist_submissions_count(db)
        return {
            "contact_submissions": contact_count,
            "waitlist_submissions": waitlist_count,
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not retrieve dashboard statistics")
    
@admin_router.get("/waitlist", response_model=PaginatedResponse)
async def get_all_waitlist_entries(
    page: int = 1, page_size: int = 10, db: AsyncSession = Depends(get_database_session)
):
    response = await waitlist_svc.get_all_waitlist_entries(page, page_size, db)
    return response

@admin_router.get("/contact", response_model=PaginatedResponse[ContactForm])
async def get_contact_submissions(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    db: AsyncSession = Depends(get_database_session),
    current_user: UserSchema = Depends(get_current_user)
):
    response = await contact_svc.get_contact_submissions(page, page_size, db)
    return response