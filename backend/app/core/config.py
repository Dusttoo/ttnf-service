from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    sqlalchemy_database_url: str
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    project_name: str
    azure_storage_connection_string: str
    azure_storage_container_name: str
    instrumentation_key: str
    redis_host: str
    redis_port: int
    redis_db: str
    redis_password: str
    env: str
    acs_email_connection_string: str
    acs_sender_email: str
    acs_recipient_emails: List[str]

    class Config:
        env_file = ".env"

    @classmethod
    def parse_comma_separated_emails(cls, v: str) -> List[str]:
        return v.split(",") if v else []

    _validators = {
        'acs_recipient_emails': parse_comma_separated_emails,
    }


settings = Settings()
