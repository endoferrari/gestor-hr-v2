"""
Operaciones CRUD para el modelo Habitacion
"""

from typing import Optional

from sqlalchemy.orm import Session

from app.models.habitacion import Habitacion
from app.schemas.habitacion import HabitacionCreate, HabitacionUpdate


def get_habitacion(db: Session, habitacion_id: int) -> Habitacion | None:
    """Obtener una habitacion por ID"""
    return db.query(Habitacion).filter(Habitacion.id == habitacion_id).first()


def get_habitacion_by_numero(db: Session, numero: str) -> Habitacion | None:
    """Obtener una habitacion por numero"""
    return db.query(Habitacion).filter(Habitacion.numero == numero).first()


def get_habitaciones(db: Session, skip: int = 0, limit: int = 100) -> list[Habitacion]:
    """Obtener lista de habitaciones con paginación"""
    return db.query(Habitacion).offset(skip).limit(limit).all()


def get_habitaciones_disponibles(db: Session) -> list[Habitacion]:
    """Obtener solo habitaciones disponibles"""
    return db.query(Habitacion).filter(Habitacion.estado == "disponible").all()


def create_habitacion(db: Session, *, habitacion_in: HabitacionCreate) -> Habitacion:
    """Crear una nueva habitacion"""
    db_habitacion = Habitacion(
        numero=habitacion_in.numero,
        tipo=habitacion_in.tipo,
        precio_noche=habitacion_in.precio_noche,
        estado=habitacion_in.estado,
        descripcion=habitacion_in.descripcion,
        capacidad_personas=habitacion_in.capacidad_personas,
        tiene_bano_privado=habitacion_in.tiene_bano_privado,
        tiene_balcon=habitacion_in.tiene_balcon,
        tiene_vista_mar=habitacion_in.tiene_vista_mar,
        permite_mascotas=habitacion_in.permite_mascotas,
        wifi_incluido=habitacion_in.wifi_incluido,
        aire_acondicionado=habitacion_in.aire_acondicionado,
        television=habitacion_in.television,
        minibar=habitacion_in.minibar,
        caja_fuerte=habitacion_in.caja_fuerte,
        servicio_lavanderia=habitacion_in.servicio_lavanderia,
        observaciones=habitacion_in.observaciones,
    )
    db.add(db_habitacion)
    db.commit()
    db.refresh(db_habitacion)
    return db_habitacion


def update_habitacion(
    db: Session, *, db_habitacion: Habitacion, habitacion_in: HabitacionUpdate
) -> Habitacion:
    """Actualizar una habitacion existente"""
    update_data = habitacion_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_habitacion, field, value)

    db.add(db_habitacion)
    db.commit()
    db.refresh(db_habitacion)
    return db_habitacion


def delete_habitacion(db: Session, *, habitacion_id: int) -> Habitacion:
    """Eliminar una habitacion"""
    habitacion = db.query(Habitacion).filter(Habitacion.id == habitacion_id).first()
    db.delete(habitacion)
    db.commit()
    return habitacion


def cambiar_estado_habitacion(
    db: Session, *, habitacion_id: int, nuevo_estado: str
) -> Habitacion:
    """Cambiar el estado de una habitacion"""
    habitacion = db.query(Habitacion).filter(Habitacion.id == habitacion_id).first()
    if habitacion:
        habitacion.estado = nuevo_estado
        db.add(habitacion)
        db.commit()
        db.refresh(habitacion)
    return habitacion
