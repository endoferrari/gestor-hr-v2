"""
Operaciones CRUD para el modelo Usuario
"""

from typing import Optional

from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate


def get_usuario(db: Session, usuario_id: int) -> Usuario | None:
    """Obtener un usuario por ID"""
    return db.query(Usuario).filter(Usuario.id == usuario_id).first()


def get_usuario_by_email(db: Session, email: str) -> Usuario | None:
    """Obtener un usuario por email"""
    return db.query(Usuario).filter(Usuario.email == email).first()


def get_usuarios(db: Session, skip: int = 0, limit: int = 100) -> list[Usuario]:
    """Obtener lista de usuarios con paginación"""
    return db.query(Usuario).offset(skip).limit(limit).all()


def create_usuario(db: Session, *, usuario_in: UsuarioCreate) -> Usuario:
    """Crear un nuevo usuario"""
    hashed_password = get_password_hash(usuario_in.password)

    db_usuario = Usuario(
        nombre_completo=usuario_in.nombre_completo,
        email=usuario_in.email,
        telefono=usuario_in.telefono,
        puesto=usuario_in.puesto,
        departamento=usuario_in.departamento,
        hashed_password=hashed_password,
        is_active=True,
        is_superuser=False,
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario


def update_usuario(
    db: Session, *, db_usuario: Usuario, usuario_in: UsuarioUpdate
) -> Usuario:
    """Actualizar un usuario existente"""
    update_data = usuario_in.model_dump(exclude_unset=True)

    # Si se actualiza la contraseña, hashearla
    if "password" in update_data:
        hashed_password = get_password_hash(update_data["password"])
        del update_data["password"]
        update_data["hashed_password"] = hashed_password

    for field, value in update_data.items():
        setattr(db_usuario, field, value)

    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario


def authenticate_usuario(db: Session, *, email: str, password: str) -> Usuario | None:
    """Autenticar usuario con email y contraseña"""
    try:
        usuario = get_usuario_by_email(db=db, email=email)
        if not usuario:
            return None
        # Manejar posibles errores de encoding en la contraseña hasheada
        try:
            if not verify_password(password, usuario.hashed_password):
                return None
        except (UnicodeDecodeError, UnicodeEncodeError) as e:
            print(f"Error de encoding en contraseña para usuario {email}: {e}")
            return None
        return usuario
    except (UnicodeDecodeError, UnicodeEncodeError) as e:
        print(f"Error de encoding al buscar usuario {email}: {e}")
        return None
    except Exception as e:
        print(f"Error inesperado en authenticate_usuario: {e}")
        return None


def delete_usuario(db: Session, *, usuario_id: int) -> Usuario | None:
    """Eliminar un usuario (soft delete - marcar como inactivo)"""
    db_usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if db_usuario:
        db_usuario.is_active = False
        db.add(db_usuario)
        db.commit()
        db.refresh(db_usuario)
    return db_usuario
