from pydantic import BaseModel, Field, field_validator
import re

class UserBaseSchema(BaseModel):
    username: str = Field(..., json_schema_extra={"example": "john_doe"})
    email: str = Field(..., json_schema_extra={"example": "john@example.com"})

    @field_validator("email", mode="before")
    def validate_email(cls, value):
        pattern = r"^\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b$"
        if not re.match(pattern, value):
            raise ValueError("Invalid email format")
        return value


class UserCreateSchema(UserBaseSchema):
    password: str


class UserSchema(UserBaseSchema):
    id: int

    class Config:
        from_attributes = True


class UserLoginSchema(BaseModel):
    username: str
    password: str


class TokenSchema(BaseModel):
    access_token: str
    token_type: str
    user: UserSchema


class PublicToken(BaseModel):
    public_token: str
