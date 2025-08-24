# /app/api/endpoints/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ...core import security
from ...db.database import get_db
from ...services.user import user_service

router = APIRouter()


@router.post("/token")
def login_for_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    Endpoint de login. Recibe username y contraseña.
    Devuelve un token de acceso.
    """
    # CAMBIO CLAVE: Buscamos por username
    user = user_service.get_by_username(db, username=form_data.username)

    # 2. Si el usuario no existe o la contraseña es incorrecta, devuelve un error
    if not user or not security.verify_password(
        form_data.password, str(user.hashed_password)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # CAMBIO CLAVE: El "subject" del token ahora es el username
    access_token = security.create_access_token(data={"sub": user.username})

    # 4. Devuelve el token
    return {"access_token": access_token, "token_type": "bearer"}
