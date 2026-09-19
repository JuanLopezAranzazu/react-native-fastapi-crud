from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=30)
    is_active: bool = True


class UserCreate(UserBase):
    """Datos para crear un usuario (POST)."""


class UserUpdate(BaseModel):
    """Datos para actualizar (PUT). Todos son opcionales."""

    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=30)
    is_active: Optional[bool] = None


class UserOut(UserBase):
    """Lo que devolvemos al cliente."""

    # from_attributes permite convertir un objeto SQLAlchemy a este schema
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
