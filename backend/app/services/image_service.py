from azure.storage.blob import BlobServiceClient
from fastapi import UploadFile
from app.core.config import settings
from typing import Tuple

connect_str = settings.azure_storage_connection_string
container_name = settings.azure_storage_container_name

blob_service_client = BlobServiceClient.from_connection_string(connect_str)
container_client = blob_service_client.get_container_client(container_name)


class MediaService:
    @staticmethod
    async def upload_media(file: UploadFile, media_type: str) -> Tuple[str, str]:
        blob_client = container_client.get_blob_client(file.filename)
        content = await file.read()
        blob_client.upload_blob(content, overwrite=True)
        return blob_client.url, file.filename

    @staticmethod
    def get_media_url(filename: str) -> str:
        blob_client = container_client.get_blob_client(filename)
        return blob_client.url

    @staticmethod
    async def process_image(file: UploadFile) -> dict:
        # Placeholder for image processing logic (e.g., extracting dimensions)
        return {"width": 1920, "height": 1080}

    @staticmethod
    async def process_video(file: UploadFile) -> dict:
        # Placeholder for video processing logic (e.g., extracting duration)
        return {"duration": 3600}
