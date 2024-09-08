from pydantic_settings import BaseSettings


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

    class Config:
        env_file = ".env"


settings = Settings()
