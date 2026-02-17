"""Car schemas for requests and responses"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, HttpUrl

from app.models.car import CarCategory, TransmissionType, FuelType


class CarCreateRequest(BaseModel):
    """Car creation request schema (Admin only)"""
    name: str = Field(..., min_length=2, max_length=100)
    brand: str = Field(..., min_length=2, max_length=50)
    category: CarCategory
    price_per_day: float = Field(..., gt=0, description="Price per day in currency")
    total_quantity: int = Field(..., ge=1, description="Total number of cars available")
    image_url: str = Field(..., description="Car image URL")
    transmission: TransmissionType
    fuel_type: FuelType
    seats: int = Field(..., ge=2, le=10)
    description: Optional[str] = Field(None, max_length=500)
    features: list[str] = Field(default_factory=list, max_length=20)
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Mercedes Benz S-Class",
                "brand": "Mercedes Benz",
                "category": "Sedan",
                "price_per_day": 5999,
                "total_quantity": 5,
                "image_url": "https://example.com/image.jpg",
                "transmission": "Automatic",
                "fuel_type": "Diesel",
                "seats": 5,
                "description": "Luxury sedan with premium features",
                "features": ["Leather Seats", "Sunroof", "GPS"]
            }
        }


class CarUpdateRequest(BaseModel):
    """Car update request schema (Admin only)"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    brand: Optional[str] = Field(None, min_length=2, max_length=50)
    category: Optional[CarCategory] = None
    price_per_day: Optional[float] = Field(None, gt=0)
    total_quantity: Optional[int] = Field(None, ge=1)
    image_url: Optional[str] = None
    transmission: Optional[TransmissionType] = None
    fuel_type: Optional[FuelType] = None
    seats: Optional[int] = Field(None, ge=2, le=10)
    description: Optional[str] = Field(None, max_length=500)
    features: Optional[list[str]] = Field(None, max_length=20)
    
    class Config:
        json_schema_extra = {
            "example": {
                "price_per_day": 6499,
                "total_quantity": 6
            }
        }


class CarResponse(BaseModel):
    """Car response schema with availability"""
    id: str = Field(alias="_id")
    name: str
    brand: str
    category: CarCategory
    price_per_day: float
    total_quantity: int
    available_quantity: int = Field(description="Dynamically calculated available quantity")
    is_available: bool = Field(description="Whether car is available for booking")
    status: str = Field(description="Availability status: 'available' or 'unavailable'")
    image_url: str
    transmission: TransmissionType
    fuel_type: FuelType
    seats: int
    description: Optional[str] = None
    features: list[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "name": "Mercedes Benz S-Class",
                "brand": "Mercedes Benz",
                "category": "Sedan",
                "price_per_day": 5999,
                "total_quantity": 5,
                "available_quantity": 3,
                "is_available": True,
                "status": "available",
                "image_url": "https://example.com/image.jpg",
                "transmission": "Automatic",
                "fuel_type": "Diesel",
                "seats": 5,
                "description": "Luxury sedan",
                "features": ["Leather Seats", "Sunroof"],
                "created_at": "2025-01-16T10:30:00Z",
                "updated_at": "2025-01-16T10:30:00Z"
            }
        }


class CarFilterParams(BaseModel):
    """Car filtering parameters"""
    category: Optional[CarCategory] = None
    min_price: Optional[float] = Field(None, ge=0)
    max_price: Optional[float] = Field(None, ge=0)
    transmission: Optional[TransmissionType] = None
    fuel_type: Optional[FuelType] = None
    seats: Optional[int] = Field(None, ge=2, le=10)
    available_only: bool = Field(default=False, description="Show only available cars")
    start_date: Optional[datetime] = Field(None, description="Check availability for this date range")
    end_date: Optional[datetime] = Field(None, description="Check availability for this date range")


class CarSortParams(BaseModel):
    """Car sorting parameters"""
    sort_by: str = Field(default="created_at", pattern="^(price_per_day|created_at|name|popularity)$")
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$")
