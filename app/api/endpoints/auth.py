"""
Authentication endpoints
"""

from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from ...core import security
from ...core.config import settings
from ...crud import crud_usuario
from ...database import get_db
from ...models.usuario import Usuario
from ...schemas.auth import Token

router = APIRouter()

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    token: Annotated[str, Depends(oauth2_scheme)],
) -> Usuario:
    """
    Get current user based on JWT token
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        username: str | None = payload.get("sub")
        if username is None:
            raise credentials_exception from None
    except JWTError as exc:
        raise credentials_exception from exc

    user = crud_usuario.get_usuario_by_email(db=db, email=username)
    if user is None:
        raise credentials_exception from None
    return user


@router.post("/login", response_model=Token)
def login_access_token(
    db: Annotated[Session, Depends(get_db)],
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = crud_usuario.authenticate_usuario(
        db=db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return Token(
        access_token=security.create_access_token(
            subject=user.email, expires_delta=access_token_expires
        ),
        token_type="bearer",
    )


@router.post("/test-token")
def test_token(
    current_user: Annotated[Usuario, Depends(get_current_user)],
) -> dict[str, str]:
    """
    Test access token
    """
    return {"email": current_user.email, "name": current_user.nombre_completo}
