# /app/api/endpoints/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Cambiamos la importación
from ... import schemas
from ...core.deps import get_current_active_user
from ...core.security import create_access_token, verify_password
from ...db.database import get_db
from ...models.user import User
from ...services.user import user_service  # <--- IMPORTANTE: Importamos la instancia

router = APIRouter()


@router.post(
    "/users/", response_model=schemas.User, status_code=status.HTTP_201_CREATED
)
def create_user_endpoint(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Endpoint para crear un nuevo usuario.
    """
    # CAMBIO CLAVE: Buscamos por username
    db_user = user_service.get_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya está registrado.",
        )
    # Usamos el método create del nuevo servicio
    return user_service.create(db=db, obj_in=user)


@router.post("/users/login/", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    Endpoint para iniciar sesión y obtener un token de acceso.
    """
    # CAMBIO CLAVE: Buscar el usuario por username
    db_user = user_service.get_by_username(db, username=user.username)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )

    # Verificar la contraseña
    if not verify_password(user.password, str(db_user.hashed_password)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )

    # CAMBIO CLAVE: El "subject" del token ahora es el username
    access_token = create_access_token(
        data={"sub": db_user.username, "user_id": db_user.id}
    )

    # Crear el objeto User usando model_validate
    user_data = schemas.User.model_validate(db_user)

    return schemas.Token(access_token=access_token, token_type="bearer", user=user_data)


@router.get("/users/me/", response_model=schemas.User)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    """
    Endpoint protegido que devuelve la información del usuario actual.
    Requiere autenticación con token JWT válido.
    """
    return current_user


@router.get("/users/protected-example/")
def protected_endpoint_example(current_user: User = Depends(get_current_active_user)):
    """
    Ejemplo de endpoint protegido que requiere autenticación.
    """
    return {
        "message": f"¡Hola {current_user.full_name}! Este es un endpoint protegido.",
        "user_username": current_user.username,
        "user_id": current_user.id,
        "access_granted": True,
    }
