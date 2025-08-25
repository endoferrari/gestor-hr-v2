"""
Router principal de la API que incluye todos los endpoints
"""

from fastapi import APIRouter

# Asegúrate de que todos estos módulos y sus routers existan
from app.api.endpoints import (
    auth,
    habitaciones,
    hospedaje,
    productos,
    reportes,
    tarifas,
    usuarios,
)

api_router = APIRouter(prefix="/api/v1")

# Incluimos todos los routers de nuestros módulos
api_router.include_router(auth.router, prefix="/auth", tags=["Autenticación"])
api_router.include_router(usuarios.router, prefix="/usuarios", tags=["Usuarios"])
api_router.include_router(hospedaje.router, prefix="/hospedajes", tags=["Hospedajes"])
api_router.include_router(
    habitaciones.router, prefix="/habitaciones", tags=["Habitaciones"]
)
api_router.include_router(productos.router, prefix="/productos", tags=["Productos"])
api_router.include_router(tarifas.router, prefix="/tarifas", tags=["Tarifas"])
api_router.include_router(reportes.router, prefix="/reportes", tags=["Reportes"])
