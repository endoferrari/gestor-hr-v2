"""
API endpoints para la entidad Hospedaje
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.crud import (
    create_hospedaje,
    delete_hospedaje,
    get_hospedaje,
    get_hospedajes,
    get_hospedajes_by_estado,
    get_hospedajes_by_habitacion,
    update_hospedaje,
)
from app.models.hospedaje import Hospedaje
from app.schemas.hospedaje import (
    Hospedaje as HospedajeSchema,
    HospedajeCreate,
    HospedajeUpdate,
)

router = APIRouter()

# Constante para evitar duplicación de strings
HOSPEDAJE_NOT_FOUND = "Hospedaje no encontrado"


@router.get("/", response_model=list[HospedajeSchema])
def read_hospedajes(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> list[Hospedaje]:
    """
    Obtener lista de hospedajes con paginación
    """
    hospedajes = get_hospedajes(db, skip=skip, limit=limit)
    return hospedajes


@router.post("/", response_model=HospedajeSchema, status_code=status.HTTP_201_CREATED)
def create_hospedaje_endpoint(
    *,
    db: Session = Depends(deps.get_db),
    hospedaje_in: HospedajeCreate,
) -> Hospedaje:
    """
    Crear nuevo hospedaje
    """
    hospedaje = create_hospedaje(db=db, hospedaje_in=hospedaje_in)
    return hospedaje


@router.get("/{hospedaje_id}", response_model=HospedajeSchema)
def read_hospedaje(
    *,
    db: Session = Depends(deps.get_db),
    hospedaje_id: int,
) -> Hospedaje:
    """
    Obtener un hospedaje específico por su ID
    """
    hospedaje = get_hospedaje(db=db, hospedaje_id=hospedaje_id)
    if not hospedaje:
        raise HTTPException(status_code=404, detail=HOSPEDAJE_NOT_FOUND)
    return hospedaje


@router.put("/{hospedaje_id}", response_model=HospedajeSchema)
def update_hospedaje_endpoint(
    *,
    db: Session = Depends(deps.get_db),
    hospedaje_id: int,
    hospedaje_in: HospedajeUpdate,
) -> Hospedaje:
    """
    Actualizar un hospedaje existente
    """
    hospedaje = get_hospedaje(db=db, hospedaje_id=hospedaje_id)
    if not hospedaje:
        raise HTTPException(status_code=404, detail=HOSPEDAJE_NOT_FOUND)

    hospedaje = update_hospedaje(
        db=db, db_hospedaje=hospedaje, hospedaje_in=hospedaje_in
    )
    return hospedaje


@router.delete("/{hospedaje_id}")
def delete_hospedaje_endpoint(
    *,
    db: Session = Depends(deps.get_db),
    hospedaje_id: int,
) -> dict[str, str]:
    """
    Eliminar un hospedaje
    """
    hospedaje = get_hospedaje(db=db, hospedaje_id=hospedaje_id)
    if not hospedaje:
        raise HTTPException(status_code=404, detail=HOSPEDAJE_NOT_FOUND)

    delete_hospedaje(db=db, hospedaje_id=hospedaje_id)
    return {"message": "Hospedaje eliminado exitosamente"}


@router.get("/habitacion/{numero_habitacion}", response_model=list[HospedajeSchema])
def read_hospedajes_by_habitacion(
    *,
    db: Session = Depends(deps.get_db),
    numero_habitacion: str,
) -> list[Hospedaje]:
    """
    Obtener hospedajes por número de habitación
    """
    hospedajes = get_hospedajes_by_habitacion(
        db=db, numero_habitacion=numero_habitacion
    )
    return hospedajes


@router.get("/estado/{estado}", response_model=list[HospedajeSchema])
def read_hospedajes_by_estado(
    *,
    db: Session = Depends(deps.get_db),
    estado: str,
) -> list[Hospedaje]:
    """
    Obtener hospedajes por estado específico
    """
    hospedajes = get_hospedajes_by_estado(db=db, estado=estado)
    return hospedajes
