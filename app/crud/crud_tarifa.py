"""
Operaciones CRUD para el modelo Tarifa
"""

from typing import Optional

from sqlalchemy.orm import Session

from app.models.tarifa import Tarifa
from app.schemas.tarifa import TarifaCreate, TarifaUpdate


def get_tarifa(db: Session, tarifa_id: int) -> Tarifa | None:
    """Obtener una tarifa por ID"""
    return db.query(Tarifa).filter(Tarifa.id == tarifa_id).first()


def get_tarifas(db: Session, skip: int = 0, limit: int = 100) -> list[Tarifa]:
    """Obtener lista de tarifas con paginación"""
    return db.query(Tarifa).offset(skip).limit(limit).all()


def get_tarifas_activas(db: Session) -> list[Tarifa]:
    """Obtener solo tarifas activas"""
    return db.query(Tarifa).filter(Tarifa.activa.is_(True)).all()


def get_tarifas_por_tipo_habitacion(db: Session, tipo_habitacion: str) -> list[Tarifa]:
    """Obtener tarifas por tipo de habitación"""
    return db.query(Tarifa).filter(Tarifa.tipo_habitacion == tipo_habitacion).all()


def create_tarifa(db: Session, *, tarifa_in: TarifaCreate) -> Tarifa:
    """Crear una nueva tarifa"""
    db_tarifa = Tarifa(
        nombre=tarifa_in.nombre,
        tipo_habitacion=tarifa_in.tipo_habitacion,
        precio=tarifa_in.precio,
        fecha_inicio=tarifa_in.fecha_inicio,
        fecha_fin=tarifa_in.fecha_fin,
        dias_semana=tarifa_in.dias_semana,
        activa=tarifa_in.activa,
        descripcion=tarifa_in.descripcion,
        prioridad=tarifa_in.prioridad,
    )
    db.add(db_tarifa)
    db.commit()
    db.refresh(db_tarifa)
    return db_tarifa


def update_tarifa(db: Session, *, db_tarifa: Tarifa, tarifa_in: TarifaUpdate) -> Tarifa:
    """Actualizar una tarifa existente"""
    update_data = tarifa_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_tarifa, field, value)

    db.add(db_tarifa)
    db.commit()
    db.refresh(db_tarifa)
    return db_tarifa


def delete_tarifa(db: Session, *, tarifa_id: int) -> Tarifa:
    """Eliminar una tarifa"""
    tarifa = db.query(Tarifa).filter(Tarifa.id == tarifa_id).first()
    db.delete(tarifa)
    db.commit()
    return tarifa
