# /app/schemas/user.py
from pydantic import BaseModel, ConfigDict


# Propiedades compartidas
class UserBase(BaseModel):
    username: str  # CAMBIO CLAVE
    full_name: str | None = None


# Propiedades para recibir al crear un usuario
class UserCreate(UserBase):
    password: str


# Propiedades para login
class UserLogin(BaseModel):
    username: str  # CAMBIO CLAVE
    password: str


# Propiedades para enviar al leer un usuario (nunca incluimos la contraseña)
class User(UserBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# Respuesta del token de acceso
class Token(BaseModel):
    access_token: str
    token_type: str
    user: User
