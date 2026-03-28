"""Main FastAPI application"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.db.mongodb import connect_to_mongodb, close_mongodb_connection, get_database
from app.api.v1 import auth, cars, bookings, profile
from app.services.auth import AuthService

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Rate limiter
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.VERSION}")
    
    # Connect to MongoDB
    await connect_to_mongodb()
    
    # Create admin user
    db = await get_database()
    auth_service = AuthService(db)
    await auth_service.create_admin_user(
        email=settings.ADMIN_EMAIL,
        password=settings.ADMIN_PASSWORD,
        full_name="Admin User"
    )
    
    logger.info("Application startup complete")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application")
    await close_mongodb_connection()
    logger.info("Application shutdown complete")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Enterprise-grade Car Rental Booking Platform API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests"""
    logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Status: {response.status_code}")
    return response


# Global exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": " -> ".join(str(x) for x in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Validation error",
            "errors": errors
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all uncaught exceptions"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An unexpected error occurred"
        }
    )


# Health check endpoint
@app.get(
    "/health",
    tags=["Health"],
    summary="Health check",
    description="Check if API is running and database is connected"
)
async def health_check():
    """Health check endpoint"""
    try:
        # Check database connection
        db = await get_database()
        await db.command('ping')
        
        return {
            "success": True,
            "status": "healthy",
            "service": settings.APP_NAME,
            "version": settings.VERSION,
            "environment": settings.ENVIRONMENT
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "success": False,
                "status": "unhealthy",
                "error": str(e)
            }
        )


# Root endpoint
@app.get(
    "/",
    tags=["Root"],
    summary="API root",
    description="Get API information"
)
async def root():
    """Root endpoint"""
    return {
        "success": True,
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health"
    }


# Include routers with /api/v1 prefix
app.include_router(auth.router, prefix="/api/v1")
app.include_router(cars.router, prefix="/api/v1")
app.include_router(bookings.router, prefix="/api/v1")
app.include_router(profile.router, prefix="/api/v1")


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
