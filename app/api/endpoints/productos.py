"""
Endpoints para gestión de productos
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.crud.crud_producto import (
    create_producto,
    delete_producto,
    get_producto,
    get_productos,
    get_productos_activos,
    get_productos_por_categoria,
    update_producto,
)
from app.models import Producto
from app.schemas import producto as producto_schema

PRODUCTO_NOT_FOUND = "Producto no encontrado"

router = APIRouter()


@router.get("/", response_model=list[producto_schema.ProductoRead])
def read_productos(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    activos_solo: bool = False,
) -> list[Producto]:
    """
    Obtener productos
    """
    if activos_solo:
        productos = get_productos_activos(db)
    else:
        productos = get_productos(db, skip=skip, limit=limit)
    return productos


@router.post("/", response_model=producto_schema.ProductoRead)
def create_producto_endpoint(
    *,
    db: Session = Depends(deps.get_db),
    producto_in: producto_schema.ProductoCreate,
) -> Any:
    """
    Crear nuevo producto
    """
    producto = create_producto(db=db, producto_in=producto_in)
    return producto


@router.put("/{producto_id}", response_model=producto_schema.ProductoRead)
def update_producto_endpoint(
    *,
    db: Session = Depends(deps.get_db),
    producto_id: int,
    producto_in: producto_schema.ProductoUpdate,
) -> Any:
    """
    Actualizar producto por ID
    """
    producto = get_producto(db, producto_id=producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=PRODUCTO_NOT_FOUND
        )

    producto = update_producto(db=db, db_producto=producto, producto_in=producto_in)
    return producto


@router.get("/{producto_id}", response_model=producto_schema.ProductoRead)
def read_producto(
    *,
    db: Session = Depends(deps.get_db),
    producto_id: int,
) -> Any:
    """
    Obtener producto por ID
    """
    producto = get_producto(db, producto_id=producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=PRODUCTO_NOT_FOUND
        )
    return producto


@router.delete("/{producto_id}")
def delete_producto_endpoint(
    *,
    db: Session = Depends(deps.get_db),
    producto_id: int,
) -> Any:
    """
    Eliminar producto
    """
    producto = get_producto(db, producto_id=producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=PRODUCTO_NOT_FOUND
        )

    delete_producto(db=db, producto_id=producto_id)
    return {"ok": True}


@router.get("/categoria/{categoria}", response_model=list[producto_schema.ProductoRead])
def read_productos_por_categoria(
    *,
    db: Session = Depends(deps.get_db),
    categoria: str,
) -> Any:
    """
    Obtener productos por categoría
    """
    productos = get_productos_por_categoria(db, categoria=categoria)
    return productos
