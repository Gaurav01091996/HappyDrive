"""Booking routes"""
from fastapi import APIRouter, Depends, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.dependencies import get_current_active_user, get_current_admin_user
from app.db.mongodb import get_database
from app.schemas.common import ApiResponse, PaginationParams, PaginatedResponse
from app.schemas.booking import (
    BookingCreateRequest,
    BookingUpdateStatusRequest,
    BookingResponse,
    BookingDetailResponse,
    BookingFilterParams
)
from app.services.booking import BookingService
from app.models.user import UserRole

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post(
    "",
    response_model=ApiResponse[BookingResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create booking",
    description="Create a new booking. Uses MongoDB transactions for concurrency safety."
)
async def create_booking(
    booking_data: BookingCreateRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_active_user)
):
    """Create a new booking"""
    service = BookingService(db)
    result = await service.create_booking(current_user["_id"], booking_data)
    
    return ApiResponse(
        data=result,
        message="Booking created successfully"
    )


@router.get(
    "/my-bookings",
    response_model=PaginatedResponse[BookingDetailResponse],
    summary="Get my bookings",
    description="Get current user's bookings with car details"
)
async def get_my_bookings(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: str = Query(None),
    car_id: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_active_user)
):
    """Get user's bookings"""
    from datetime import datetime
    
    pagination = PaginationParams(page=page, limit=limit)
    
    # Parse dates if provided
    parsed_start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00')) if start_date else None
    parsed_end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00')) if end_date else None
    
    filters = BookingFilterParams(
        status=status,
        car_id=car_id,
        start_date=parsed_start_date,
        end_date=parsed_end_date
    )
    
    service = BookingService(db)
    result = await service.get_my_bookings(current_user["_id"], pagination, filters)
    
    return result


@router.get(
    "",
    response_model=PaginatedResponse[BookingDetailResponse],
    summary="Get all bookings (Admin only)",
    description="Get all bookings with user and car details. Admin access required."
)
async def get_all_bookings(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: str = Query(None),
    car_id: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_admin_user)
):
    """Get all bookings (Admin only)"""
    from datetime import datetime
    
    pagination = PaginationParams(page=page, limit=limit)
    
    # Parse dates if provided
    parsed_start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00')) if start_date else None
    parsed_end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00')) if end_date else None
    
    filters = BookingFilterParams(
        status=status,
        car_id=car_id,
        start_date=parsed_start_date,
        end_date=parsed_end_date
    )
    
    service = BookingService(db)
    result = await service.get_all_bookings(pagination, filters)
    
    return result


@router.patch(
    "/{booking_id}/status",
    response_model=ApiResponse[BookingResponse],
    summary="Update booking status",
    description="Update booking status. Users can only update their own bookings."
)
async def update_booking_status(
    booking_id: str,
    status_data: BookingUpdateStatusRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_active_user)
):
    """Update booking status"""
    service = BookingService(db)
    
    is_admin = current_user["role"] == UserRole.ADMIN
    
    result = await service.update_booking_status(
        booking_id,
        status_data,
        user_id=current_user["_id"],
        is_admin=is_admin
    )
    
    return ApiResponse(
        data=result,
        message="Booking status updated successfully"
    )


@router.post(
    "/{booking_id}/cancel",
    response_model=ApiResponse[BookingResponse],
    summary="Cancel booking",
    description="Cancel a booking. Can only cancel 'booked' status."
)
async def cancel_booking(
    booking_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_active_user)
):
    """Cancel a booking"""
    service = BookingService(db)
    result = await service.cancel_booking(booking_id, current_user["_id"])
    
    return ApiResponse(
        data=result,
        message="Booking cancelled successfully"
    )


@router.delete(
    "/{booking_id}",
    response_model=ApiResponse[None],
    summary="Delete booking (Admin only)",
    description="Soft delete a booking. Admin access required."
)
async def delete_booking(
    booking_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_admin_user)
):
    """Delete booking (Admin only)"""
    service = BookingService(db)
    await service.delete_booking(booking_id)
    
    return ApiResponse(
        data=None,
        message="Booking deleted successfully"
    )
