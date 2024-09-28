import enum
from datetime import datetime

from sqlalchemy import JSON, Boolean, Column, DateTime
from sqlalchemy import Enum as SQLAlchemyEnum
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base

# from uuid import UUID


class AnnouncementType(enum.Enum):
    LITTER = "litter"
    BREEDING = "breeding"
    STUD = "stud"
    ANNOUNCEMENT = "announcement"
    SERVICE = "service"
    INFO = "info"


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now())
    message = Column(Text, nullable=False)
    category = Column(SQLAlchemyEnum(AnnouncementType), nullable=False)
    page_id = Column(ForeignKey("pages.id"))

    def __init__(
        self, title: str, date: datetime, message: str, category: AnnouncementType, page_id: str
    ):
        self.title = title
        self.date = date
        self.message = message
        self.category = category
        self.page_id = page_id

class CarouselImage(Base):
    __tablename__ = "carousel_images"

    id = Column(Integer, primary_key=True, index=True)
    src = Column(String, nullable=False)
    alt = Column(String, nullable=True)
    page_id = Column(UUID(as_uuid=True), ForeignKey("pages.id"), nullable=False)

    def __init__(self, src: str, alt: str, page_id: UUID):
        self.src = src
        self.alt = alt
        self.page_id = page_id

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

    announcements = relationship(
        "Announcement", backref="page", cascade="all, delete-orphan"
    )
    carousel_images = relationship("CarouselImage", backref="page", cascade="all, delete-orphan")
