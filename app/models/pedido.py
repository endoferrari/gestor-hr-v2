"""
Modelos para Pedidos y Líneas de Pedido
"""

from sqlalchemy import ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Pedido(Base):
    """
    Modelo para pedidos realizados por huéspedes
    """

    __tablename__ = "pedidos"

    hospedaje_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("hospedajes.id"), nullable=False
    )
    numero_habitacion: Mapped[str] = mapped_column(
        String(10), nullable=False, index=True
    )
    estado: Mapped[str] = mapped_column(
        String(20), nullable=False, default="abierto"
    )  # abierto, cerrado, pagado
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0.0)
    impuestos: Mapped[float] = mapped_column(
        Numeric(10, 2), nullable=False, default=0.0
    )
    total: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0.0)
    metodo_pago: Mapped[str | None] = mapped_column(
        String(50), nullable=True
    )  # efectivo, tarjeta, habitacion
    observaciones: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relaciones
    lineas: Mapped[list["LineaPedido"]] = relationship(
        "LineaPedido", back_populates="pedido", cascade="all, delete-orphan"
    )


class LineaPedido(Base):
    """
    Modelo para las líneas individuales de un pedido
    """

    __tablename__ = "lineas_pedido"

    pedido_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("pedidos.id"), nullable=False, index=True
    )
    producto_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("productos.id"), nullable=False
    )
    nombre_producto: Mapped[str] = mapped_column(
        String(100), nullable=False
    )  # Snapshot del nombre
    precio_unitario: Mapped[float] = mapped_column(
        Numeric(10, 2), nullable=False
    )  # Snapshot del precio
    cantidad: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    subtotal_linea: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    observaciones_linea: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Relaciones
    pedido: Mapped[Pedido] = relationship("Pedido", back_populates="lineas")
