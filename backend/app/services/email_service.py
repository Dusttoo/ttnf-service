from app.core.config import settings
from azure.communication.email import EmailClient
from azure.core.exceptions import HttpResponseError, ServiceRequestError
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

ACS_EMAIL_CONNECTION_STRING = settings.acs_email_connection_string
SENDER_EMAIL = settings.acs_sender_email
RECIPIENT_EMAILS = settings.acs_recipient_emails


class AzureEmailService:
    def __init__(self):
        if not ACS_EMAIL_CONNECTION_STRING or not SENDER_EMAIL or not RECIPIENT_EMAILS:
            logger.error("ACS_EMAIL_CONNECTION_STRING, SENDER_EMAIL, or RECIPIENT_EMAILS is not set")
            raise ValueError("Email service configuration is missing")

        try:
            self.email_client = EmailClient.from_connection_string(ACS_EMAIL_CONNECTION_STRING)
            logger.info("Email client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize EmailClient: {e}")
            raise HTTPException(status_code=500, detail="Email service initialization failed")

    async def send_email(self, subject: str, body_text: str):
        email_message = {
            "senderAddress": SENDER_EMAIL,
            "content": {
                "subject": subject,
                "plainText": body_text
            },
            "recipients": {
                "to": [{"address": email.strip()} for email in RECIPIENT_EMAILS if email.strip()]
            }
        }

        try:
            poller = self.email_client.begin_send(email_message)
            result = poller.result()
            logger.info(f"Email sent successfully! Message Id: {result['id']}")
        except HttpResponseError as e:
            logger.error(f"HttpResponseError while sending email: {e}")
            raise HTTPException(status_code=500, detail="Failed to send email due to a service error")
        except ServiceRequestError as e:
            logger.error(f"ServiceRequestError: Could not connect to email service: {e}")
            raise HTTPException(status_code=500, detail="Failed to connect to email service")
        except Exception as e:
            logger.error(f"Unexpected error while sending email: {e}")
            raise HTTPException(status_code=500, detail="Unexpected error in email service")
