# /app/core/security.py
from datetime import UTC, datetime, timedelta
from typing import Any

from jose import JWTError, jwt  # type: ignore
from passlib.context import CryptContext  # type: ignore

from .config import settings  # <--- 1. IMPORTA LOS AJUSTES

# Reutilizamos el contexto de hashing que ya teníamos
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 2. USA LOS VALORES DESDE EL OBJETO settings
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # Esto también podría ir a config


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica que la contraseña plana coincida con la hasheada."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict[str, Any]) -> str:
    """Crea un nuevo token de acceso JWT."""
    to_encode = data.copy()
    expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    # Usa la SECRET_KEY de la configuración
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict[str, Any] | None:
    """Decodifica un token JWT y devuelve el payload o None si es inválido."""
    try:
        # Usa la SECRET_KEY de la configuración
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
