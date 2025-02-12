import os
import uuid
from typing import Tuple

from app.core.config import settings
from azure.storage.blob import BlobServiceClient
from fastapi import UploadFile

connect_str = settings.azure_storage_connection_string
container_name = settings.azure_storage_container_name

blob_service_client = BlobServiceClient.from_connection_string(connect_str)
container_client = blob_service_client.get_container_client(container_name)


class MediaService:
    @staticmethod
    async def upload_media(file: UploadFile, context: dict) -> Tuple[str, str]:

        path_structure = f"{context.get('entity', '')}"

        unique_filename = f"{context.get('name', 'file')}-{uuid.uuid4()}{os.path.splitext(file.filename)[1]}"
        blob_path = f"{path_structure}/{unique_filename}"

        blob_client = container_client.get_blob_client(blob_path)
        content = await file.read()
        blob_client.upload_blob(content, overwrite=True)

        return blob_client.url, blob_path

    @staticmethod
    def get_media_url(filename: str) -> str:
        blob_client = container_client.get_blob_client(filename)
        return blob_client.url

    @staticmethod
    async def process_image(file: UploadFile) -> dict:
        return {"width": 1920, "height": 1080}

    @staticmethod
    async def process_video(file: UploadFile) -> dict:
        return {"duration": 3600}
