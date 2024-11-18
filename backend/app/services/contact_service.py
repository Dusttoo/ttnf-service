from azure.core.exceptions import HttpResponseError
from sqlalchemy import select, func
from fastapi import HTTPException
from app.schemas import ContactForm, PaginatedResponse
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
        body_text = f"Name: {contact_data.name}\nEmail: {contact_data.email}\nMessage: {contact_data.message}"

        try:
            await ContactService.email_service.send_email(subject, body_text, contact_data.name, contact_data.email)
            logger.info("Email sent successfully")
        except HttpResponseError as e:
            logger.error(f"HttpResponseError while sending email: {e}")
            raise HTTPException(status_code=500, detail="Failed to send email due to email service error")
        except Exception as e:
            logger.error(f"Unexpected error while sending email: {e}")
            raise HTTPException(status_code=500, detail="Unexpected error in email service")
        
    @staticmethod
    async def get_contact_submissions_count(db: AsyncSession) -> int:
        try:
            query = select(func.count(ContactMessage.id))
            result = await db.execute(query)
            count = result.scalar_one()
            return count
        except Exception as e:
            logger.error(f"Error in get_contact_submissions_count: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Could not retrieve contact submissions count")
        
    @staticmethod
    async def get_contact_submissions(page: int = 1, page_size: int = 10, db: AsyncSession = None) -> PaginatedResponse[ContactForm]:
        """
        Fetch paginated contact submissions.
        """
        try:
            offset = (page - 1) * page_size
            query = select(ContactMessage).offset(offset).limit(page_size)
            result = await db.execute(query)
            submissions = result.scalars().all()
            
            # Convert ORM objects to Pydantic schemas
            submissions_data = [ContactForm.from_orm(submission) for submission in submissions]
            
            # Get total count for pagination
            count_query = select(func.count(ContactMessage.id))
            count_result = await db.execute(count_query)
            total_count = count_result.scalar_one()
            
            return PaginatedResponse[
                ContactForm
            ](
                items=submissions_data,
                total_count=total_count,
                page=page,
                page_size=page_size
            )
        except Exception as e:
            logger.error(f"Error in get_contact_submissions: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Could not retrieve contact submissions")
