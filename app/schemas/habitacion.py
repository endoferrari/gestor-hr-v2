"""
Schemas de Pydantic para el modelo Habitacion
"""

from pydantic import BaseModel


class HabitacionBase(BaseModel):
    """Schema base para Habitacion con campos comunes"""

    numero: str
    tipo: str
    precio_noche: float
    estado: str = "disponible"
    descripcion: str | None = None
    capacidad_personas: int = 1
    tiene_bano_privado: bool = True
    tiene_balcon: bool = False
    tiene_vista_mar: bool = False
    permite_mascotas: bool = False
    wifi_incluido: bool = True
    aire_acondicionado: bool = True
    television: bool = True
    minibar: bool = False
    caja_fuerte: bool = False
    servicio_lavanderia: bool = True
    observaciones: str | None = None


class HabitacionCreate(HabitacionBase):
    """Schema para crear una nueva habitacion"""


class HabitacionUpdate(BaseModel):
    """Schema para actualizar una habitacion existente"""

    numero: str | None = None
    tipo: str | None = None
    precio_noche: float | None = None
    estado: str | None = None
    descripcion: str | None = None
    capacidad_personas: int | None = None
    tiene_bano_privado: bool | None = None
    tiene_balcon: bool | None = None
    tiene_vista_mar: bool | None = None
    permite_mascotas: bool | None = None
    wifi_incluido: bool | None = None
    aire_acondicionado: bool | None = None
    television: bool | None = None
    minibar: bool | None = None
    caja_fuerte: bool | None = None
    servicio_lavanderia: bool | None = None
    observaciones: str | None = None


class HabitacionEstadoUpdate(BaseModel):
    """Schema para actualizar solo el estado de una habitacion"""

    estado: str


class HabitacionInDBBase(HabitacionBase):
    """Schema base para habitacion en base de datos"""

    id: int

    model_config = {"from_attributes": True}


class HabitacionRead(HabitacionInDBBase):
    """Schema para respuesta de API con datos de habitacion"""


class HabitacionInDB(HabitacionInDBBase):
    """Schema completo para habitacion en base de datos"""
