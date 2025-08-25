"""
Schemas de Pydantic para el modelo Tarifa
"""

from datetime import date

from pydantic import BaseModel


class TarifaBase(BaseModel):
    """Schema base para Tarifa con campos comunes"""

    nombre: str
    tipo_habitacion: str
    precio: float
    fecha_inicio: date | None = None
    fecha_fin: date | None = None
    dias_semana: str | None = None
    activa: bool = True
    descripcion: str | None = None
    prioridad: int = 1


class TarifaCreate(TarifaBase):
    """Schema para crear una nueva tarifa"""


class TarifaUpdate(BaseModel):
    """Schema para actualizar una tarifa existente"""

    nombre: str | None = None
    tipo_habitacion: str | None = None
    precio: float | None = None
    fecha_inicio: date | None = None
    fecha_fin: date | None = None
    dias_semana: str | None = None
    activa: bool | None = None
    descripcion: str | None = None
    prioridad: int | None = None


class TarifaInDBBase(TarifaBase):
    """Schema base para tarifa en base de datos"""

    id: int

    model_config = {"from_attributes": True}


class TarifaRead(TarifaInDBBase):
    """Schema para respuesta de API con datos de tarifa"""


class TarifaInDB(TarifaInDBBase):
    """Schema completo para tarifa en base de datos"""
