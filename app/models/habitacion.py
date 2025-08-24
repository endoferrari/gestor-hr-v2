# /app/models/habitacion.py
from sqlalchemy import Column, Integer, String, Float, Enum
from ..db.database import Base
import enum


class TipoHabitacion(enum.Enum):
    SIMPLE = "simple"
    DOBLE = "doble"
    SUITE = "suite"
    MATRIMONIAL = "matrimonial"
    FAMILIAR = "familiar"


class EstadoHabitacion(enum.Enum):
    DISPONIBLE = "disponible"
    OCUPADA = "ocupada"
    MANTENIMIENTO = "mantenimiento"
    LIMPIEZA = "limpieza"


class Habitacion(Base):
    __tablename__ = "habitaciones"

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(String, unique=True, index=True, nullable=False)
    tipo = Column(Enum(TipoHabitacion), nullable=False)
    estado = Column(
        Enum(EstadoHabitacion), default=EstadoHabitacion.DISPONIBLE, nullable=False
    )
    precio_por_noche = Column(Float, nullable=False)
