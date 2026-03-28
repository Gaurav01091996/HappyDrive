"""Profile routes"""
import re
from fastapi import APIRouter, Depends, File, Form, UploadFile, status, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.dependencies import get_current_active_user, get_database
from app.schemas.common import ApiResponse
from app.schemas.user import ProfileCompletionRequest, UserResponseWithProfile, ProfileCompletionResponse
from app.services.profile import ProfileService


router = APIRouter(prefix="/profile", tags=["Profile"])


@router.post(
    "/complete",
    response_model=ApiResponse[ProfileCompletionResponse],
    status_code=status.HTTP_200_OK,
    summary="Complete user profile",
    description="Complete user profile with driving license and personal details. File upload is required."
)
async def complete_profile(
    phone: str = Form(...),
    address: str = Form(...),
    driving_license_number: str = Form(...),
    age: int = Form(...),
    driving_license_file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_active_user)
):
    """Complete user profile with required details"""
    
    # Validate phone number
    phone_pattern = r'^\+?[1-9]\d{9,14}$'
    if not re.match(phone_pattern, phone):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid phone number format"
        )
    
    # Validate age
    try:
        age_int = int(age)
        if age_int < 18 or age_int > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Age must be between 18 and 100"
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Age must be a valid number"
        )
    
    # Validate address
    if not address or len(address) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Address must be at least 5 characters long"
        )
    
    # Validate driving license number
    if not driving_license_number or len(driving_license_number) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Driving License Number must be at least 5 characters long"
        )
    
    # Create profile request object
    profile_data = ProfileCompletionRequest(
        phone=phone,
        address=address,
        driving_license_number=driving_license_number,
        age=age_int
    )
    
    service = ProfileService(db)
    updated_user = await service.complete_profile(
        current_user["_id"],
        profile_data,
        driving_license_file
    )
    
    response = ProfileCompletionResponse(
        message="Profile completed successfully",
        profile_completed=True,
        user=updated_user
    )
    
    return ApiResponse(
        data=response,
        message="Profile completed successfully"
    )


@router.get(
    "/me",
    response_model=ApiResponse[UserResponseWithProfile],
    summary="Get user profile",
    description="Get current user's profile details"
)
async def get_profile(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_active_user)
):
    """Get current user's profile"""
    service = ProfileService(db)
    user_profile = await service.get_profile(current_user["_id"])
    
    return ApiResponse(
        data=user_profile,
        message="Profile retrieved successfully"
    )
