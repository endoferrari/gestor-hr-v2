# /app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <--- 1. IMPORTA ESTO

from .api.endpoints import auth, users
from .db.database import engine
from .models import user

user.Base.metadata.create_all(bind=engine)

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


@app.get("/")
def read_root():
    return {"Proyecto": "Gestor Total H&R"}


@app.get("/health")
def health_check():
    return {"status": "OK", "service": "SKYNET HR 2.0"}


# Event handlers comentados hasta que PostgreSQL esté configurado
# @app.on_event("startup")
# async def startup_event():
#     create_tables()
