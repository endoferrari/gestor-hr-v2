# /app/services/base.py
from typing import Any, Generic, Type, TypeVar
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..db.database import Base

# Estos son tipos genéricos que nos ayudarán a que el código sea flexible
ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)


class CRUDBase(Generic[ModelType, CreateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        """
        Clase CRUD base con métodos para Crear, Leer, Actualizar, Borrar.
        :param model: Un modelo de SQLAlchemy
        """
        self.model = model

    def get(self, db: Session, id: Any) -> ModelType | None:
        return db.query(self.model).filter(self.model.id == id).first()

    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        # Convertimos el schema de Pydantic a un diccionario
        obj_in_data = obj_in.model_dump()
        # Creamos una instancia del modelo SQLAlchemy con los datos
        db_obj = self.model(**obj_in_data)

        # Aquí está la lógica que queríamos reutilizar
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)

        return db_obj
