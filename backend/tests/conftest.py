"""Pytest configuration and fixtures"""
import pytest
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from httpx import AsyncClient

from app.main import app
from app.core.config import settings
from app.core.security import create_access_token


# Test database name
TEST_DB_NAME = "happy_drives_test"


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def db_client():
    """Create test database client"""
    client = AsyncIOMotorClient(settings.MONGO_URL)
    db = client[TEST_DB_NAME]
    
    yield db
    
    # Cleanup: Drop test database after each test
    await client.drop_database(TEST_DB_NAME)
    client.close()


@pytest.fixture(scope="function")
async def client():
    """Create test HTTP client"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def admin_token():
    """Generate admin JWT token"""
    return create_access_token(
        data={"sub": "test-admin-id", "role": "admin"}
    )


@pytest.fixture
def user_token():
    """Generate user JWT token"""
    return create_access_token(
        data={"sub": "test-user-id", "role": "user"}
    )


@pytest.fixture
async def sample_car(db_client):
    """Create a sample car for testing"""
    car_doc = {
        "_id": "test-car-id",
        "name": "Test Car",
        "brand": "Test Brand",
        "category": "Sedan",
        "price_per_day": 1000.0,
        "total_quantity": 5,
        "image_url": "https://example.com/car.jpg",
        "transmission": "Automatic",
        "fuel_type": "Petrol",
        "seats": 5,
        "description": "Test car",
        "features": ["GPS", "AC"],
        "is_deleted": False
    }
    
    await db_client.cars.insert_one(car_doc)
    return car_doc


@pytest.fixture
async def sample_user(db_client):
    """Create a sample user for testing"""
    from app.core.security import get_password_hash
    
    user_doc = {
        "_id": "test-user-id",
        "email": "test@example.com",
        "hashed_password": get_password_hash("TestPass123!"),
        "full_name": "Test User",
        "phone": "+1234567890",
        "role": "user",
        "is_active": True,
        "is_deleted": False
    }
    
    await db_client.users.insert_one(user_doc)
    return user_doc
