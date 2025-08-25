"""
Endpoints para gestión de habitaciones
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.crud.crud_habitacion import (
    create_habitacion,
    delete_habitacion,
    get_habitacion_by_numero,
    get_habitaciones,
    update_habitacion,
)
from app.models import Habitacion
from app.schemas import habitacion as habitacion_schema

HABITACION_NOT_FOUND = "Habitación no encontrada"

router = APIRouter()


@router.get("/", response_model=list[habitacion_schema.HabitacionRead])
def read_habitaciones(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> list[Habitacion]:
    """
    Obtener todas las habitaciones
    """
    habitaciones = get_habitaciones(db, skip=skip, limit=limit)
    return habitaciones


@router.post("/", response_model=habitacion_schema.HabitacionRead)
def create_habitacion_endpoint(
    *,
    db: Session = Depends(deps.get_db),
    habitacion_in: habitacion_schema.HabitacionCreate,
) -> Any:
    """
    Crear nueva habitación
    """
    # Verificar si ya existe una habitación con ese número
    habitacion_existente = get_habitacion_by_numero(db, numero=habitacion_in.numero)
    if habitacion_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe una habitación con el número {habitacion_in.numero}",
        )

    habitacion = create_habitacion(db=db, habitacion_in=habitacion_in)
    return habitacion


@router.put("/{numero}", response_model=habitacion_schema.HabitacionRead)
def update_habitacion_endpoint(
    *,
    db: Session = Depends(deps.get_db),
    numero: str,
    habitacion_in: habitacion_schema.HabitacionUpdate,
) -> Any:
    """
    Actualizar habitación por número
    """
    habitacion = get_habitacion_by_numero(db, numero=numero)
    if not habitacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=HABITACION_NOT_FOUND
        )

    habitacion = update_habitacion(
        db=db, db_habitacion=habitacion, habitacion_in=habitacion_in
    )
    return habitacion


@router.get("/{numero}", response_model=habitacion_schema.HabitacionRead)
def read_habitacion(
    *,
    db: Session = Depends(deps.get_db),
    numero: str,
) -> Any:
    """
    Obtener habitación por número
    """
    habitacion = get_habitacion_by_numero(db, numero=numero)
    if not habitacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=HABITACION_NOT_FOUND
        )
    return habitacion


@router.delete("/{numero}")
def delete_habitacion_endpoint(
    *,
    db: Session = Depends(deps.get_db),
    numero: str,
) -> Any:
    """
    Eliminar habitación
    """
    habitacion = get_habitacion_by_numero(db, numero=numero)
    if not habitacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=HABITACION_NOT_FOUND
        )

    delete_habitacion(db=db, habitacion_id=habitacion.id)
    return {"ok": True}


@router.put("/{numero}/estado", response_model=habitacion_schema.HabitacionRead)
def update_habitacion_estado(
    *,
    db: Session = Depends(deps.get_db),
    numero: str,
    estado_data: habitacion_schema.HabitacionEstadoUpdate,
) -> Any:
    """
    Actualizar solo el estado de una habitación
    """
    habitacion = get_habitacion_by_numero(db, numero=numero)
    if not habitacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=HABITACION_NOT_FOUND
        )

    habitacion_update = habitacion_schema.HabitacionUpdate(estado=estado_data.estado)
    habitacion = update_habitacion(
        db=db, db_habitacion=habitacion, habitacion_in=habitacion_update
    )
    return habitacion
