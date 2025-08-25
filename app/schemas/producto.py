"""
Schemas de Pydantic para el modelo Producto
"""

from pydantic import BaseModel


class ProductoBase(BaseModel):
    """Schema base para Producto con campos comunes"""

    nombre: str
    descripcion: str | None = None
    categoria: str
    precio: float
    stock: int | None = None
    activo: bool = True
    codigo_barras: str | None = None
    proveedor: str | None = None
    observaciones: str | None = None


class ProductoCreate(ProductoBase):
    """Schema para crear un nuevo producto"""


class ProductoUpdate(BaseModel):
    """Schema para actualizar un producto existente"""

    nombre: str | None = None
    descripcion: str | None = None
    categoria: str | None = None
    precio: float | None = None
    stock: int | None = None
    activo: bool | None = None
    codigo_barras: str | None = None
    proveedor: str | None = None
    observaciones: str | None = None


class ProductoInDBBase(ProductoBase):
    """Schema base para producto en base de datos"""

    id: int

    model_config = {"from_attributes": True}


class ProductoRead(ProductoInDBBase):
    """Schema para respuesta de API con datos de producto"""


class ProductoInDB(ProductoInDBBase):
    """Schema completo para producto en base de datos"""
