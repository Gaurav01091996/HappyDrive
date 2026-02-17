# Happy Drives Backend - Enterprise Car Rental API

Production-ready FastAPI backend for car rental booking platform with MongoDB.

## 🏗️ Architecture

```
app/
├── api/
│   └── v1/
│       ├── auth.py          # Authentication endpoints
│       ├── cars.py          # Car CRUD endpoints
│       └── bookings.py      # Booking endpoints
├── core/
│   ├── config.py            # Configuration management
│   ├── security.py          # JWT & password hashing
│   └── dependencies.py      # Dependency injection
├── db/
│   └── mongodb.py           # Database connection & indexes
├── models/
│   ├── user.py              # User model
│   ├── car.py               # Car model
│   └── booking.py           # Booking model
├── schemas/
│   ├── common.py            # Common response schemas
│   ├── user.py              # User request/response schemas
│   ├── car.py               # Car request/response schemas
│   └── booking.py           # Booking request/response schemas
├── services/
│   ├── auth.py              # Authentication business logic
│   ├── car.py               # Car service with availability
│   └── booking.py           # Booking service with transactions
└── main.py                  # FastAPI application
```

## ✨ Key Features

### Dynamic Availability Calculation
```python
available_quantity = total_quantity - active_bookings_for_date_range
```
- Real-time availability calculation
- No stored availability field
- Considers date range overlaps

### Concurrency-Safe Bookings
- Uses MongoDB transactions
- Prevents race conditions
- Atomic operations for booking creation

### Status Lifecycle Management
```
booked → completed ✓
booked → cancelled ✓
completed → * ✗
cancelled → * ✗
```

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone repository
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your settings
nano .env

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f api

# Stop services
docker-compose down
```

API will be available at: http://localhost:8001

### Manual Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Start MongoDB
mongod --dbpath /data/db

# Run application
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

## 📡 API Endpoints

### Base URL
```
http://localhost:8001/api/v1
```

### Authentication
```
POST   /auth/register       # Register new user
POST   /auth/login          # Login user
GET    /auth/me             # Get current user
```

### Cars
```
GET    /cars                # List cars (with filters)
GET    /cars/{id}           # Get car by ID
POST   /cars                # Create car (admin)
PUT    /cars/{id}           # Update car (admin)
DELETE /cars/{id}           # Delete car (admin)
```

**Query Parameters for GET /cars:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `category` - Filter by category (Sedan, SUV, Sports)
- `min_price` - Minimum price
- `max_price` - Maximum price
- `transmission` - Automatic or Manual
- `fuel_type` - Petrol, Diesel, Electric, Hybrid
- `seats` - Number of seats
- `available_only` - Show only available cars
- `start_date` - Check availability for date range
- `end_date` - Check availability for date range
- `sort_by` - Sort field (price_per_day, created_at, name)
- `sort_order` - asc or desc

### Bookings
```
GET    /bookings/my-bookings    # Get my bookings
GET    /bookings                # Get all bookings (admin)
POST   /bookings                # Create booking
PATCH  /bookings/{id}/status    # Update status
POST   /bookings/{id}/cancel    # Cancel booking
DELETE /bookings/{id}            # Delete booking (admin)
```

### Health Check
```
GET    /health              # Health check
```

## 📝 API Examples

### Register User
```bash
curl -X POST http://localhost:8001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "full_name": "John Doe",
    "phone": "+919876543210"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGci...",
    "token_type": "bearer",
    "user": {
      "_id": "507f...",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "user"
    }
  },
  "message": "User registered successfully"
}
```

### Get Cars with Availability
```bash
curl -X GET "http://localhost:8001/api/v1/cars?available_only=true&category=Sedan&start_date=2025-02-01T00:00:00Z&end_date=2025-02-05T00:00:00Z"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "car-id",
      "name": "Mercedes Benz S-Class",
      "category": "Sedan",
      "price_per_day": 5999,
      "total_quantity": 5,
      "available_quantity": 3,
      "is_available": true,
      "status": "available",
      "transmission": "Automatic",
      "fuel_type": "Diesel",
      "seats": 5
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "total_pages": 1
}
```

### Create Booking
```bash
curl -X POST http://localhost:8001/api/v1/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "car_id": "507f...",
    "start_date": "2025-02-01T10:00:00Z",
    "end_date": "2025-02-05T18:00:00Z"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "booking-id",
    "car_id": "car-id",
    "start_date": "2025-02-01T10:00:00Z",
    "end_date": "2025-02-05T18:00:00Z",
    "price_per_day_snapshot": 5999,
    "total_price": 23996,
    "status": "booked"
  },
  "message": "Booking created successfully"
}
```

## 🗄️ MongoDB Collections

### users
```javascript
{
  _id: "uuid",
  email: "user@example.com",
  hashed_password: "bcrypt_hash",
  full_name: "John Doe",
  phone: "+919876543210",
  role: "user",  // "user" or "admin"
  is_active: true,
  is_deleted: false,
  created_at: ISODate(),
  updated_at: ISODate()
}
```

### cars
```javascript
{
  _id: "uuid",
  name: "Mercedes Benz S-Class",
  brand: "Mercedes Benz",
  category: "Sedan",
  price_per_day: 5999.0,
  total_quantity: 5,  // Total cars available
  image_url: "https://...",
  transmission: "Automatic",
  fuel_type: "Diesel",
  seats: 5,
  description: "Luxury sedan",
  features: ["Leather Seats", "Sunroof"],
  is_deleted: false,
  created_at: ISODate(),
  updated_at: ISODate()
}
```

### bookings
```javascript
{
  _id: "uuid",
  user_id: "uuid",
  car_id: "uuid",
  start_date: ISODate(),
  end_date: ISODate(),
  price_per_day_snapshot: 5999.0,  // Price locked at booking time
  total_price: 23996.0,
  status: "booked",  // "booked", "cancelled", "completed"
  is_deleted: false,
  created_at: ISODate(),
  updated_at: ISODate()
}
```

## 🔒 Authentication

### JWT Token
All protected endpoints require JWT bearer token:

```
Authorization: Bearer <your_token>
```

### Admin Access
Admin-only endpoints:
- POST /api/v1/cars
- PUT /api/v1/cars/{id}
- DELETE /api/v1/cars/{id}
- GET /api/v1/bookings (all bookings)
- DELETE /api/v1/bookings/{id}

### Default Admin User
Created on startup:
- Email: `admin@happydrives.com`
- Password: `Admin@123456`

**Change in production!**

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_bookings.py -v

# Run specific test
pytest tests/test_bookings.py::test_create_booking_success -v
```

## 📊 Database Indexes

Automatically created on startup:

**users:**
- email (unique)
- role
- (is_deleted, is_active)

**cars:**
- category
- price_per_day
- is_deleted
- (category, price_per_day)

**bookings:**
- user_id
- car_id
- (start_date, end_date)
- (car_id, start_date, end_date)
- (status, is_deleted)
- created_at
- (car_id, status, start_date, end_date, is_deleted)

## ⚡ Performance

- Async/await throughout
- Connection pooling (MongoDB Motor)
- Proper indexing for fast queries
- Pagination with limits
- Query optimization

## 🔐 Security

- bcrypt password hashing
- JWT token authentication
- Role-based access control
- Rate limiting on auth endpoints
- CORS configuration
- Input validation with Pydantic
- SQL injection protection (NoSQL)

## 🐳 Docker Deployment

```yaml
# docker-compose.yml included
services:
  - mongodb (port 27017)
  - api (port 8001)

# Production ready with:
- Health checks
- Auto-restart
- Volume persistence
- Network isolation
```

## 🌍 Environment Variables

```env
# Application
APP_NAME=Happy Drives API
DEBUG=False
ENVIRONMENT=production

# Database
MONGO_URL=mongodb://mongodb:27017
MONGO_DB_NAME=happy_drives

# Security
JWT_SECRET_KEY=your-256-bit-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=["https://yourdomain.com"]

# Admin
ADMIN_EMAIL=admin@happydrives.com
ADMIN_PASSWORD=ChangeInProduction123!
```

## 📚 API Documentation

Interactive API docs available at:
- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

## 🚨 Error Handling

Standard error response:
```json
{
  "success": false,
  "message": "Error description",
  "detail": "Detailed error message"
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict (e.g., car unavailable)
- 422: Validation Error
- 500: Internal Server Error

## 📈 Monitoring

- Request logging middleware
- Health check endpoint
- Structured error responses
- Database connection monitoring

## 🔄 Booking Business Rules

1. **Prevent overlaps**: Checks date conflicts using transactions
2. **Concurrency safe**: Uses MongoDB atomic operations
3. **Date validation**: Cannot book in past, end > start
4. **Price locking**: Stores snapshot at booking time
5. **Status lifecycle**: Enforces valid transitions
6. **Availability**: Dynamic calculation from active bookings

## 👥 Contributing

1. Fork repository
2. Create feature branch
3. Write tests
4. Submit pull request

## 📄 License

MIT License - see LICENSE file

## 🆘 Support

- API Docs: http://localhost:8001/docs
- Health: http://localhost:8001/health
- GitHub Issues: [Create issue]

---

**Built with FastAPI, MongoDB, and ❤️**
