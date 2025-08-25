"""
Schemas de Pydantic para validación de datos de la API
"""

from app.schemas.hospedaje import (
    Hospedaje,
    HospedajeCreate,
    HospedajeInDB,
    HospedajeUpdate,
)
from app.schemas.usuario import Usuario, UsuarioCreate, UsuarioInDB, UsuarioUpdate

__all__ = [
    "Usuario",
    "UsuarioCreate",
    "UsuarioUpdate",
    "UsuarioInDB",
    "Hospedaje",
    "HospedajeCreate",
    "HospedajeUpdate",
    "HospedajeInDB",
]
