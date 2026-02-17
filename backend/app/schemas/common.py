"""Common response schemas"""
from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel, Field


DataT = TypeVar('DataT')


class ApiResponse(BaseModel, Generic[DataT]):
    """Standard API response wrapper"""
    success: bool = True
    data: Optional[DataT] = None
    message: str = "Operation successful"
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "data": {},
                "message": "Operation successful"
            }
        }


class PaginationParams(BaseModel):
    """Pagination query parameters"""
    page: int = Field(default=1, ge=1, description="Page number")
    limit: int = Field(default=10, ge=1, le=100, description="Items per page")
    
    @property
    def skip(self) -> int:
        """Calculate skip value for database query"""
        return (self.page - 1) * self.limit


class PaginatedResponse(BaseModel, Generic[DataT]):
    """Paginated response wrapper"""
    success: bool = True
    data: list[DataT]
    total: int
    page: int
    limit: int
    total_pages: int
    message: str = "Data retrieved successfully"
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "data": [],
                "total": 100,
                "page": 1,
                "limit": 10,
                "total_pages": 10,
                "message": "Data retrieved successfully"
            }
        }
