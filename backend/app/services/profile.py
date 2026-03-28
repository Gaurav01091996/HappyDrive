"""Profile completion service"""
import os
from datetime import datetime
from typing import Optional
from fastapi import HTTPException, status, UploadFile
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.user import ProfileCompletionRequest, UserResponseWithProfile
import uuid


class ProfileService:
    """Service for profile operations"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.users
        
    async def complete_profile(
        self,
        user_id: str,
        profile_data: ProfileCompletionRequest,
        driving_license_file: Optional[UploadFile] = None
    ) -> UserResponseWithProfile:
        """
        Complete user profile with required details
        
        Args:
            user_id: User ID
            profile_data: Profile completion data
            driving_license_file: Uploaded driving license file
            
        Returns:
            Updated user profile
            
        Raises:
            HTTPException: If user not found or validation fails
        """
        # Find user
        user = await self.collection.find_one({"_id": user_id})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Process file upload if provided
        driving_license_url = None
        if driving_license_file:
            driving_license_url = await self._save_driving_license(
                user_id,
                driving_license_file
            )
        
        # Update user document
        update_data = {
            "phone": profile_data.phone,
            "address": profile_data.address,
            "driving_license_number": profile_data.driving_license_number,
            "age": profile_data.age,
            "profile_completed": True,
            "updated_at": datetime.utcnow()
        }
        
        if driving_license_url:
            update_data["driving_license_upload_url"] = driving_license_url
        
        # Update in database
        await self.collection.update_one(
            {"_id": user_id},
            {"$set": update_data}
        )
        
        # Fetch updated user
        updated_user = await self.collection.find_one({"_id": user_id})
        
        # Return response
        return UserResponseWithProfile(
            _id=updated_user["_id"],
            email=updated_user["email"],
            full_name=updated_user["full_name"],
            phone=updated_user["phone"],
            address=updated_user.get("address"),
            age=updated_user.get("age"),
            driving_license_number=updated_user.get("driving_license_number"),
            driving_license_upload_url=updated_user.get("driving_license_upload_url"),
            profile_completed=updated_user.get("profile_completed", False),
            role=updated_user["role"],
            is_active=updated_user["is_active"],
            created_at=updated_user["created_at"]
        )
    
    async def _save_driving_license(
        self,
        user_id: str,
        file: UploadFile
    ) -> str:
        """
        Save driving license file with validation
        
        Args:
            user_id: User ID
            file: Uploaded file
            
        Returns:
            Path to saved file
            
        Raises:
            HTTPException: If file validation fails
        """
        # Validate file extension
        allowed_extensions = {"jpg", "jpeg", "png"}
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must have a name"
            )
        
        file_extension = file.filename.split(".")[-1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only JPG, JPEG, and PNG files are allowed."
            )
        
        # Read file content to check size - READ ONLY ONCE
        try:
            file_content = await file.read()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to read file: {str(e)}"
            )
        
        file_size = len(file_content)
        
        # Validate file size (200 KB to 500 KB)
        min_size = 200 * 1024  # 200 KB
        max_size = 500 * 1024  # 500 KB
        
        if file_size < min_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size is too small. Minimum size is 200 KB. Current size: {file_size // 1024} KB."
            )
        
        if file_size > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size is too large. Maximum size is 500 KB. Current size: {file_size // 1024} KB."
            )
        
        # Create uploads directory if it doesn't exist
        upload_dir = "backend/uploads/licenses"
        try:
            os.makedirs(upload_dir, exist_ok=True)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create upload directory: {str(e)}"
            )
        
        # Generate filename
        timestamp = datetime.utcnow().timestamp()
        filename = f"{user_id}_{timestamp}.{file_extension}"
        filepath = os.path.join(upload_dir, filename)
        
        # Save file
        try:
            with open(filepath, "wb") as f:
                f.write(file_content)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save file: {str(e)}"
            )
        
        # Return relative path for database storage
        return f"/uploads/licenses/{filename}"
    
    async def get_profile(self, user_id: str) -> UserResponseWithProfile:
        """
        Get user profile
        
        Args:
            user_id: User ID
            
        Returns:
            User profile details
            
        Raises:
            HTTPException: If user not found
        """
        user = await self.collection.find_one({"_id": user_id})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponseWithProfile(
            _id=user["_id"],
            email=user["email"],
            full_name=user["full_name"],
            phone=user.get("phone"),
            address=user.get("address"),
            age=user.get("age"),
            driving_license_number=user.get("driving_license_number"),
            driving_license_upload_url=user.get("driving_license_upload_url"),
            profile_completed=user.get("profile_completed", False),
            role=user["role"],
            is_active=user["is_active"],
            created_at=user["created_at"]
        )
