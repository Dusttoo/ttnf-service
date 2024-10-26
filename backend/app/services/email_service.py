from app.core.config import settings
from azure.communication.email import EmailClient
from azure.core.exceptions import HttpResponseError
from fastapi import HTTPException
import os

ACS_EMAIL_CONNECTION_STRING = settings.acs_email_connection_string
SENDER_EMAIL = settings.acs_sender_email


class AzureEmailService:
    def __init__(self):
        pass
        # self.email_client = EmailClient.from_connection_string(ACS_EMAIL_CONNECTION_STRING)

    async def send_email(self, recipient_email: str, subject: str, body_text: str):
        pass
        # email_message = {
        #     "senderAddress": SENDER_EMAIL,
        #     "content": {
        #         "subject": subject,
        #         "plainText": body_text
        #     },
        #     "recipients": [
        #         {
        #             "address": recipient_email
        #         }
        #     ]
        # }
        #
        # try:
        #     response = self.email_client.send(email_message)
        #     print(f"Email sent! Message Id: {response['messageId']}")
        # except HttpResponseError as e:
        #     print(f"Failed to send email: {e}")
        #     raise HTTPException(status_code=500, detail="Failed to send email")
