from app.core.database import Base
from sqlalchemy import Column, Date, ForeignKey, Integer, String
from sqlalchemy.orm import relationship


class Breeding(Base):
    __tablename__ = "breedings"
    id = Column(Integer, primary_key=True, index=True)
    female_dog_id = Column(Integer, ForeignKey("dogs.id"))
    male_dog_id = Column(
        Integer, ForeignKey("dogs.id"), nullable=True
    )  # Nullable to allow for manual sire details
    breeding_date = Column(Date, nullable=True)
    expected_birth_date = Column(Date, nullable=True)
    description = Column(String(2500), nullable=True)

    # Manual sire details
    manual_sire_name = Column(String(255), nullable=True)
    manual_sire_color = Column(String(50), nullable=True)
    manual_sire_image_url = Column(String(255), nullable=True)
    manual_sire_pedigree_link = Column(String(255), nullable=True)

    # Relationships
    female_dog = relationship(
        "Dog", foreign_keys=[female_dog_id], backref="breedings_as_female"
    )
    male_dog = relationship(
        "Dog", foreign_keys=[male_dog_id], backref="breedings_as_male"
    )
    litters = relationship("Litter", back_populates="breeding")
    waitlist_entries = relationship("WaitlistEntry", back_populates="breeding")
