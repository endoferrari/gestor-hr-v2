"""
Clase base para todos los modelos de SQLAlchemy
"""

from datetime import UTC, datetime, timezone

from sqlalchemy import DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def utc_now() -> datetime:
    """Retorna la fecha y hora actual en UTC"""
    return datetime.now(UTC)


class Base(DeclarativeBase):
    """
    Clase base para todos los modelos de SQLAlchemy.
    Proporciona campos comunes y utilidades.
    """

    # Campos comunes para todos los modelos
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime, default=utc_now, nullable=False
    )
    fecha_actualizacion: Mapped[datetime] = mapped_column(
        DateTime,
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )
