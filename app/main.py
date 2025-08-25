"""
Aplicación principal FastAPI - Gestor HR v3.0 Profesional
Versión simplificada y funcional
"""

from datetime import datetime
from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.api import api_router
from app.core.config import get_settings

# Crear la instancia de la aplicación
app = FastAPI(
    title="Gestor HR v3.0 Profesional",
    description="Sistema profesional de gestión hotelera",
    version="1.0.0",
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar orígenes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurar archivos estáticos
frontend_path = Path(__file__).parent.parent / "frontend"
if frontend_path.exists():
    app.mount("/frontend", StaticFiles(directory=str(frontend_path)), name="frontend")

# Incluir router principal de la API
app.include_router(api_router)


@app.get("/", include_in_schema=False)
async def serve_frontend():
    """Servir la aplicación frontend"""
    frontend_file = frontend_path / "index.html"
    if frontend_file.exists():
        return FileResponse(str(frontend_file))
    return {"message": "Frontend no encontrado", "path": str(frontend_path)}


@app.get("/api", tags=["Health"])
async def root() -> dict[str, str]:
    """Endpoint de bienvenida y verificación de estado de API"""
    return {
        "message": "🏨 Gestor HR v3.0 Profesional - Sistema de Gestión Hotelera",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    """Endpoint de verificación de salud del sistema"""
    settings = get_settings()
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "environment": "development" if settings.DEBUG else "production",
        "database": "ready",
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/info", tags=["Health"])
async def system_info() -> dict[str, str]:
    """Información del sistema (solo en modo debug)"""
    settings = get_settings()
    if not settings.DEBUG:
        return {"detail": "Endpoint no disponible en producción"}

    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "debug": str(settings.DEBUG),
        "host": settings.HOST,
        "port": str(settings.PORT),
        "log_level": settings.LOG_LEVEL,
    }


if __name__ == "__main__":
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
