"""
Schemas de Pydantic para el modelo Usuario
"""

from pydantic import BaseModel, EmailStr


class UsuarioBase(BaseModel):
    """Schema base para Usuario con campos comunes"""

    nombre_completo: str
    email: EmailStr
    telefono: str | None = None
    puesto: str | None = None
    departamento: str | None = None


class UsuarioCreate(UsuarioBase):
    """Schema para crear un nuevo usuario"""

    password: str


class UsuarioUpdate(BaseModel):
    """Schema para actualizar un usuario existente"""

    nombre_completo: str | None = None
    email: EmailStr | None = None
    telefono: str | None = None
    puesto: str | None = None
    departamento: str | None = None
    is_active: bool | None = None


class UsuarioInDBBase(UsuarioBase):
    """Schema base para usuario en base de datos"""

    id: int
    is_active: bool
    is_superuser: bool

    model_config = {"from_attributes": True}


class Usuario(UsuarioInDBBase):
    """Schema para respuesta de API con datos de usuario"""


class UsuarioInDB(UsuarioInDBBase):
    """Schema para usuario completo en base de datos (incluye hash de password)"""

    hashed_password: str
