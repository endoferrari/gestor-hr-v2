# /app/api/endpoints/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Cambiamos la importación
from ... import schemas
from ...services.user import user_service  # <--- IMPORTANTE: Importamos la instancia
from ...db.database import get_db

router = APIRouter()


@router.post(
    "/users/", response_model=schemas.User, status_code=status.HTTP_201_CREATED
)
def create_user_endpoint(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Endpoint para crear un nuevo usuario.
    """
    # Usamos los métodos del nuevo servicio
    db_user = user_service.get_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado.",
        )
    # Usamos el método create del nuevo servicio
    return user_service.create(db=db, obj_in=user)
