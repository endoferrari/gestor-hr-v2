# /app/services/habitacion.py
from .base import CRUDBase
from ..models.habitacion import Habitacion
from ..schemas.habitacion import HabitacionCreate


class HabitacionService(CRUDBase[Habitacion, HabitacionCreate]):
    """
    Servicio CRUD para el modelo de Habitacion.
    Hereda toda la funcionalidad básica de CRUDBase.
    Aquí se pueden añadir métodos específicos para la lógica de negocio
    de las habitaciones en el futuro.
    """

    pass


# Creamos una instancia única del servicio para ser usada en toda la aplicación
habitacion_service = HabitacionService(Habitacion)
