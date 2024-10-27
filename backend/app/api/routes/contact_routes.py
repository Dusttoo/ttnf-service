from azure.core.exceptions import HttpResponseError
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas import ContactForm
from app.services.contact_service import ContactService
from app.core.database import get_database_session
import logging

logger = logging.getLogger(__name__)

contact_router = APIRouter()


@contact_router.post("/", status_code=status.HTTP_201_CREATED)
async def submit_contact_form(
    contact_data: ContactForm,
    db: AsyncSession = Depends(get_database_session)
):
    logger.info(f"Received contact data: {contact_data}")

    # Save the contact message to the database
    try:
        saved_message = await ContactService.save_message(contact_data, db)
        logger.info(f"Message saved with ID: {saved_message.id}")
    except Exception as e:
        logger.error(f"Failed to save message to database: {e}")
        raise HTTPException(status_code=500, detail="Failed to save message to database")

    # Send an email notification
    try:
        await ContactService.send_email(contact_data)
        logger.info("Email sent successfully")
    except HttpResponseError as e:
        logger.error(f"Email service failed with HttpResponseError: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email due to email service error")
    except Exception as e:
        logger.error(f"Unexpected error in sending email: {e}")
        raise HTTPException(status_code=500, detail="Unexpected error in sending email")

    return {"message": "Your message has been sent successfully!"}
