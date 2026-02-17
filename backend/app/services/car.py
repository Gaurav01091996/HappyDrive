"""Car service for CRUD operations with dynamic availability"""
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.car import (
    CarCreateRequest,
    CarUpdateRequest,
    CarResponse,
    CarFilterParams,
    CarSortParams
)
from app.schemas.common import PaginationParams, PaginatedResponse
from app.models.booking import BookingStatus


class CarService:
    """Service for car operations with dynamic availability calculation"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.cars
        self.bookings_collection = db.bookings
    
    async def calculate_available_quantity(
        self,
        car_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> int:
        """
        Calculate available quantity dynamically based on active bookings
        
        Formula: available_quantity = total_quantity - active_bookings_for_date_range
        
        Args:
            car_id: Car ID
            start_date: Optional start date for availability check
            end_date: Optional end date for availability check
            
        Returns:
            Available quantity count
        """
        # Get car total quantity
        car = await self.collection.find_one({"_id": car_id, "is_deleted": False})
        if not car:
            return 0
        
        total_quantity = car["total_quantity"]
        
        # Build query for overlapping bookings
        query = {
            "car_id": car_id,
            "status": BookingStatus.BOOKED,
            "is_deleted": False
        }
        
        # If date range provided, check for overlapping bookings
        if start_date and end_date:
            # Bookings overlap if:
            # (booking_start < requested_end) AND (booking_end > requested_start)
            query["$or"] = [
                {
                    "start_date": {"$lt": end_date},
                    "end_date": {"$gt": start_date}
                }
            ]
        else:
            # No date range, count all active bookings
            query["end_date"] = {"$gte": datetime.utcnow()}
        
        # Count active bookings
        active_bookings_count = await self.bookings_collection.count_documents(query)
        
        # Calculate available quantity
        available_quantity = max(0, total_quantity - active_bookings_count)
        
        return available_quantity
    
    async def enrich_car_with_availability(
        self,
        car: Dict[str, Any],
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Enrich car document with availability information
        
        Args:
            car: Car document from database
            start_date: Optional start date for availability check
            end_date: Optional end date for availability check
            
        Returns:
            Car document with availability fields added
        """
        available_quantity = await self.calculate_available_quantity(
            car["_id"],
            start_date,
            end_date
        )
        
        car["available_quantity"] = available_quantity
        car["is_available"] = available_quantity > 0
        car["status"] = "available" if available_quantity > 0 else "unavailable"
        
        return car
    
    async def create_car(self, car_data: CarCreateRequest) -> CarResponse:
        """
        Create a new car (Admin only)
        
        Args:
            car_data: Car creation data
            
        Returns:
            Created car with availability information
        """
        car_id = str(uuid.uuid4())
        
        car_doc = {
            "_id": car_id,
            "name": car_data.name,
            "brand": car_data.brand,
            "category": car_data.category,
            "price_per_day": car_data.price_per_day,
            "total_quantity": car_data.total_quantity,
            "image_url": car_data.image_url,
            "transmission": car_data.transmission,
            "fuel_type": car_data.fuel_type,
            "seats": car_data.seats,
            "description": car_data.description,
            "features": car_data.features,
            "is_deleted": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await self.collection.insert_one(car_doc)
        
        # Enrich with availability
        car_doc = await self.enrich_car_with_availability(car_doc)
        
        return CarResponse(**car_doc)
    
    async def get_cars(
        self,
        pagination: PaginationParams,
        filters: CarFilterParams,
        sort: CarSortParams
    ) -> PaginatedResponse[CarResponse]:
        """
        Get cars with pagination, filtering, and sorting
        
        Args:
            pagination: Pagination parameters
            filters: Filter parameters
            sort: Sort parameters
            
        Returns:
            Paginated list of cars with availability
        """
        # Build query
        query = {"is_deleted": False}
        
        if filters.category:
            query["category"] = filters.category
        
        if filters.min_price is not None or filters.max_price is not None:
            query["price_per_day"] = {}
            if filters.min_price is not None:
                query["price_per_day"]["$gte"] = filters.min_price
            if filters.max_price is not None:
                query["price_per_day"]["$lte"] = filters.max_price
        
        if filters.transmission:
            query["transmission"] = filters.transmission
        
        if filters.fuel_type:
            query["fuel_type"] = filters.fuel_type
        
        if filters.seats:
            query["seats"] = filters.seats
        
        # Build sort
        sort_field = sort.sort_by
        sort_direction = 1 if sort.sort_order == "asc" else -1
        
        # Get total count
        total = await self.collection.count_documents(query)
        
        # Get cars
        cursor = self.collection.find(query).sort(
            sort_field, sort_direction
        ).skip(pagination.skip).limit(pagination.limit)
        
        cars = await cursor.to_list(length=pagination.limit)
        
        # Enrich with availability
        enriched_cars = []
        for car in cars:
            enriched_car = await self.enrich_car_with_availability(
                car,
                filters.start_date,
                filters.end_date
            )
            
            # Filter by availability if requested
            if filters.available_only and not enriched_car["is_available"]:
                continue
            
            enriched_cars.append(CarResponse(**enriched_car))
        
        # Recalculate total if filtering by availability
        if filters.available_only:
            total = len(enriched_cars)
        
        total_pages = (total + pagination.limit - 1) // pagination.limit
        
        return PaginatedResponse(
            data=enriched_cars,
            total=total,
            page=pagination.page,
            limit=pagination.limit,
            total_pages=total_pages
        )
    
    async def get_car_by_id(self, car_id: str) -> CarResponse:
        """
        Get car by ID with availability
        
        Args:
            car_id: Car ID
            
        Returns:
            Car with availability information
            
        Raises:
            HTTPException: If car not found
        """
        car = await self.collection.find_one({"_id": car_id, "is_deleted": False})
        
        if not car:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Car not found"
            )
        
        # Enrich with availability
        car = await self.enrich_car_with_availability(car)
        
        return CarResponse(**car)
    
    async def update_car(self, car_id: str, car_data: CarUpdateRequest) -> CarResponse:
        """
        Update car (Admin only)
        
        Args:
            car_id: Car ID
            car_data: Car update data
            
        Returns:
            Updated car with availability
            
        Raises:
            HTTPException: If car not found
        """
        # Check if car exists
        existing_car = await self.collection.find_one({"_id": car_id, "is_deleted": False})
        if not existing_car:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Car not found"
            )
        
        # Build update document
        update_doc = {"updated_at": datetime.utcnow()}
        
        for field, value in car_data.model_dump(exclude_unset=True).items():
            if value is not None:
                update_doc[field] = value
        
        # Update car
        await self.collection.update_one(
            {"_id": car_id},
            {"$set": update_doc}
        )
        
        # Get updated car
        updated_car = await self.collection.find_one({"_id": car_id})
        
        # Enrich with availability
        updated_car = await self.enrich_car_with_availability(updated_car)
        
        return CarResponse(**updated_car)
    
    async def delete_car(self, car_id: str) -> None:
        """
        Soft delete car (Admin only)
        
        Args:
            car_id: Car ID
            
        Raises:
            HTTPException: If car not found or has active bookings
        """
        # Check if car exists
        car = await self.collection.find_one({"_id": car_id, "is_deleted": False})
        if not car:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Car not found"
            )
        
        # Check for active bookings
        active_bookings = await self.bookings_collection.count_documents({
            "car_id": car_id,
            "status": BookingStatus.BOOKED,
            "is_deleted": False,
            "end_date": {"$gte": datetime.utcnow()}
        })
        
        if active_bookings > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete car with {active_bookings} active booking(s)"
            )
        
        # Soft delete
        await self.collection.update_one(
            {"_id": car_id},
            {
                "$set": {
                    "is_deleted": True,
                    "updated_at": datetime.utcnow()
                }
            }
        )
