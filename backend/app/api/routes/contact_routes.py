from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas import ContactForm
from app.services.contact_service import ContactService
from app.core.database import get_database_session

contact_router = APIRouter()


@contact_router.post("/", status_code=status.HTTP_201_CREATED)
async def submit_contact_form(
    contact_data: ContactForm,
    db: AsyncSession = Depends(get_database_session)
):
    try:
        saved_message = await ContactService.save_message(contact_data, db)
    except HTTPException as e:
        raise e

    try:
        await ContactService.send_email(contact_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to send email")

    return {"message": "Your message has been sent successfully!"}
