# /app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <--- 1. IMPORTA ESTO

from .api.endpoints import auth, users, habitaciones, hospedaje
from .db.database import engine, Base

# Esta línea le dice a SQLAlchemy que cree TODAS las tablas de los modelos importados
# si es que no existen.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gestor Total H&R API")

# --- 2. AÑADE ESTE BLOQUE COMPLETO JUSTO AQUÍ ---
# Lista de orígenes permitidos (tu servidor de frontend)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Si usas Live Server de VS Code, puede ser un puerto diferente
    "http://127.0.0.1:5500",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Permite estos orígenes
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todas las cabeceras
)
# --- FIN DEL BLOQUE DE CORS ---

# Incluimos los routers
app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(auth.router, prefix="/api", tags=["Auth"])
app.include_router(habitaciones.router, prefix="/api", tags=["Habitaciones"])
app.include_router(hospedaje.router, prefix="/api", tags=["Hospedaje"])


@app.get("/")
def read_root():
    return {
        "message": "Gestor Total H&R API - Sistema de gestión hotelera completo",
        "version": "2.0",
        "features": ["Autenticación", "Habitaciones", "Huéspedes", "Hospedaje"],
    }


@app.get("/health")
def health_check():
    return {"status": "OK", "service": "SKYNET HR 2.0"}


# Event handlers comentados hasta que PostgreSQL esté configurado
# @app.on_event("startup")
# async def startup_event():
#     create_tables()
