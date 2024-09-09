from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Boolean, text, ForeignKey, UUID
from sqlalchemy.sql import func
from app.core.database import Base
from sqlalchemy.orm import relationship


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
    invalid_block_types = Column(JSON, nullable=True)
    status = Column(String, nullable=False, default="draft")
    is_locked = Column(Boolean, nullable=False, default=False)
    tags = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)
    language = Column(String, nullable=False)
    translations = Column(JSON, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
