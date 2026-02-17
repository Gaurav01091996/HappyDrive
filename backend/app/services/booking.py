"""Booking service with concurrency-safe operations and transaction support"""
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorClientSession
from pymongo.errors import OperationFailure

from app.schemas.booking import (
    BookingCreateRequest,
    BookingUpdateStatusRequest,
    BookingResponse,
    BookingDetailResponse,
    BookingFilterParams
)
from app.schemas.common import PaginationParams, PaginatedResponse
from app.models.booking import BookingStatus


class BookingService:
    """Service for booking operations with concurrency safety"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.bookings
        self.cars_collection = db.cars
        self.users_collection = db.users
    
    async def check_date_conflicts(
        self,
        car_id: str,
        start_date: datetime,
        end_date: datetime,
        exclude_booking_id: Optional[str] = None,
        session: Optional[AsyncIOMotorClientSession] = None
    ) -> bool:
        """
        Check if there are date conflicts for a car
        
        Args:
            car_id: Car ID
            start_date: Requested start date
            end_date: Requested end date
            exclude_booking_id: Optional booking ID to exclude from check (for updates)
            session: Optional MongoDB session for transactions
            
        Returns:
            True if conflicts exist, False otherwise
        """
        query = {
            "car_id": car_id,
            "status": BookingStatus.BOOKED,
            "is_deleted": False,
            "$or": [
                {
                    # Existing booking starts before requested end and ends after requested start
                    "start_date": {"$lt": end_date},
                    "end_date": {"$gt": start_date}
                }
            ]
        }
        
        if exclude_booking_id:
            query["_id"] = {"$ne": exclude_booking_id}
        
        conflicting_booking = await self.collection.find_one(query, session=session)
        
        return conflicting_booking is not None
    
    async def check_availability(
        self,
        car_id: str,
        start_date: datetime,
        end_date: datetime,
        session: Optional[AsyncIOMotorClientSession] = None
    ) -> tuple[bool, int]:
        """
        Check if car is available for the requested date range
        
        Args:
            car_id: Car ID
            start_date: Requested start date
            end_date: Requested end date
            session: Optional MongoDB session for transactions
            
        Returns:
            Tuple of (is_available, available_quantity)
        """
        # Get car
        car = await self.cars_collection.find_one(
            {"_id": car_id, "is_deleted": False},
            session=session
        )
        
        if not car:
            return False, 0
        
        total_quantity = car["total_quantity"]
        
        # Count overlapping bookings
        overlapping_bookings = await self.collection.count_documents(
            {
                "car_id": car_id,
                "status": BookingStatus.BOOKED,
                "is_deleted": False,
                "start_date": {"$lt": end_date},
                "end_date": {"$gt": start_date}
            },
            session=session
        )
        
        available_quantity = max(0, total_quantity - overlapping_bookings)
        
        return available_quantity > 0, available_quantity
    
    async def calculate_total_price(
        self,
        price_per_day: float,
        start_date: datetime,
        end_date: datetime
    ) -> float:
        """
        Calculate total booking price
        
        Args:
            price_per_day: Price per day
            start_date: Booking start date
            end_date: Booking end date
            
        Returns:
            Total price
        """
        duration = (end_date - start_date).days
        if duration < 1:
            duration = 1  # Minimum 1 day
        
        return price_per_day * duration
    
    async def create_booking(
        self,
        user_id: str,
        booking_data: BookingCreateRequest
    ) -> BookingResponse:
        """
        Create a new booking with concurrency safety using MongoDB transactions
        
        Args:
            user_id: ID of the user creating booking
            booking_data: Booking creation data
            
        Returns:
            Created booking
            
        Raises:
            HTTPException: If car not found, not available, or date conflicts exist
        """
        # Start a session for transaction
        async with await self.db.client.start_session() as session:
            async with session.start_transaction():
                try:
                    # Validate dates
                    if booking_data.start_date >= booking_data.end_date:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="end_date must be after start_date"
                        )
                    
                    if booking_data.start_date < datetime.utcnow():
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Cannot book in the past"
                        )
                    
                    # Get car with session lock
                    car = await self.cars_collection.find_one(
                        {"_id": booking_data.car_id, "is_deleted": False},
                        session=session
                    )
                    
                    if not car:
                        raise HTTPException(
                            status_code=status.HTTP_404_NOT_FOUND,
                            detail="Car not found"
                        )
                    
                    # Check availability within transaction
                    is_available, available_quantity = await self.check_availability(
                        booking_data.car_id,
                        booking_data.start_date,
                        booking_data.end_date,
                        session=session
                    )
                    
                    if not is_available:
                        raise HTTPException(
                            status_code=status.HTTP_409_CONFLICT,
                            detail=f"Car not available for selected dates. Available quantity: {available_quantity}"
                        )
                    
                    # Calculate price
                    price_per_day = car["price_per_day"]
                    total_price = await self.calculate_total_price(
                        price_per_day,
                        booking_data.start_date,
                        booking_data.end_date
                    )
                    
                    # Create booking document
                    booking_id = str(uuid.uuid4())
                    booking_doc = {
                        "_id": booking_id,
                        "user_id": user_id,
                        "car_id": booking_data.car_id,
                        "start_date": booking_data.start_date,
                        "end_date": booking_data.end_date,
                        "price_per_day_snapshot": price_per_day,
                        "total_price": total_price,
                        "status": BookingStatus.BOOKED,
                        "is_deleted": False,
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow()
                    }
                    
                    # Insert booking within transaction
                    await self.collection.insert_one(booking_doc, session=session)
                    
                    # Transaction will auto-commit if no exception
                    return BookingResponse(**booking_doc)
                
                except HTTPException:
                    # Re-raise HTTP exceptions
                    raise
                except Exception as e:
                    # Rollback on any other error
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Failed to create booking: {str(e)}"
                    )
    
    async def get_my_bookings(
        self,
        user_id: str,
        pagination: PaginationParams,
        filters: BookingFilterParams
    ) -> PaginatedResponse[BookingDetailResponse]:
        """
        Get user's bookings with pagination and filtering
        
        Args:
            user_id: User ID
            pagination: Pagination parameters
            filters: Filter parameters
            
        Returns:
            Paginated list of user's bookings with details
        """
        # Build query
        query = {"user_id": user_id, "is_deleted": False}
        
        if filters.status:
            query["status"] = filters.status
        
        if filters.car_id:
            query["car_id"] = filters.car_id
        
        if filters.start_date:
            query["start_date"] = {"$gte": filters.start_date}
        
        if filters.end_date:
            query["end_date"] = {"$lte": filters.end_date}
        
        # Get total count
        total = await self.collection.count_documents(query)
        
        # Get bookings
        cursor = self.collection.find(query).sort(
            "created_at", -1
        ).skip(pagination.skip).limit(pagination.limit)
        
        bookings = await cursor.to_list(length=pagination.limit)
        
        # Enrich with car details
        enriched_bookings = []
        for booking in bookings:
            # Get car details
            car = await self.cars_collection.find_one({"_id": booking["car_id"]})
            
            booking_detail = BookingDetailResponse(
                **booking,
                car_name=car.get("name") if car else None,
                car_brand=car.get("brand") if car else None,
                car_image_url=car.get("image_url") if car else None
            )
            enriched_bookings.append(booking_detail)
        
        total_pages = (total + pagination.limit - 1) // pagination.limit
        
        return PaginatedResponse(
            data=enriched_bookings,
            total=total,
            page=pagination.page,
            limit=pagination.limit,
            total_pages=total_pages
        )
    
    async def get_all_bookings(
        self,
        pagination: PaginationParams,
        filters: BookingFilterParams
    ) -> PaginatedResponse[BookingDetailResponse]:
        """
        Get all bookings (Admin only)
        
        Args:
            pagination: Pagination parameters
            filters: Filter parameters
            
        Returns:
            Paginated list of all bookings with details
        """
        # Build query
        query = {"is_deleted": False}
        
        if filters.status:
            query["status"] = filters.status
        
        if filters.car_id:
            query["car_id"] = filters.car_id
        
        if filters.start_date:
            query["start_date"] = {"$gte": filters.start_date}
        
        if filters.end_date:
            query["end_date"] = {"$lte": filters.end_date}
        
        # Get total count
        total = await self.collection.count_documents(query)
        
        # Get bookings
        cursor = self.collection.find(query).sort(
            "created_at", -1
        ).skip(pagination.skip).limit(pagination.limit)
        
        bookings = await cursor.to_list(length=pagination.limit)
        
        # Enrich with car and user details
        enriched_bookings = []
        for booking in bookings:
            # Get car details
            car = await self.cars_collection.find_one({"_id": booking["car_id"]})
            
            # Get user details
            user = await self.users_collection.find_one({"_id": booking["user_id"]})
            
            booking_detail = BookingDetailResponse(
                **booking,
                car_name=car.get("name") if car else None,
                car_brand=car.get("brand") if car else None,
                car_image_url=car.get("image_url") if car else None,
                user_name=user.get("full_name") if user else None,
                user_email=user.get("email") if user else None
            )
            enriched_bookings.append(booking_detail)
        
        total_pages = (total + pagination.limit - 1) // pagination.limit
        
        return PaginatedResponse(
            data=enriched_bookings,
            total=total,
            page=pagination.page,
            limit=pagination.limit,
            total_pages=total_pages
        )
    
    async def update_booking_status(
        self,
        booking_id: str,
        status_data: BookingUpdateStatusRequest,
        user_id: Optional[str] = None,
        is_admin: bool = False
    ) -> BookingResponse:
        """
        Update booking status with lifecycle validation
        
        Args:
            booking_id: Booking ID
            status_data: Status update data
            user_id: User ID (for authorization)
            is_admin: Whether requester is admin
            
        Returns:
            Updated booking
            
        Raises:
            HTTPException: If booking not found or status transition invalid
        """
        # Get booking
        booking = await self.collection.find_one({"_id": booking_id, "is_deleted": False})
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        # Authorization check (user can only update their own bookings unless admin)
        if not is_admin and booking["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this booking"
            )
        
        current_status = booking["status"]
        new_status = status_data.status
        
        # Validate status transitions
        valid_transitions = {
            BookingStatus.BOOKED: [BookingStatus.CANCELLED, BookingStatus.COMPLETED],
            BookingStatus.CANCELLED: [],  # Cannot change from cancelled
            BookingStatus.COMPLETED: []  # Cannot change from completed
        }
        
        if new_status not in valid_transitions.get(current_status, []):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot transition from '{current_status}' to '{new_status}'"
            )
        
        # Update booking
        await self.collection.update_one(
            {"_id": booking_id},
            {
                "$set": {
                    "status": new_status,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Get updated booking
        updated_booking = await self.collection.find_one({"_id": booking_id})
        
        return BookingResponse(**updated_booking)
    
    async def cancel_booking(
        self,
        booking_id: str,
        user_id: str
    ) -> BookingResponse:
        """
        Cancel a booking
        
        Args:
            booking_id: Booking ID
            user_id: User ID
            
        Returns:
            Cancelled booking
            
        Raises:
            HTTPException: If booking cannot be cancelled
        """
        return await self.update_booking_status(
            booking_id,
            BookingUpdateStatusRequest(status=BookingStatus.CANCELLED),
            user_id=user_id
        )
    
    async def delete_booking(self, booking_id: str) -> None:
        """
        Soft delete booking (Admin only)
        
        Args:
            booking_id: Booking ID
            
        Raises:
            HTTPException: If booking not found
        """
        booking = await self.collection.find_one({"_id": booking_id, "is_deleted": False})
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        await self.collection.update_one(
            {"_id": booking_id},
            {
                "$set": {
                    "is_deleted": True,
                    "updated_at": datetime.utcnow()
                }
            }
        )
