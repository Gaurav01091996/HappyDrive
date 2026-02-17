"""Booking schemas for requests and responses"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

from app.models.booking import BookingStatus


class BookingCreateRequest(BaseModel):
    """Booking creation request schema"""
    car_id: str = Field(..., description="ID of the car to book")
    start_date: datetime = Field(..., description="Booking start date and time (UTC)")
    end_date: datetime = Field(..., description="Booking end date and time (UTC)")
    
    @field_validator('start_date')
    @classmethod
    def validate_start_date(cls, v):
        """Validate that start_date is not in the past"""
        if v < datetime.utcnow():
            raise ValueError('start_date cannot be in the past')
        return v
    
    @field_validator('end_date')
    @classmethod
    def validate_end_date(cls, end_date, info):
        """Validate that end_date is after start_date"""
        start_date = info.data.get('start_date')
        if start_date and end_date <= start_date:
            raise ValueError('end_date must be after start_date')
        return end_date
    
    class Config:
        json_schema_extra = {
            "example": {
                "car_id": "507f1f77bcf86cd799439011",
                "start_date": "2025-02-01T10:00:00Z",
                "end_date": "2025-02-05T18:00:00Z"
            }
        }


class BookingUpdateStatusRequest(BaseModel):
    """Booking status update request schema"""
    status: BookingStatus
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "completed"
            }
        }


class BookingResponse(BaseModel):
    """Booking response schema"""
    id: str = Field(alias="_id")
    user_id: str
    car_id: str
    start_date: datetime
    end_date: datetime
    price_per_day_snapshot: float
    total_price: float
    status: BookingStatus
    created_at: datetime
    updated_at: datetime
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "user_id": "507f1f77bcf86cd799439012",
                "car_id": "507f1f77bcf86cd799439013",
                "start_date": "2025-02-01T10:00:00Z",
                "end_date": "2025-02-05T18:00:00Z",
                "price_per_day_snapshot": 5999,
                "total_price": 23996,
                "status": "booked",
                "created_at": "2025-01-16T10:30:00Z",
                "updated_at": "2025-01-16T10:30:00Z"
            }
        }


class BookingDetailResponse(BookingResponse):
    """Booking response with car and user details"""
    car_name: Optional[str] = None
    car_brand: Optional[str] = None
    car_image_url: Optional[str] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None


class BookingFilterParams(BaseModel):
    """Booking filtering parameters"""
    status: Optional[BookingStatus] = None
    car_id: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
