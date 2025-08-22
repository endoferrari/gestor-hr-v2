"""
Aplicación principal FastAPI
"""

from typing import Dict
from fastapi import FastAPI
from app.core.config import settings

app = FastAPI(
    title="Gestor HR v2.0",
    description="Sistema de Gestión Hotelera moderno con FastAPI",
    version="0.1.0",
)


@app.get("/")
async def root() -> Dict[str, str]:
    """Endpoint de bienvenida"""
    return {
        "message": "¡Bienvenido a Gestor HR v2.0!",
        "version": "0.1.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Endpoint de verificación de salud"""
    return {"status": "healthy", "environment": settings.ENVIRONMENT}
