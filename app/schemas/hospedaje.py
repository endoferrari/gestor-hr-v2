"""
Schemas de Pydantic para el modelo Hospedaje
"""

from datetime import date
from decimal import Decimal

from pydantic import BaseModel, Field


class HospedajeBase(BaseModel):
    """Schema base para Hospedaje con campos comunes"""

    nombre_huesped: str = Field(..., min_length=1, max_length=100)
    email_huesped: str | None = None
    telefono_huesped: str | None = None
    documento_identidad: str | None = None
    numero_habitacion: str = Field(..., min_length=1, max_length=10)
    tipo_habitacion: str = Field(..., min_length=1, max_length=50)
    fecha_check_in: date
    fecha_check_out: date
    precio_por_noche: Decimal = Field(..., gt=0, max_digits=10, decimal_places=2)
    numero_noches: int = Field(..., gt=0)
    total_hospedaje: Decimal = Field(..., gt=0, max_digits=10, decimal_places=2)
    estado: str = Field(default="pendiente", max_length=20)
    observaciones: str | None = None


class HospedajeCreate(HospedajeBase):
    """Schema para crear un nuevo hospedaje"""


class HospedajeUpdate(BaseModel):
    """Schema para actualizar un hospedaje existente"""

    nombre_huesped: str | None = None
    email_huesped: str | None = None
    telefono_huesped: str | None = None
    documento_identidad: str | None = None
    numero_habitacion: str | None = None
    tipo_habitacion: str | None = None
    fecha_check_in: date | None = None
    fecha_check_out: date | None = None
    precio_por_noche: Decimal | None = None
    numero_noches: int | None = None
    total_hospedaje: Decimal | None = None
    estado: str | None = None
    observaciones: str | None = None


class HospedajeInDBBase(HospedajeBase):
    """Schema base para hospedaje en base de datos"""

    id: int

    model_config = {"from_attributes": True}


class Hospedaje(HospedajeInDBBase):
    """Schema para respuesta de API con datos de hospedaje"""


class HospedajeInDB(HospedajeInDBBase):
    """Schema para hospedaje completo en base de datos"""
