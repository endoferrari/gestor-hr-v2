# /app/schemas/habitacion.py
from pydantic import BaseModel
from ..models.habitacion import TipoHabitacion, EstadoHabitacion


# Propiedades base que son compartidas
class HabitacionBase(BaseModel):
    numero: str
    tipo: TipoHabitacion
    precio_por_noche: float


# Propiedades necesarias al crear una habitación (en este caso, son las mismas que las base)
class HabitacionCreate(HabitacionBase):
    pass


# Propiedades que se devolverán al leer una habitación desde la API
class Habitacion(HabitacionBase):
    id: int
    estado: EstadoHabitacion

    class Config:
        from_attributes = True
