"""Authentication routes"""
from fastapi import APIRouter, Depends, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.dependencies import get_current_active_user
from app.db.mongodb import get_database
from app.schemas.common import ApiResponse
from app.schemas.user import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserResponse
)
from app.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])
limiter = Limiter(key_func=get_remote_address)


@router.post(
    "/register",
    response_model=ApiResponse[TokenResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register new user",
    description="Create a new user account. Password must be at least 8 characters with uppercase, lowercase, digit, and special character."
)
async def register(
    user_data: UserRegisterRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Register a new user"""
    service = AuthService(db)
    result = await service.register_user(user_data)
    
    return ApiResponse(
        data=result,
        message="User registered successfully"
    )


@router.post(
    "/login",
    response_model=ApiResponse[TokenResponse],
    summary="Login user",
    description="Authenticate user and receive JWT access token"
)
async def login(
    login_data: UserLoginRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Login user"""
    service = AuthService(db)
    result = await service.login_user(login_data)
    
    return ApiResponse(
        data=result,
        message="Login successful"
    )


@router.get(
    "/me",
    response_model=ApiResponse[UserResponse],
    summary="Get current user",
    description="Get current authenticated user information"
)
async def get_current_user_info(
    current_user: dict = Depends(get_current_active_user)
):
    """Get current user information"""
    user_response = UserResponse(
        _id=current_user["_id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        phone=current_user.get("phone"),
        role=current_user["role"],
        is_active=current_user["is_active"],
        created_at=current_user["created_at"]
    )
    
    return ApiResponse(
        data=user_response,
        message="User data retrieved successfully"
    )
