# /app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import users

# Crear la aplicación FastAPI
app = FastAPI(
    title="Gestor HR - SKYNET 2.0",
    version="2.0.0",
    description="Sistema de gestión de recursos humanos - Backend API",
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir los routers
app.include_router(users.router, prefix="/api", tags=["Users"])


@app.get("/")
def read_root():
    return {
        "proyecto": "Gestor HR - SKYNET 2.0",
        "version": "2.0.0",
        "status": "Running",
        "descripcion": "Sistema de gestión de recursos humanos",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "users": "/api/users/",
            "api_docs": "/redoc",
        },
    }


@app.get("/health")
def health_check():
    return {"status": "OK", "service": "SKYNET HR 2.0"}


# Event handlers comentados hasta que PostgreSQL esté configurado
# @app.on_event("startup")
# async def startup_event():
#     create_tables()
