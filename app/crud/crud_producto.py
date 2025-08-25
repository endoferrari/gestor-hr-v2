"""
Operaciones CRUD para el modelo Producto
"""

from typing import Optional

from sqlalchemy.orm import Session

from app.models.producto import Producto
from app.schemas.producto import ProductoCreate, ProductoUpdate


def get_producto(db: Session, producto_id: int) -> Producto | None:
    """Obtener un producto por ID"""
    return db.query(Producto).filter(Producto.id == producto_id).first()


def get_productos(db: Session, skip: int = 0, limit: int = 100) -> list[Producto]:
    """Obtener lista de productos con paginación"""
    return db.query(Producto).offset(skip).limit(limit).all()


def get_productos_activos(db: Session) -> list[Producto]:
    """Obtener solo productos activos"""
    return db.query(Producto).filter(Producto.activo).all()


def get_productos_por_categoria(db: Session, categoria: str) -> list[Producto]:
    """Obtener productos por categoría"""
    return db.query(Producto).filter(Producto.categoria == categoria).all()


def create_producto(db: Session, *, producto_in: ProductoCreate) -> Producto:
    """Crear un nuevo producto"""
    db_producto = Producto(
        nombre=producto_in.nombre,
        descripcion=producto_in.descripcion,
        categoria=producto_in.categoria,
        precio=producto_in.precio,
        stock=producto_in.stock,
        activo=producto_in.activo,
        codigo_barras=producto_in.codigo_barras,
        proveedor=producto_in.proveedor,
        observaciones=producto_in.observaciones,
    )
    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    return db_producto


def update_producto(
    db: Session, *, db_producto: Producto, producto_in: ProductoUpdate
) -> Producto:
    """Actualizar un producto existente"""
    update_data = producto_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_producto, field, value)

    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    return db_producto


def delete_producto(db: Session, *, producto_id: int) -> Producto:
    """Eliminar un producto"""
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    db.delete(producto)
    db.commit()
    return producto
