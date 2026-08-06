from pydantic import BaseModel
from pydantic import EmailStr

from app.models.user import Role


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    mobile: str
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    user_id: int
    full_name: str
    email: EmailStr
    role: Role
    access_token: str
    token_type: str = "Bearer"

    class Config:
        from_attributes = True