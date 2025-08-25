"""
Endpoints para gestión de tarifas
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.crud.crud_tarifa import (
    create_tarifa,
    delete_tarifa,
    get_tarifa,
    get_tarifas,
    get_tarifas_activas,
    get_tarifas_por_tipo_habitacion,
    update_tarifa,
)
from app.models import Tarifa
from app.schemas import tarifa as tarifa_schema

TARIFA_NOT_FOUND = "Tarifa no encontrada"

router = APIRouter()


@router.get("/", response_model=list[tarifa_schema.TarifaRead])
def read_tarifas(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    activas_solo: bool = False,
) -> list[Tarifa]:
    """
    Obtener tarifas
    """
    if activas_solo:
        tarifas = get_tarifas_activas(db)
    else:
        tarifas = get_tarifas(db, skip=skip, limit=limit)
    return tarifas


@router.post("/", response_model=tarifa_schema.TarifaRead)
def create_tarifa_endpoint(
    *,
    db: Session = Depends(deps.get_db),
    tarifa_in: tarifa_schema.TarifaCreate,
) -> Any:
    """
    Crear nueva tarifa
    """
    tarifa = create_tarifa(db=db, tarifa_in=tarifa_in)
    return tarifa


@router.put("/{tarifa_id}", response_model=tarifa_schema.TarifaRead)
def update_tarifa_endpoint(
    *,
    db: Session = Depends(deps.get_db),
    tarifa_id: int,
    tarifa_in: tarifa_schema.TarifaUpdate,
) -> Any:
    """
    Actualizar tarifa por ID
    """
    tarifa = get_tarifa(db, tarifa_id=tarifa_id)
    if not tarifa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=TARIFA_NOT_FOUND
        )

    tarifa = update_tarifa(db=db, db_tarifa=tarifa, tarifa_in=tarifa_in)
    return tarifa


@router.get("/{tarifa_id}", response_model=tarifa_schema.TarifaRead)
def read_tarifa(
    *,
    db: Session = Depends(deps.get_db),
    tarifa_id: int,
) -> Any:
    """
    Obtener tarifa por ID
    """
    tarifa = get_tarifa(db, tarifa_id=tarifa_id)
    if not tarifa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=TARIFA_NOT_FOUND
        )
    return tarifa


@router.delete("/{tarifa_id}")
def delete_tarifa_endpoint(
    *,
    db: Session = Depends(deps.get_db),
    tarifa_id: int,
) -> Any:
    """
    Eliminar tarifa
    """
    tarifa = get_tarifa(db, tarifa_id=tarifa_id)
    if not tarifa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=TARIFA_NOT_FOUND
        )

    delete_tarifa(db=db, tarifa_id=tarifa_id)
    return {"ok": True}


@router.get("/tipo/{tipo_habitacion}", response_model=list[tarifa_schema.TarifaRead])
def read_tarifas_por_tipo(
    *,
    db: Session = Depends(deps.get_db),
    tipo_habitacion: str,
) -> Any:
    """
    Obtener tarifas por tipo de habitación
    """
    tarifas = get_tarifas_por_tipo_habitacion(db, tipo_habitacion=tipo_habitacion)
    return tarifas
