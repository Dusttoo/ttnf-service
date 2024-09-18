import enum
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Boolean, ForeignKey, Enum as SQLAlchemyEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
# from uuid import UUID


class AnnouncementType(enum.Enum):
    LITTER = 'litter'
    BREEDING = 'breeding'
    STUD = 'stud'
    ANNOUNCEMENT = 'announcement'
    SERVICE = 'service'
    INFO = 'info'


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now())
    message = Column(Text, nullable=False)
    category = Column(SQLAlchemyEnum(AnnouncementType), nullable=False)
    page_id = Column(ForeignKey("pages.id"))

    def __init__(self, title: str, date: datetime, message: str, category: AnnouncementType):
        self.title = title
        self.date = date
        self.message = message
        self.category = category


class Page(Base):
    __tablename__ = "pages"

    id = Column(UUID, primary_key=True, index=True)
    type = Column(String, nullable=False)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    meta = Column(JSON, nullable=True)
    custom_values = Column(JSON, nullable=True)
    external_data = Column(JSON, nullable=True)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    author = relationship("User", back_populates="pages")
    status = Column(String, nullable=False, default="draft")
    is_locked = Column(Boolean, nullable=False, default=False)
    tags = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)
    language = Column(String, nullable=False)
    translations = Column(JSON, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    carousel = Column(JSON, nullable=True)

    announcements = relationship("Announcement", backref="page", cascade="all, delete-orphan")