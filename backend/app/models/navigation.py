from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class NavLink(Base):
    __tablename__ = "nav_links"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    editable = Column(Boolean, default=True)
    parent_id = Column(Integer, ForeignKey("nav_links.id"), nullable=True)
    position = Column(Integer, nullable=False)

    sub_links = relationship("NavLink", backref="parent", remote_side=[id])
