import logging
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from app.core.settings import update_global_updated_at
from app.schemas import ImageResponse, MediaResponse, VideoResponse
from app.services import MediaService

logger = logging.getLogger(__name__)

media_router = APIRouter()


@media_router.post("/upload", response_model=MediaResponse)
async def upload_media(
    entity: str,  # e.g., "dogs", "products", "user_profiles"
    name: str,
    type: str,  # "image" or "video"
    file: UploadFile = File(...),
    update_timestamp: None = Depends(update_global_updated_at),
):
    try:
        context = {"entity": entity, "name": name, "type": type}

        url, filename = await MediaService.upload_media(file, context)

        if type == "image":
            metadata = await MediaService.process_image(file)
            return ImageResponse(
                id=filename,
                url=url,
                type=type,
                filename=filename,
                width=metadata["width"],
                height=metadata["height"],
            )
        elif type == "video":
            metadata = await MediaService.process_video(file)
            return VideoResponse(
                id=filename,
                url=url,
                type=type,
                filename=filename,
                duration=metadata["duration"],
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid media type")

    except Exception as e:
        logger.error(f"Error in upload_media: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@media_router.get("/{entity}/{name}/{filename}", response_model=MediaResponse)
def get_media_url(entity: str, name: str, filename: str):
    try:
        full_filename = f"{entity}/{name}/{filename}"
        url = MediaService.get_media_url(full_filename)
        return MediaResponse(id=filename, url=url, type="unknown", filename=filename)
    except Exception as e:
        logger.error(f"Error in get_media_url: {e}", exc_info=True)
        raise HTTPException(status_code=404, detail="Media not found")
