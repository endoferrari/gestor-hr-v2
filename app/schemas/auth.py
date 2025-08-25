"""
Esquemas para autenticación
"""

from typing import Optional

from pydantic import BaseModel


class Token(BaseModel):
    """Token de acceso"""

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Datos del token"""

    email: str | None = None


class UserLogin(BaseModel):
    """Datos para login de usuario"""

    email: str
    password: str
