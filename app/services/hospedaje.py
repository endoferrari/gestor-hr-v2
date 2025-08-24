from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from .base import CRUDBase
from ..models.hospedaje import Hospedaje
from ..models.habitacion import EstadoHabitacion
from ..schemas.hospedaje import HospedajeCreate
from .huesped import huesped_service
from .habitacion import habitacion_service


class HospedajeService(CRUDBase[Hospedaje, HospedajeCreate]):
    def check_in(self, db: Session, *, obj_in: HospedajeCreate) -> Hospedaje:
        """
        Realiza la operación de Check-In completa.
        """
        # 1. Obtener la habitación y verificar su estado
        habitacion = habitacion_service.get(db, id=obj_in.habitacion_id)
        if not habitacion:
            raise HTTPException(status_code=404, detail="La habitación no existe.")

        if habitacion.estado != EstadoHabitacion.DISPONIBLE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"La habitación {habitacion.numero} no está disponible.",
            )

        # 2. Crear el nuevo huésped
        nuevo_huesped = huesped_service.create(db, obj_in=obj_in.huesped)

        # 3. Crear el registro de hospedaje
        db_hospedaje = Hospedaje(
            habitacion_id=obj_in.habitacion_id, huesped_id=nuevo_huesped.id
        )
        db.add(db_hospedaje)

        # 4. Actualizar el estado de la habitación
        habitacion.estado = EstadoHabitacion.OCUPADA
        db.add(habitacion)

        # 5. Guardar todos los cambios en la base de datos a la vez
        db.commit()
        db.refresh(db_hospedaje)

        return db_hospedaje


hospedaje_service = HospedajeService(Hospedaje)
