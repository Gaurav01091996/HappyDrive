"""Dependency injection for authentication and database"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.security import decode_access_token
from app.db.mongodb import get_database
from app.models.user import UserRole


# HTTP Bearer token authentication
security = HTTPBearer()


async def get_current_user(
    token: str = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> dict:
    """
    Get current authenticated user from JWT token
    
    Args:
        token: JWT bearer token
        db: Database connection
        
    Returns:
        User document from database
        
    Raises:
        HTTPException: If user not found or token invalid
    """
    try:
        # Decode token
        payload = decode_access_token(token.credentials)
        user_id: str = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        
        # Get user from database
        user = await db.users.find_one({"_id": user_id, "is_deleted": False})
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return user
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )


async def get_current_active_user(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Ensure current user is active
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Active user document
        
    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.get("is_active", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user


async def get_current_admin_user(
    current_user: dict = Depends(get_current_active_user)
) -> dict:
    """
    Ensure current user has admin role
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Admin user document
        
    Raises:
        HTTPException: If user is not admin
    """
    if current_user.get("role") != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Admin access required."
        )
    return current_user
