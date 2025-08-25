"""
Modelo de Hospedaje para el sistema de gestión hotelera
"""

from datetime import date
from decimal import Decimal

from sqlalchemy import Date, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class Hospedaje(Base):
    """
    Modelo de Hospedaje del sistema.
    Representa las reservas y estancias en el hotel.
    """

    __tablename__ = "hospedajes"

    # Información del huésped
    nombre_huesped: Mapped[str] = mapped_column(String(100), nullable=False)
    email_huesped: Mapped[str | None] = mapped_column(String(100), nullable=True)
    telefono_huesped: Mapped[str | None] = mapped_column(String(20), nullable=True)
    documento_identidad: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Información de la reserva
    numero_habitacion: Mapped[str] = mapped_column(String(10), nullable=False)
    tipo_habitacion: Mapped[str] = mapped_column(String(50), nullable=False)
    fecha_check_in: Mapped[date] = mapped_column(Date, nullable=False)
    fecha_check_out: Mapped[date] = mapped_column(Date, nullable=False)

    # Información financiera
    precio_por_noche: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    numero_noches: Mapped[int] = mapped_column(Integer, nullable=False)
    total_hospedaje: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    # Estado de la reserva
    estado: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="pendiente",  # pendiente, confirmado, check_in, check_out, cancelado
    )

    # Observaciones adicionales
    observaciones: Mapped[str | None] = mapped_column(Text, nullable=True)

    def __str__(self) -> str:
        return f"Hospedaje({self.nombre_huesped} - Hab. {self.numero_habitacion})"

    def __repr__(self) -> str:
        return (
            f"<Hospedaje(id={self.id}, huesped='{self.nombre_huesped}', "
            f"habitacion='{self.numero_habitacion}', estado='{self.estado}')>"
        )
