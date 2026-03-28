"""Authentication service for user registration and login"""
import uuid
from datetime import datetime
from typing import Optional
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import UserRole
from app.schemas.user import UserRegisterRequest, UserLoginRequest, UserResponse, TokenResponse


class AuthService:
    """Service for authentication operations"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.users
    
    async def register_user(self, user_data: UserRegisterRequest) -> TokenResponse:
        """
        Register a new user
        
        Args:
            user_data: User registration data
            
        Returns:
            TokenResponse with access token and user data
            
        Raises:
            HTTPException: If email already exists
        """
        # Check if email already exists
        existing_user = await self.collection.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user document
        user_id = str(uuid.uuid4())
        hashed_password = get_password_hash(user_data.password)
        
        user_doc = {
            "_id": user_id,
            "email": user_data.email,
            "hashed_password": hashed_password,
            "full_name": user_data.full_name,
            "phone": user_data.phone,
            "profile_completed": False,
            "role": UserRole.USER,
            "is_active": True,
            "is_deleted": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert user
        await self.collection.insert_one(user_doc)
        
        # Create access token
        access_token = create_access_token(data={"sub": user_id, "role": UserRole.USER})
        
        # Prepare response
        user_response = UserResponse(
            _id=user_id,
            email=user_data.email,
            full_name=user_data.full_name,
            phone=user_data.phone,
            profile_completed=False,
            role=UserRole.USER,
            is_active=True,
            created_at=user_doc["created_at"]
        )
        
        return TokenResponse(
            access_token=access_token,
            user=user_response
        )
    
    async def login_user(self, login_data: UserLoginRequest) -> TokenResponse:
        """
        Authenticate user and generate token
        
        Args:
            login_data: User login credentials
            
        Returns:
            TokenResponse with access token and user data
            
        Raises:
            HTTPException: If credentials are invalid
        """
        # Find user by email
        user = await self.collection.find_one({
            "email": login_data.email,
            "is_deleted": False
        })
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(login_data.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if user is active
        if not user.get("is_active", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user["_id"], "role": user["role"]}
        )
        
        # Prepare response
        user_response = UserResponse(
            _id=user["_id"],
            email=user["email"],
            full_name=user["full_name"],
            phone=user.get("phone"),
            profile_completed=user.get("profile_completed", False),
            role=user["role"],
            is_active=user["is_active"],
            created_at=user["created_at"]
        )
        
        return TokenResponse(
            access_token=access_token,
            user=user_response
        )
    
    async def create_admin_user(self, email: str, password: str, full_name: str = "Admin User") -> None:
        """
        Create admin user if not exists (called on startup)
        
        Args:
            email: Admin email
            password: Admin password
            full_name: Admin full name
        """
        # Check if admin already exists
        existing_admin = await self.collection.find_one({"email": email})
        if existing_admin:
            return
        
        # Create admin user
        user_id = str(uuid.uuid4())
        hashed_password = get_password_hash(password)
        
        admin_doc = {
            "_id": user_id,
            "email": email,
            "hashed_password": hashed_password,
            "full_name": full_name,
            "phone": None,
            "role": UserRole.ADMIN,
            "is_active": True,
            "is_deleted": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        await self.collection.insert_one(admin_doc)
        print(f"Admin user created: {email}")
