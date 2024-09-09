from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from app.core.database import Base
from app.models import User, Dog, Production, HealthInfo, Photo, Breeding, Litter, Page
from app.core.config import settings

DATABASE_URL = settings.sqlalchemy_database_url

engine = create_engine(DATABASE_URL)
session = Session(bind=engine)


def undo_seed_data(session):
    session.query(HealthInfo).delete()
    session.query(Photo).delete()
    session.query(Production).delete()
    session.query(User).delete()
    session.query(Litter).delete()
    session.query(Breeding).delete()
    session.query(Dog).delete()
    session.query(Page).delete()

    session.commit()


undo_seed_data(session)
print("Seed data removed successfully.")
