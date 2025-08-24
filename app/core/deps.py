# /app/core/deps.py

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from ..db.database import get_db
from ..models.user import User
from ..services.user import user_service
from . import security

# Este esquema OAuth2 apunta al endpoint de token que creamos
# Corregimos la URL para que incluya el prefijo /api
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")


def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    """
    Dependencia que obtiene el usuario actual a partir del token JWT.
    Se puede usar en cualquier endpoint que requiera autenticación.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # 1. Decodificar el token JWT
    payload = security.decode_access_token(token)
    if payload is None:
        raise credentials_exception

    # CAMBIO CLAVE: Extraer el username del token
    username: str | None = payload.get("sub")
    if username is None:
        raise credentials_exception

    # CAMBIO CLAVE: Buscar el usuario por username
    user = user_service.get_by_username(db, username=username)
    if user is None:
        raise credentials_exception

    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependencia adicional para verificar que el usuario esté activo.
    Por ahora solo retorna el usuario, pero se puede extender para
    verificar si está habilitado, confirmado por email, etc.
    """
    # En el futuro, aquí podrías verificar:
    # if not current_user.is_active:
    #     raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
