import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.core.settings import update_global_updated_at
from app.schemas import ImageResponse, MediaResponse, VideoResponse
from app.services import MediaService

logger = logging.getLogger(__name__)

media_router = APIRouter()


@media_router.post("/upload", response_model=MediaResponse)
async def upload_media(
    file: UploadFile = File(...),
    update_timestamp: None = Depends(update_global_updated_at),
):
    try:
        # Determine the media type
        media_type = "video" if file.content_type.startswith("video/") else "image"
        url, filename = await MediaService.upload_media(file, media_type)

        if media_type == "image":
            metadata = await MediaService.process_image(file)
            return ImageResponse(
                id=filename,
                url=url,
                type=media_type,
                filename=filename,
                width=metadata["width"],
                height=metadata["height"],
            )
        else:  # Assume it's a video
            metadata = await MediaService.process_video(file)
            return VideoResponse(
                id=filename,
                url=url,
                type=media_type,
                filename=filename,
                duration=metadata["duration"],
            )

    except Exception as e:
        logger.error(f"Error in upload_media: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@media_router.get("/{filename}", response_model=MediaResponse)
def get_media_url(filename: str):
    try:
        url = MediaService.get_media_url(filename)
        return MediaResponse(id=filename, url=url, type="unknown", filename=filename)
    except Exception as e:
        logger.error(f"Error in get_media_url: {e}", exc_info=True)
        raise HTTPException(status_code=404, detail="Media not found")
