from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models import GenderEnum

class WaitlistEntry(Base):
    __tablename__ = "waitlist_entries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    gender_preference = Column(Enum(GenderEnum), nullable=True)
    color_preference = Column(String(255), nullable=True)
    sire_id = Column(Integer, ForeignKey("dogs.id"), nullable=True)
    dam_id = Column(Integer, ForeignKey("dogs.id"), nullable=True)
    additional_info = Column(Text, nullable=True)

    # Relationships to the sire and dam models
    sire = relationship("Dog", foreign_keys=[sire_id])
    dam = relationship("Dog", foreign_keys=[dam_id])

    # Optional: Links to a specific breeding
    breeding_id = Column(Integer, ForeignKey("breedings.id"), nullable=True)
    breeding = relationship("Breeding", back_populates="waitlist_entries")

    def __repr__(self):
        return f"<WaitlistEntry name={self.name} email={self.email} phone={self.phone}>"