"""
Operaciones CRUD para el modelo Hospedaje
"""

from typing import Optional

from sqlalchemy.orm import Session

from app.models.hospedaje import Hospedaje
from app.schemas.hospedaje import HospedajeCreate, HospedajeUpdate


def get_hospedaje(db: Session, hospedaje_id: int) -> Hospedaje | None:
    """Obtener un hospedaje por ID"""
    return db.query(Hospedaje).filter(Hospedaje.id == hospedaje_id).first()


def get_hospedajes(db: Session, skip: int = 0, limit: int = 100) -> list[Hospedaje]:
    """Obtener lista de hospedajes con paginación"""
    return db.query(Hospedaje).offset(skip).limit(limit).all()


def get_hospedajes_by_habitacion(
    db: Session, numero_habitacion: str
) -> list[Hospedaje]:
    """Obtener hospedajes por número de habitación"""
    return (
        db.query(Hospedaje)
        .filter(Hospedaje.numero_habitacion == numero_habitacion)
        .all()
    )


def get_hospedajes_by_estado(db: Session, estado: str) -> list[Hospedaje]:
    """Obtener hospedajes por estado"""
    return db.query(Hospedaje).filter(Hospedaje.estado == estado).all()


def create_hospedaje(db: Session, *, hospedaje_in: HospedajeCreate) -> Hospedaje:
    """Crear un nuevo hospedaje"""
    db_hospedaje = Hospedaje(
        nombre_huesped=hospedaje_in.nombre_huesped,
        email_huesped=hospedaje_in.email_huesped,
        telefono_huesped=hospedaje_in.telefono_huesped,
        documento_identidad=hospedaje_in.documento_identidad,
        numero_habitacion=hospedaje_in.numero_habitacion,
        tipo_habitacion=hospedaje_in.tipo_habitacion,
        fecha_check_in=hospedaje_in.fecha_check_in,
        fecha_check_out=hospedaje_in.fecha_check_out,
        precio_por_noche=hospedaje_in.precio_por_noche,
        numero_noches=hospedaje_in.numero_noches,
        total_hospedaje=hospedaje_in.total_hospedaje,
        estado=hospedaje_in.estado,
        observaciones=hospedaje_in.observaciones,
    )
    db.add(db_hospedaje)
    db.commit()
    db.refresh(db_hospedaje)
    return db_hospedaje


def update_hospedaje(
    db: Session, *, db_hospedaje: Hospedaje, hospedaje_in: HospedajeUpdate
) -> Hospedaje:
    """Actualizar un hospedaje existente"""
    update_data = hospedaje_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_hospedaje, field, value)

    db.add(db_hospedaje)
    db.commit()
    db.refresh(db_hospedaje)
    return db_hospedaje


def delete_hospedaje(db: Session, *, hospedaje_id: int) -> Hospedaje | None:
    """Eliminar un hospedaje"""
    db_hospedaje = db.query(Hospedaje).filter(Hospedaje.id == hospedaje_id).first()
    if db_hospedaje:
        db.delete(db_hospedaje)
        db.commit()
    return db_hospedaje
