from app.schemas import ContactForm
from app.services.email_service import AzureEmailService
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.contact import ContactMessage


class ContactService:
    email_service = AzureEmailService()

    @staticmethod
    async def save_message(contact_data: ContactForm, db: AsyncSession):
        contact_message = ContactMessage(
            name=contact_data.name,
            email=contact_data.email,
            message=contact_data.message
        )
        db.add(contact_message)
        await db.commit()
        await db.refresh(contact_message)
        return contact_message

    @staticmethod
    async def send_email(contact_data: ContactForm):
        await ContactService.email_service.send_email(contact_data)
