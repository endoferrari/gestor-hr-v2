"""
Modelo de datos para Habitaciones
"""

from sqlalchemy import Boolean, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class Habitacion(Base):
    """
    Modelo para las habitaciones del hotel
    """

    __tablename__ = "habitaciones"

    numero: Mapped[str] = mapped_column(
        String(10), unique=True, nullable=False, index=True
    )
    tipo: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # individual, doble, suite, familiar
    precio_noche: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    estado: Mapped[str] = mapped_column(
        String(20), nullable=False, default="disponible"
    )  # disponible, ocupada, mantenimiento, limpieza
    descripcion: Mapped[str | None] = mapped_column(String(500), nullable=True)
    capacidad_personas: Mapped[int] = mapped_column(Integer, default=1)
    tiene_bano_privado: Mapped[bool] = mapped_column(Boolean, default=True)
    tiene_balcon: Mapped[bool] = mapped_column(Boolean, default=False)
    tiene_vista_mar: Mapped[bool] = mapped_column(Boolean, default=False)
    permite_mascotas: Mapped[bool] = mapped_column(Boolean, default=False)
    wifi_incluido: Mapped[bool] = mapped_column(Boolean, default=True)
    aire_acondicionado: Mapped[bool] = mapped_column(Boolean, default=True)
    television: Mapped[bool] = mapped_column(Boolean, default=True)
    minibar: Mapped[bool] = mapped_column(Boolean, default=False)
    caja_fuerte: Mapped[bool] = mapped_column(Boolean, default=False)
    servicio_lavanderia: Mapped[bool] = mapped_column(
        Boolean, default=True
    )  # Nuevo campo
    observaciones: Mapped[str | None] = mapped_column(String(1000), nullable=True)
