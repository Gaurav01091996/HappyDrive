"""User model and enums"""
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRole(str, Enum):
    """User role enumeration"""
    ADMIN = "admin"
    USER = "user"


class UserModel(BaseModel):
    """User document model"""
    id: str = Field(alias="_id")
    email: EmailStr
    hashed_password: str
    full_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.USER
    is_active: bool = True
    is_deleted: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
