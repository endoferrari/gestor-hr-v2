"""
Operaciones CRUD para todos los modelos
"""

# Importaciones directas para mejor tipado
from app.crud.crud_hospedaje import (
    create_hospedaje,
    delete_hospedaje,
    get_hospedaje,
    get_hospedajes,
    get_hospedajes_by_estado,
    get_hospedajes_by_habitacion,
    update_hospedaje,
)
from app.crud.crud_usuario import (
    create_usuario,
    delete_usuario,
    get_usuario,
    get_usuario_by_email,
    get_usuarios,
    update_usuario,
)

__all__ = [
    # Usuario operations
    "get_usuario",
    "get_usuario_by_email",
    "get_usuarios",
    "create_usuario",
    "update_usuario",
    "delete_usuario",
    # Hospedaje operations
    "get_hospedaje",
    "get_hospedajes",
    "get_hospedajes_by_habitacion",
    "get_hospedajes_by_estado",
    "create_hospedaje",
    "update_hospedaje",
    "delete_hospedaje",
]
