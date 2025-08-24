from .base import CRUDBase
from ..models.huesped import Huesped
from ..schemas.huesped import HuespedCreate


class HuespedService(CRUDBase[Huesped, HuespedCreate]):
    """Servicio CRUD para el modelo Huesped."""

    pass


huesped_service = HuespedService(Huesped)
