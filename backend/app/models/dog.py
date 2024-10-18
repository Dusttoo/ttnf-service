from sqlalchemy import Column, Integer, String, ForeignKey, Date, Table, Boolean
from sqlalchemy.orm import relationship, backref
from app.core.database import Base
import enum
from sqlalchemy import Enum


class GenderEnum(enum.Enum):
    male = "Male"
    female = "Female"


class StatusEnum(enum.Enum):
    available = "Available"
    sold = "Sold"
    stud = "Available For Stud"
    retired = "Retired"
    active = "Active"
    abkc_champion = "ABKC Champion"


class HealthInfo(Base):
    __tablename__ = "health_info"
    id = Column(Integer, primary_key=True, index=True)
    dog_id = Column(Integer, ForeignKey("dogs.id", ondelete="CASCADE"))
    dna = Column(String(255))
    carrier_status = Column(String(255))
    extra_info = Column(String(255))
    dog = relationship("Dog", back_populates="health_infos")


class Photo(Base):
    __tablename__ = "photos"
    id = Column(Integer, primary_key=True, index=True)
    dog_id = Column(Integer, ForeignKey("dogs.id", ondelete="CASCADE"))
    photo_url = Column(String(255), nullable=False)
    alt = Column(String(255), nullable=False)
    dog = relationship("Dog", back_populates="photos")


dog_production_link = Table(
    "dog_production_link",
    Base.metadata,
    Column("dog_id", Integer, ForeignKey("dogs.id", ondelete="CASCADE")),
    Column("production_id", Integer, ForeignKey("productions.id", ondelete="CASCADE")),
)


class Production(Base):
    __tablename__ = "productions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)

    dob = Column(Date, nullable=True)
    owner = Column(String(255), nullable=True)
    description = Column(String(255), nullable=True)
    sire_id = Column(Integer, ForeignKey("dogs.id"), nullable=True)
    dam_id = Column(Integer, ForeignKey("dogs.id"), nullable=True)
    gender = Column(Enum(GenderEnum), nullable=False)
    profile_photo = Column(String)
    sire = relationship("Dog", foreign_keys=[sire_id], backref="sired_productions")
    dam = relationship("Dog", foreign_keys=[dam_id], backref="damed_productions")
    dogs = relationship(
        "Dog", secondary=dog_production_link, back_populates="productions"
    )


class Dog(Base):
    __tablename__ = "dogs"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    dob = Column(Date, nullable=True)
    gender = Column(Enum(GenderEnum), nullable=False)
    color = Column(String(255), nullable=True)
    status = Column(Enum(StatusEnum), nullable=True)
    profile_photo = Column(String(255), nullable=True)
    stud_fee = Column(Integer, nullable=True)
    sale_fee = Column(Integer, nullable=True)
    description = Column(String(2500), nullable=True)
    pedigree_link = Column(String(255), nullable=True)
    video_url = Column(String(255), nullable=True)
    parent_male_id = Column(Integer, ForeignKey("dogs.id"), nullable=True)
    parent_female_id = Column(Integer, ForeignKey("dogs.id"), nullable=True)
    is_production = Column(Boolean, default=False)
    kennel_own = Column(Boolean, default=True)
    is_retired = Column(Boolean, default=False)

    health_infos = relationship("HealthInfo", back_populates="dog")
    photos = relationship("Photo", back_populates="dog")
    children = relationship(
        "Dog",
        foreign_keys=[parent_male_id, parent_female_id],
        primaryjoin="or_(Dog.id==Dog.parent_male_id, Dog.id==Dog.parent_female_id)",
        backref=backref("parents", remote_side=[id]),
    )
    productions = relationship(
        "Production", secondary=dog_production_link, back_populates="dogs"
    )
