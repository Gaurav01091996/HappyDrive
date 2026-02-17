"""Car model and enums"""
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, HttpUrl


class CarCategory(str, Enum):
    """Car category enumeration"""
    SEDAN = "Sedan"
    SUV = "SUV"
    SPORTS = "Sports"
    HATCHBACK = "Hatchback"


class TransmissionType(str, Enum):
    """Transmission type enumeration"""
    AUTOMATIC = "Automatic"
    MANUAL = "Manual"


class FuelType(str, Enum):
    """Fuel type enumeration"""
    PETROL = "Petrol"
    DIESEL = "Diesel"
    ELECTRIC = "Electric"
    HYBRID = "Hybrid"


class CarModel(BaseModel):
    """Car document model"""
    id: str = Field(alias="_id")
    name: str
    brand: str
    category: CarCategory
    price_per_day: float = Field(gt=0)
    total_quantity: int = Field(ge=1)
    image_url: str
    transmission: TransmissionType
    fuel_type: FuelType
    seats: int = Field(ge=2, le=10)
    description: Optional[str] = None
    features: list[str] = Field(default_factory=list)
    is_deleted: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
