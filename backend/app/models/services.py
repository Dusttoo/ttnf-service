from sqlalchemy import Column, Integer, String, Enum as SAEnum, Boolean, Enum, Text, DateTime, Float, Table, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()

# Enums for availability and shipping type
class ServiceStatus(str, enum.Enum):
    AVAILABLE = "Available"
    LIMITED = "Limited"
    OUT_OF_STOCK = "Out of Stock"

class ShippingType(enum.Enum):
    STANDARD = "Standard"
    EXPRESS = "Express"
    OVERNIGHT = "Overnight"

# Association table for tags
service_tags = Table('service_tags', Base.metadata,
    Column('service_id', Integer, ForeignKey('services.id')),
    Column('tag_id', Integer, ForeignKey('tags.id'))
)

# Tags Model
class Tag(Base):
    __tablename__ = 'tags'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)

# Service Category Model
class ServiceCategory(Base):
    __tablename__ = 'service_categories'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    display = Column(Boolean, default=True)
    position = Column(Integer, nullable=False)

    services = relationship("Service", back_populates="category")

# Service Model
class Service(Base):
    __tablename__ = 'services'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(String(50))
    availability = Column(SAEnum(ServiceStatus), default=ServiceStatus.AVAILABLE)
    cta_name = Column(String(100))
    cta_link = Column(String(250))
    disclaimer = Column(Text)

    eta = Column(DateTime, default=None)
    estimated_price = Column(String(50))
    shipping_type = Column(SAEnum(ShippingType))

    image = Column(String(250))
    category_id = Column(Integer, ForeignKey('service_categories.id'))
    category = relationship("ServiceCategory", back_populates="services")

    tags = relationship("Tag", secondary=service_tags, back_populates="services")

Tag.services = relationship("Service", secondary=service_tags, back_populates="tags")