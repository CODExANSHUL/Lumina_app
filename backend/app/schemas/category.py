from typing import Optional

from pydantic import BaseModel

from app.models.category import CommonStatus


class CategoryCreate(BaseModel):
    category_name: str
    description: Optional[str] = None


class CategoryUpdate(BaseModel):
    category_name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[CommonStatus] = None


class CategoryResponse(BaseModel):
    category_id: int
    category_name: str
    description: Optional[str]
    status: CommonStatus

    class Config:
        from_attributes = True