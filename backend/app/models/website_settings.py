from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String

from app.core.database import Base


class WebsiteSettings(Base):
    __tablename__ = "WebsiteSettings"
    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String, unique=True, index=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow)
