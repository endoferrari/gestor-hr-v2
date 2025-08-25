"""
API endpoints para la entidad Usuario
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...api.endpoints.auth import get_current_user
from ...crud import crud_usuario
from ...database import get_db
from ...models.usuario import Usuario
from ...schemas.usuario import (
    Usuario as UsuarioSchema,
    UsuarioCreate,
    UsuarioUpdate,
)

router = APIRouter()

# Constantes para evitar duplicación de strings
USUARIO_NOT_FOUND = "Usuario no encontrado"
EMAIL_ALREADY_EXISTS = "Ya existe un usuario con este email"


@router.get("/", response_model=list[UsuarioSchema])
def get_usuarios_endpoint(
    db: Annotated[Session, Depends(get_db)],
    _current_user: Annotated[Usuario, Depends(get_current_user)],
    skip: int = 0,
    limit: int = 100,
) -> list[Usuario]:
    """
    Obtener lista de usuarios con paginación
    """
    usuarios = crud_usuario.get_usuarios(db, skip=skip, limit=limit)
    return usuarios


@router.post("/", response_model=UsuarioSchema, status_code=status.HTTP_201_CREATED)
def create_usuario_endpoint(
    *,
    db: Annotated[Session, Depends(get_db)],
    _current_user: Annotated[Usuario, Depends(get_current_user)],
    usuario_in: UsuarioCreate,
) -> Usuario:
    """
    Crear nuevo usuario
    """
    # Verificar si el email ya existe
    usuario = crud_usuario.get_usuario_by_email(db, email=usuario_in.email)
    if usuario:
        raise HTTPException(
            status_code=400,
            detail=EMAIL_ALREADY_EXISTS,
        )

    usuario = crud_usuario.create_usuario(db=db, usuario_in=usuario_in)
    return usuario


@router.get("/{usuario_id}", response_model=UsuarioSchema)
def get_usuario_endpoint(
    *,
    db: Annotated[Session, Depends(get_db)],
    _current_user: Annotated[Usuario, Depends(get_current_user)],
    usuario_id: int,
) -> Usuario:
    """
    Obtener un usuario específico por su ID
    """
    usuario = crud_usuario.get_usuario(db=db, usuario_id=usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail=USUARIO_NOT_FOUND)
    return usuario


@router.put("/{usuario_id}", response_model=UsuarioSchema)
def update_usuario_endpoint(
    *,
    db: Annotated[Session, Depends(get_db)],
    _current_user: Annotated[Usuario, Depends(get_current_user)],
    usuario_id: int,
    usuario_in: UsuarioUpdate,
) -> Usuario:
    """
    Actualizar un usuario existente
    """
    usuario = crud_usuario.get_usuario(db=db, usuario_id=usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail=USUARIO_NOT_FOUND)

    # Si se está actualizando el email, verificar que no exista
    if usuario_in.email and usuario_in.email != usuario.email:
        existing_user = crud_usuario.get_usuario_by_email(db, email=usuario_in.email)
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail=EMAIL_ALREADY_EXISTS,
            )

    usuario = crud_usuario.update_usuario(
        db=db, db_usuario=usuario, usuario_in=usuario_in
    )
    return usuario


@router.delete("/{usuario_id}")
def delete_usuario_endpoint(
    *,
    db: Annotated[Session, Depends(get_db)],
    _current_user: Annotated[Usuario, Depends(get_current_user)],
    usuario_id: int,
) -> dict[str, str]:
    """
    Eliminar un usuario (soft delete)
    """
    usuario = crud_usuario.get_usuario(db=db, usuario_id=usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail=USUARIO_NOT_FOUND)

    crud_usuario.delete_usuario(db=db, usuario_id=usuario_id)
    return {"message": "Usuario eliminado correctamente"}


@router.get("/email/{email}", response_model=UsuarioSchema)
def get_usuario_by_email_endpoint(
    *,
    db: Annotated[Session, Depends(get_db)],
    _current_user: Annotated[Usuario, Depends(get_current_user)],
    email: str,
) -> Usuario:
    """
    Obtener un usuario por su email
    """
    usuario = crud_usuario.get_usuario_by_email(db=db, email=email)
    if not usuario:
        raise HTTPException(status_code=404, detail=USUARIO_NOT_FOUND)
    return usuario
