"""Car routes"""
from fastapi import APIRouter, Depends, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.dependencies import get_current_admin_user
from app.db.mongodb import get_database
from app.schemas.common import ApiResponse, PaginationParams, PaginatedResponse
from app.schemas.car import (
    CarCreateRequest,
    CarUpdateRequest,
    CarResponse,
    CarFilterParams,
    CarSortParams
)
from app.services.car import CarService

router = APIRouter(prefix="/cars", tags=["Cars"])


@router.post(
    "",
    response_model=ApiResponse[CarResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create car (Admin only)",
    description="Create a new car in the system. Requires admin authentication."
)
async def create_car(
    car_data: CarCreateRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_admin_user)
):
    """Create a new car"""
    service = CarService(db)
    result = await service.create_car(car_data)
    
    return ApiResponse(
        data=result,
        message="Car created successfully"
    )


@router.get(
    "",
    response_model=PaginatedResponse[CarResponse],
    summary="Get all cars",
    description="Get list of cars with pagination, filtering, and sorting. Availability is calculated dynamically."
)
async def get_cars(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    category: str = Query(None),
    min_price: float = Query(None, ge=0),
    max_price: float = Query(None, ge=0),
    transmission: str = Query(None),
    fuel_type: str = Query(None),
    seats: int = Query(None, ge=2, le=10),
    available_only: bool = Query(False),
    start_date: str = Query(None),
    end_date: str = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all cars with filters"""
    from datetime import datetime
    
    pagination = PaginationParams(page=page, limit=limit)
    
    # Parse dates if provided
    parsed_start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00')) if start_date else None
    parsed_end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00')) if end_date else None
    
    filters = CarFilterParams(
        category=category,
        min_price=min_price,
        max_price=max_price,
        transmission=transmission,
        fuel_type=fuel_type,
        seats=seats,
        available_only=available_only,
        start_date=parsed_start_date,
        end_date=parsed_end_date
    )
    
    sort = CarSortParams(sort_by=sort_by, sort_order=sort_order)
    
    service = CarService(db)
    result = await service.get_cars(pagination, filters, sort)
    
    return result


@router.get(
    "/{car_id}",
    response_model=ApiResponse[CarResponse],
    summary="Get car by ID",
    description="Get detailed information about a specific car including real-time availability"
)
async def get_car(
    car_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get car by ID"""
    service = CarService(db)
    result = await service.get_car_by_id(car_id)
    
    return ApiResponse(
        data=result,
        message="Car retrieved successfully"
    )


@router.put(
    "/{car_id}",
    response_model=ApiResponse[CarResponse],
    summary="Update car (Admin only)",
    description="Update car information. Requires admin authentication."
)
async def update_car(
    car_id: str,
    car_data: CarUpdateRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_admin_user)
):
    """Update car"""
    service = CarService(db)
    result = await service.update_car(car_id, car_data)
    
    return ApiResponse(
        data=result,
        message="Car updated successfully"
    )


@router.delete(
    "/{car_id}",
    response_model=ApiResponse[None],
    summary="Delete car (Admin only)",
    description="Soft delete a car. Cannot delete if active bookings exist."
)
async def delete_car(
    car_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_admin_user)
):
    """Delete car"""
    service = CarService(db)
    await service.delete_car(car_id)
    
    return ApiResponse(
        data=None,
        message="Car deleted successfully"
    )
