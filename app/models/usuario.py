"""
Modelo de Usuario para el sistema de gestión hotelera
"""

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class Usuario(Base):
    """
    Modelo de Usuario del sistema.
    Representa tanto empleados como administradores del hotel.
    """

    __tablename__ = "usuarios"

    # Información personal
    nombre_completo: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(100), unique=True, index=True, nullable=False
    )
    telefono: Mapped[str | None] = mapped_column(String(20), nullable=True)

    # Credenciales
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    # Estado y permisos
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)

    # Información laboral
    puesto: Mapped[str | None] = mapped_column(String(50), nullable=True)
    departamento: Mapped[str | None] = mapped_column(String(50), nullable=True)

    def __str__(self) -> str:
        return f"Usuario({self.nombre_completo} - {self.email})"

    def __repr__(self) -> str:
        return f"<Usuario(id={self.id}, email='{self.email}', active={self.is_active})>"
