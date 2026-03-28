"""User schemas for requests and responses"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator
import re

from app.models.user import UserRole


class UserRegisterRequest(BaseModel):
    """User registration request schema"""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = Field(None, pattern=r'^\+?[1-9]\d{9,14}$')
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        """Validate password strength"""
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Password must contain at least one special character')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "SecurePass123!",
                "full_name": "John Doe",
                "phone": "+919876543210"
            }
        }


class UserLoginRequest(BaseModel):
    """User login request schema"""
    email: EmailStr
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "SecurePass123!"
            }
        }


class UserResponse(BaseModel):
    """User response schema"""
    id: str = Field(alias="_id")
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    profile_completed: bool = False
    role: UserRole
    is_active: bool
    created_at: datetime
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "email": "user@example.com",
                "full_name": "John Doe",
                "phone": "+919876543210",
                "profile_completed": False,
                "role": "user",
                "is_active": True,
                "created_at": "2025-01-16T10:30:00Z"
            }
        }


class TokenResponse(BaseModel):
    """Authentication token response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "_id": "507f1f77bcf86cd799439011",
                    "email": "user@example.com",
                    "full_name": "John Doe",
                    "role": "user",
                    "is_active": True
                }
            }
        }


class ProfileCompletionRequest(BaseModel):
    """Profile completion request schema"""
    phone: str = Field(..., pattern=r'^\+?[1-9]\d{9,14}$')
    address: str = Field(..., min_length=5, max_length=500)
    driving_license_number: str = Field(..., min_length=5, max_length=50)
    age: int = Field(..., ge=18, le=100)
    
    @field_validator('age')
    @classmethod
    def validate_age(cls, v):
        """Validate age is within acceptable range"""
        if not isinstance(v, int):
            raise ValueError('Age must be a number')
        if v < 18:
            raise ValueError('You must be at least 18 years old to rent a vehicle')
        if v > 100:
            raise ValueError('Please enter a valid age')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "phone": "+919876543210",
                "address": "123 Main Street, City, State 12345",
                "driving_license_number": "DL0001234561234",
                "age": 28
            }
        }


class UserResponseWithProfile(BaseModel):
    """User response schema with profile information"""
    id: str = Field(alias="_id")
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    age: Optional[int] = None
    driving_license_number: Optional[str] = None
    driving_license_upload_url: Optional[str] = None
    profile_completed: bool
    role: UserRole
    is_active: bool
    created_at: datetime
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "email": "user@example.com",
                "full_name": "John Doe",
                "phone": "+919876543210",
                "address": "123 Main Street, City, State 12345",
                "age": 28,
                "driving_license_number": "DL0001234561234",
                "driving_license_upload_url": "/uploads/licenses/user_id_timestamp.jpg",
                "profile_completed": True,
                "role": "user",
                "is_active": True,
                "created_at": "2025-01-16T10:30:00Z"
            }
        }


class ProfileCompletionResponse(BaseModel):
    """Profile completion response schema"""
    message: str
    profile_completed: bool
    user: UserResponseWithProfile
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "Profile completed successfully",
                "profile_completed": True,
                "user": {
                    "_id": "507f1f77bcf86cd799439011",
                    "email": "user@example.com",
                    "full_name": "John Doe",
                    "phone": "+919876543210",
                    "address": "123 Main Street, City, State 12345",
                    "age": 28,
                    "driving_license_number": "DL0001234561234",
                    "driving_license_upload_url": "/uploads/licenses/user_id_timestamp.jpg",
                    "profile_completed": True,
                    "role": "user",
                    "is_active": True,
                    "created_at": "2025-01-16T10:30:00Z"
                }
            }
        }

