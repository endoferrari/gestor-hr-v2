# /app/api/endpoints/habitaciones.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...db.database import get_db
from ...services.habitacion import habitacion_service
from ... import schemas

router = APIRouter()


@router.get("/habitaciones/", response_model=List[schemas.Habitacion])
def get_habitaciones(db: Session = Depends(get_db)):
    """
    Obtener todas las habitaciones.
    """
    # Para obtener todas, podríamos crear un método get_multi en el servicio base
    # Por ahora usamos una consulta directa
    from ...models.habitacion import Habitacion

    habitaciones = db.query(Habitacion).all()
    return habitaciones


@router.get("/habitaciones/{habitacion_id}", response_model=schemas.Habitacion)
def get_habitacion(habitacion_id: int, db: Session = Depends(get_db)):
    """
    Obtener una habitación específica por ID.
    """
    habitacion = habitacion_service.get(db=db, id=habitacion_id)
    if not habitacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Habitación no encontrada"
        )
    return habitacion


@router.post(
    "/habitaciones/",
    response_model=schemas.Habitacion,
    status_code=status.HTTP_201_CREATED,
)
def create_habitacion(
    habitacion: schemas.HabitacionCreate, db: Session = Depends(get_db)
):
    """
    Crear una nueva habitación.
    """
    # Verificar que no existe una habitación con el mismo número
    from ...models.habitacion import Habitacion

    existing_habitacion = (
        db.query(Habitacion).filter(Habitacion.numero == habitacion.numero).first()
    )
    if existing_habitacion:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe una habitación con el número {habitacion.numero}",
        )

    return habitacion_service.create(db=db, obj_in=habitacion)


@router.put("/habitaciones/{habitacion_id}", response_model=schemas.Habitacion)
def update_habitacion(
    habitacion_id: int,
    habitacion_update: schemas.HabitacionCreate,
    db: Session = Depends(get_db),
):
    """
    Actualizar una habitación existente.
    """
    # Verificar que existe la habitación
    existing_habitacion = habitacion_service.get(db=db, id=habitacion_id)
    if not existing_habitacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Habitación no encontrada"
        )

    # Verificar que el número no esté en uso por otra habitación
    from ...models.habitacion import Habitacion

    habitacion_con_numero = (
        db.query(Habitacion)
        .filter(
            Habitacion.numero == habitacion_update.numero,
            Habitacion.id != habitacion_id,
        )
        .first()
    )
    if habitacion_con_numero:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe otra habitación con el número {habitacion_update.numero}",
        )

    # Actualizar los campos
    for field, value in habitacion_update.model_dump().items():
        setattr(existing_habitacion, field, value)

    db.commit()
    db.refresh(existing_habitacion)
    return existing_habitacion


@router.delete("/habitaciones/{habitacion_id}")
def delete_habitacion(habitacion_id: int, db: Session = Depends(get_db)):
    """
    Eliminar una habitación.
    """
    habitacion = habitacion_service.get(db=db, id=habitacion_id)
    if not habitacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Habitación no encontrada"
        )

    db.delete(habitacion)
    db.commit()

    return {"message": f"Habitación {habitacion.numero} eliminada correctamente"}
