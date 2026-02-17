"""MongoDB database connection and utilities"""
import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ServerSelectionTimeoutError

from app.core.config import settings

logger = logging.getLogger(__name__)


class MongoDB:
    """MongoDB connection manager"""
    
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None


mongodb = MongoDB()


async def connect_to_mongodb():
    """
    Create MongoDB connection pool
    
    Called on application startup
    """
    try:
        logger.info(f"Connecting to MongoDB at {settings.MONGO_URL}")
        
        mongodb.client = AsyncIOMotorClient(
            settings.MONGO_URL,
            maxPoolSize=settings.MONGO_MAX_CONNECTIONS,
            minPoolSize=settings.MONGO_MIN_CONNECTIONS,
            serverSelectionTimeoutMS=5000
        )
        
        mongodb.db = mongodb.client[settings.MONGO_DB_NAME]
        
        # Verify connection
        await mongodb.client.admin.command('ping')
        
        logger.info("Successfully connected to MongoDB")
        
        # Create indexes
        await create_indexes()
        
    except ServerSelectionTimeoutError:
        logger.error("Failed to connect to MongoDB - Server selection timeout")
        raise
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise


async def close_mongodb_connection():
    """
    Close MongoDB connection pool
    
    Called on application shutdown
    """
    if mongodb.client:
        logger.info("Closing MongoDB connection")
        mongodb.client.close()
        logger.info("MongoDB connection closed")


async def get_database() -> AsyncIOMotorDatabase:
    """
    Get database instance for dependency injection
    
    Returns:
        AsyncIOMotorDatabase instance
    """
    return mongodb.db


async def create_indexes():
    """
    Create database indexes for performance optimization
    
    Called on application startup
    """
    try:
        db = mongodb.db
        
        logger.info("Creating database indexes...")
        
        # Users collection indexes
        await db.users.create_index("email", unique=True)
        await db.users.create_index("role")
        await db.users.create_index([("is_deleted", 1), ("is_active", 1)])
        
        # Cars collection indexes
        await db.cars.create_index("category")
        await db.cars.create_index("price_per_day")
        await db.cars.create_index([("is_deleted", 1)])
        await db.cars.create_index([("category", 1), ("price_per_day", 1)])
        
        # Bookings collection indexes
        await db.bookings.create_index("user_id")
        await db.bookings.create_index("car_id")
        await db.bookings.create_index([("start_date", 1), ("end_date", 1)])
        await db.bookings.create_index([("car_id", 1), ("start_date", 1), ("end_date", 1)])
        await db.bookings.create_index([("status", 1), ("is_deleted", 1)])
        await db.bookings.create_index("created_at")
        
        # Compound index for availability checks
        await db.bookings.create_index([
            ("car_id", 1),
            ("status", 1),
            ("start_date", 1),
            ("end_date", 1),
            ("is_deleted", 1)
        ])
        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
        raise
