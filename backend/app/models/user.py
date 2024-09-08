from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone_number = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, nullable=False) 
    last_name = Column(String, nullable=False) 
    avatar_url = Column(String, nullable=True) 
    company = Column(String, nullable=True) 
    role = Column(String, nullable=False, default="user")  

    # Establish a relationship with the Page model
    pages = relationship("Page", back_populates="author")

    def set_password(self, password):
        self.hashed_password = pwd_context.hash(password)

    def verify_password(self, plain_password):
        return pwd_context.verify(plain_password, self.hashed_password)
