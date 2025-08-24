# /app/schemas/user.py
from pydantic import BaseModel, EmailStr


# Propiedades compartidas
class UserBase(BaseModel):
    email: EmailStr


# Propiedades para recibir al crear un usuario
class UserCreate(UserBase):
    password: str


# Propiedades para enviar al leer un usuario (nunca incluimos la contraseña)
class User(UserBase):
    id: int

    class Config:
        from_attributes = True
