from pydantic import BaseModel


class MediaResponse(BaseModel):
    id: str  
    url: str
    type: str 
    filename: str


class ImageResponse(MediaResponse):
    width: int
    height: int


class VideoResponse(MediaResponse):
    duration: int  
