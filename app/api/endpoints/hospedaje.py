from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ... import schemas, models
from ...core.deps import get_current_active_user
from ...db.database import get_db
from ...services.hospedaje import hospedaje_service

router = APIRouter()


@router.post("/check-in/", response_model=schemas.Hospedaje)
def check_in_endpoint(
    *,
    db: Session = Depends(get_db),
    hospedaje_in: schemas.HospedajeCreate,
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Endpoint para realizar un Check-In.

    Recibe los datos del huésped y el ID de la habitación, y si es válido,
    crea el hospedaje y actualiza el estado de la habitación.

    Este es un endpoint protegido y requiere autenticación.
    """
    return hospedaje_service.check_in(db=db, obj_in=hospedaje_in)


@router.post("/check-out/{habitacion_id}/", response_model=schemas.Hospedaje)
def check_out_endpoint(
    *,
    db: Session = Depends(get_db),
    habitacion_id: int,
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Endpoint para realizar un Check-Out de una habitación.

    Este es un endpoint protegido y requiere autenticación.
    """
    return hospedaje_service.check_out(db=db, habitacion_id=habitacion_id)
