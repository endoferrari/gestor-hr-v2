"""
Modelo de datos para Tarifas
"""

from datetime import date

from sqlalchemy import Boolean, Date, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class Tarifa(Base):
    """
    Modelo para las tarifas de habitaciones
    """

    __tablename__ = "tarifas"

    nombre: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    tipo_habitacion: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True
    )  # individual, doble, suite, familiar
    precio: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    fecha_inicio: Mapped[date | None] = mapped_column(
        Date, nullable=True
    )  # NULL = sin restricción de fecha
    fecha_fin: Mapped[date | None] = mapped_column(
        Date, nullable=True
    )  # NULL = sin restricción de fecha
    dias_semana: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )  # "1,2,3,4,5" para lunes-viernes, NULL = todos los días
    activa: Mapped[bool] = mapped_column(Boolean, default=True)
    descripcion: Mapped[str | None] = mapped_column(String(500), nullable=True)
    prioridad: Mapped[int] = mapped_column(
        Integer, default=1
    )  # Para ordenar tarifas en caso de conflicto
