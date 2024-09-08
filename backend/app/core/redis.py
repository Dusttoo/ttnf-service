import redis.asyncio as redis
from app.core.config import settings


async def get_redis_client():
    redis_url = (
        f"redis://{settings.redis_host}:{settings.redis_port}/{settings.redis_db}"
    )
    return redis.from_url(redis_url, password=settings.redis_password)


async def delete_pattern(redis_client, pattern: str):
    keys = await redis_client.keys(pattern)
    if keys:
        await redis_client.delete(*keys)
