from azure.core.exceptions import HttpResponseError
from fastapi import HTTPException
from app.schemas import ContactForm
from app.services.email_service import AzureEmailService
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.contact import ContactMessage
import logging

logger = logging.getLogger(__name__)


class ContactService:
    email_service = AzureEmailService()

    @staticmethod
    async def save_message(contact_data: ContactForm, db: AsyncSession):
        contact_message = ContactMessage(
            name=contact_data.name,
            email=contact_data.email,
            message=contact_data.message
        )
        try:
            db.add(contact_message)
            await db.commit()
            await db.refresh(contact_message)
            logger.info(f"Saved contact message with ID: {contact_message.id}")
            return contact_message
        except Exception as e:
            logger.error(f"Failed to save contact message: {e}")
            raise HTTPException(status_code=500, detail="Failed to save message to database")

    @staticmethod
    async def send_email(contact_data: ContactForm):
        subject = "New Contact Form Submission"
        body_text = f"Name: {contact_data.name}\nMessage: {contact_data.message}"

        try:
            await ContactService.email_service.send_email(subject, body_text)
            logger.info("Email sent successfully")
        except HttpResponseError as e:
            logger.error(f"HttpResponseError while sending email: {e}")
            raise HTTPException(status_code=500, detail="Failed to send email due to email service error")
        except Exception as e:
            logger.error(f"Unexpected error while sending email: {e}")
            raise HTTPException(status_code=500, detail="Unexpected error in email service")
