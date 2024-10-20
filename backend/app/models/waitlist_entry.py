from sqlalchemy import Table, Column, Integer, String, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models import GenderEnum

waitlist_sire_association = Table(
    'waitlist_sire_association',
    Base.metadata,
    Column('waitlist_entry_id', Integer, ForeignKey('waitlist_entries.id'), primary_key=True),
    Column('dog_id', Integer, ForeignKey('dogs.id'), primary_key=True)
)

waitlist_dam_association = Table(
    'waitlist_dam_association',
    Base.metadata,
    Column('waitlist_entry_id', Integer, ForeignKey('waitlist_entries.id'), primary_key=True),
    Column('dog_id', Integer, ForeignKey('dogs.id'), primary_key=True)
)


class WaitlistEntry(Base):
    __tablename__ = "waitlist_entries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    gender_preference = Column(Enum(GenderEnum), nullable=True)
    color_preference = Column(String(255), nullable=True)
    additional_info = Column(Text, nullable=True)

    # Many-to-many relationships for sires and dams
    sires = relationship("Dog", secondary=waitlist_sire_association, backref="sire_waitlist_entries")
    dams = relationship("Dog", secondary=waitlist_dam_association, backref="dam_waitlist_entries")

    # Optional: Links to a specific breeding
    breeding_id = Column(Integer, ForeignKey("breedings.id"), nullable=True)
    breeding = relationship("Breeding", back_populates="waitlist_entries")

    def __repr__(self):
        return f"<WaitlistEntry name={self.name} email={self.email} phone={self.phone}>"
