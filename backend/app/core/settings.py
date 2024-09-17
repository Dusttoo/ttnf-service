from fastapi import Depends
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import WebsiteSettings
from datetime import datetime
from app.core.database import get_database_session

async def update_global_updated_at(db: AsyncSession = Depends(get_database_session)):
    query = select(WebsiteSettings).filter(WebsiteSettings.setting_key == 'global_update')
    result = await db.execute(query)
    setting = result.scalars().first()
    if setting:
        setting.updated_at = datetime.utcnow()
        await db.commit()
    else:
        new_setting = WebsiteSettings(setting_key='global_update', updated_at=datetime.utcnow())
        db.add(new_setting)
        await db.commit()