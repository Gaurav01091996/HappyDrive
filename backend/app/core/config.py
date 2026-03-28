"""Application configuration using Pydantic Settings"""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator
import json


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    APP_NAME: str = "Happy Drives API"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8001
    
    # Database
    MONGO_URL: str
    MONGO_DB_NAME: str = "happy_drives"
    MONGO_MAX_CONNECTIONS: int = 100
    MONGO_MIN_CONNECTIONS: int = 10
    
    # Security
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: List[str] = ['http://localhost:3000', 'http://localhost:5173']
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            # Handle comma-separated values
            if ',' in v:
                return [origin.strip() for origin in v.split(",")]
            # Handle single value
            return [v.strip()] if v.strip() else []
        return v
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    AUTH_RATE_LIMIT_PER_MINUTE: int = 5
    
    # Admin User
    ADMIN_EMAIL: str = "admin@happydrives.com"
    ADMIN_PASSWORD: str = "Admin@123456"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


# Global settings instance
settings = Settings()
