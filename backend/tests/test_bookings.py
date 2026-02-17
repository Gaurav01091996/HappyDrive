"""Test booking endpoints and business logic"""
import pytest
from datetime import datetime, timedelta
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_booking_success(client: AsyncClient, user_token, sample_car):
    """Test successful booking creation"""
    start_date = datetime.utcnow() + timedelta(days=1)
    end_date = start_date + timedelta(days=3)
    
    response = await client.post(
        "/api/v1/bookings",
        json={
            "car_id": "test-car-id",
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["car_id"] == "test-car-id"
    assert data["data"]["status"] == "booked"
    assert data["data"]["total_price"] == 3000.0  # 3 days * 1000/day


@pytest.mark.asyncio
async def test_create_booking_past_date(client: AsyncClient, user_token, sample_car):
    """Test booking with past date fails"""
    start_date = datetime.utcnow() - timedelta(days=1)
    end_date = start_date + timedelta(days=3)
    
    response = await client.post(
        "/api/v1/bookings",
        json={
            "car_id": "test-car-id",
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_create_booking_invalid_dates(client: AsyncClient, user_token, sample_car):
    """Test booking with end_date before start_date fails"""
    start_date = datetime.utcnow() + timedelta(days=5)
    end_date = datetime.utcnow() + timedelta(days=2)
    
    response = await client.post(
        "/api/v1/bookings",
        json={
            "car_id": "test-car-id",
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_cancel_booking(client: AsyncClient, user_token, sample_car, db_client):
    """Test booking cancellation"""
    # Create a booking first
    booking_doc = {
        "_id": "test-booking-id",
        "user_id": "test-user-id",
        "car_id": "test-car-id",
        "start_date": datetime.utcnow() + timedelta(days=1),
        "end_date": datetime.utcnow() + timedelta(days=4),
        "price_per_day_snapshot": 1000.0,
        "total_price": 3000.0,
        "status": "booked",
        "is_deleted": False
    }
    await db_client.bookings.insert_one(booking_doc)
    
    # Cancel the booking
    response = await client.post(
        "/api/v1/bookings/test-booking-id/cancel",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["status"] == "cancelled"


@pytest.mark.asyncio
async def test_get_my_bookings(client: AsyncClient, user_token, sample_car, db_client):
    """Test getting user's bookings"""
    # Create a booking
    booking_doc = {
        "_id": "test-booking-id",
        "user_id": "test-user-id",
        "car_id": "test-car-id",
        "start_date": datetime.utcnow() + timedelta(days=1),
        "end_date": datetime.utcnow() + timedelta(days=4),
        "price_per_day_snapshot": 1000.0,
        "total_price": 3000.0,
        "status": "booked",
        "is_deleted": False
    }
    await db_client.bookings.insert_one(booking_doc)
    
    response = await client.get(
        "/api/v1/bookings/my-bookings",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) > 0
    assert data["data"][0]["car_id"] == "test-car-id"


@pytest.mark.asyncio
async def test_booking_prevents_overlaps(client: AsyncClient, user_token, sample_car, db_client):
    """Test that overlapping bookings are prevented"""
    start_date = datetime.utcnow() + timedelta(days=1)
    end_date = start_date + timedelta(days=5)
    
    # Create first booking (consuming all 5 cars)
    for i in range(5):
        booking_doc = {
            "_id": f"test-booking-{i}",
            "user_id": f"user-{i}",
            "car_id": "test-car-id",
            "start_date": start_date,
            "end_date": end_date,
            "price_per_day_snapshot": 1000.0,
            "total_price": 4000.0,
            "status": "booked",
            "is_deleted": False
        }
        await db_client.bookings.insert_one(booking_doc)
    
    # Try to create one more booking (should fail)
    response = await client.post(
        "/api/v1/bookings",
        json={
            "car_id": "test-car-id",
            "start_date": (start_date + timedelta(days=2)).isoformat(),
            "end_date": (end_date - timedelta(days=1)).isoformat()
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )
    
    assert response.status_code == 409  # Conflict
