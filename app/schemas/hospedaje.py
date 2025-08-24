from pydantic import BaseModel
from datetime import datetime
from .huesped import Huesped, HuespedCreate
from .habitacion import Habitacion


class HospedajeBase(BaseModel):
    habitacion_id: int


# Esquema para la operación de Check-In
class HospedajeCreate(HospedajeBase):
    huesped: HuespedCreate  # Anidamos el esquema de creación de huésped


# Esquema para devolver datos desde la API
class Hospedaje(HospedajeBase):
    id: int
    fecha_entrada: datetime
    fecha_salida: datetime | None = None
    huesped: Huesped  # Devolvemos el objeto completo del huésped
    habitacion: Habitacion  # Devolvemos el objeto completo de la habitación

    class Config:
        from_attributes = True
