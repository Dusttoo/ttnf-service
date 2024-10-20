from sqlalchemy import Column, Integer, ForeignKey, Date, String
from sqlalchemy.orm import relationship
from app.core.database import Base


# Need to add a way to add an un-owned parent
# Should also add pedigree link
class Breeding(Base):
    __tablename__ = "breedings"
    id = Column(Integer, primary_key=True, index=True)
    female_dog_id = Column(Integer, ForeignKey("dogs.id"))
    male_dog_id = Column(Integer, ForeignKey("dogs.id"))
    breeding_date = Column(Date)
    expected_birth_date = Column(Date)
    description = Column(String(255), nullable=True)
    female_dog = relationship(
        "Dog", foreign_keys=[female_dog_id], backref="breedings_as_female"
    )
    male_dog = relationship(
        "Dog", foreign_keys=[male_dog_id], backref="breedings_as_male"
    )
    litters = relationship("Litter", back_populates="breeding")
    waitlist_entries = relationship("WaitlistEntry", back_populates="breeding")
    