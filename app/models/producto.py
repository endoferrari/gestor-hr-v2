"""
Modelo de datos para Productos
"""

from sqlalchemy import Boolean, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class Producto(Base):
    """
    Modelo para productos disponibles para pedidos (bebidas, comida, servicios)
    """

    __tablename__ = "productos"

    nombre: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    descripcion: Mapped[str | None] = mapped_column(String(500), nullable=True)
    categoria: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True
    )  # bebidas, comida, servicios
    precio: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    stock: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )  # NULL para servicios sin límite de stock
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    codigo_barras: Mapped[str | None] = mapped_column(String(50), nullable=True)
    proveedor: Mapped[str | None] = mapped_column(String(100), nullable=True)
    observaciones: Mapped[str | None] = mapped_column(String(500), nullable=True)
