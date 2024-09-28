from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import get_current_user
from app.core.redis import get_redis_client

utils_router = APIRouter()


@utils_router.post("/clear-cache", dependencies=[Depends(get_current_user)])
async def clear_cache(redis=Depends(get_redis_client)):
    try:
        await redis.flushall()  # Clears the entire cache
        return {"message": "Redis cache cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing cache: {e}")
