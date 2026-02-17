"""Booking model and enums"""
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class BookingStatus(str, Enum):
    """Booking status enumeration"""
    BOOKED = "booked"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class BookingModel(BaseModel):
    """Booking document model"""
    id: str = Field(alias="_id")
    user_id: str
    car_id: str
    start_date: datetime
    end_date: datetime
    price_per_day_snapshot: float = Field(gt=0)
    total_price: float = Field(gt=0)
    status: BookingStatus = BookingStatus.BOOKED
    is_deleted: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    @field_validator('end_date')
    @classmethod
    def validate_dates(cls, end_date, info):
        """Validate that end_date is after start_date"""
        start_date = info.data.get('start_date')
        if start_date and end_date <= start_date:
            raise ValueError('end_date must be after start_date')
        return end_date
    
    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
