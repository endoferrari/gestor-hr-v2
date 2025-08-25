"""
Acceso directo a la configuración de base de datos
"""

from .db.session import get_db

__all__ = ["get_db"]
