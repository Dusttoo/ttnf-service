from sqlalchemy import Column, Integer, ForeignKey, Date, Table, String, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

litter_puppies = Table(
    "litter_puppies",
    Base.metadata,
    Column("litter_id", Integer, ForeignKey("litters.id")),
    Column("dog_id", Integer, ForeignKey("dogs.id")),
)


class Litter(Base):
    __tablename__ = "litters"
    id = Column(Integer, primary_key=True, index=True)
    breeding_id = Column(Integer, ForeignKey("breedings.id"))
    birth_date = Column(Date, nullable=True)
    number_of_puppies = Column(Integer, nullable=True)
    litter_url = Column(String, nullable=True)
    description = Column(JSON, nullable=True)

    breeding = relationship("Breeding", back_populates="litters")
    puppies = relationship(
        "Dog",
        secondary=litter_puppies,
        backref="litters",
        primaryjoin="Litter.id == litter_puppies.c.litter_id",
        secondaryjoin="Dog.id == litter_puppies.c.dog_id",
    )
