from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models import WebsiteSettings


async def update_global_updated_at(db: AsyncSession):
    query = select(WebsiteSettings).filter(
        WebsiteSettings.setting_key == "global_update"
    )
    result = await db.execute(query)
    setting = result.scalars().first()

    if setting:
        setting.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(setting)
