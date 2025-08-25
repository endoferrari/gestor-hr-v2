"""
Security utilities for authentication and authorization
"""

from datetime import UTC, datetime, timedelta, timezone
from typing import Any, Union

from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(
    subject: str | Any, expires_delta: timedelta | None = None
) -> str:
    """
    Crear un token JWT de acceso

    Args:
        subject: El sujeto del token (generalmente el user ID o email)
        expires_delta: Tiempo de expiración personalizado

    Returns:
        Token JWT como string
    """
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode: dict[str, Any] = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verificar que una contraseña en texto plano coincida con el hash

    Args:
        plain_password: Contraseña en texto plano
        hashed_password: Contraseña hasheada

    Returns:
        True si coinciden, False en caso contrario
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Crear hash de una contraseña

    Args:
        password: Contraseña en texto plano

    Returns:
        Hash de la contraseña
    """
    return pwd_context.hash(password)


def verify_token(token: str) -> str | None:
    """
    Verificar y decodificar un token JWT

    Args:
        token: Token JWT a verificar

    Returns:
        Subject del token si es válido, None en caso contrario
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = payload.get("sub")
        return token_data
    except JWTError:
        return None
