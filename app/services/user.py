# /app/services/user.py
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from .. import models, schemas
from .base import CRUDBase

# La configuración de hashing se queda igual
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService(CRUDBase[models.User, schemas.UserCreate]):
    def create(self, db: Session, *, obj_in: schemas.UserCreate) -> models.User:
        """
        Sobrescribe el método de creación para manejar el hash de la contraseña.
        """
        # Creamos un diccionario con los datos del usuario del schema
        create_data = obj_in.model_dump()
        # Sacamos la contraseña para hashearla
        password = create_data.pop("password")
        # Creamos el hash
        hashed_password = pwd_context.hash(password)

        # Creamos el objeto del modelo SQLAlchemy
        db_obj = self.model(**create_data, hashed_password=hashed_password)

        # Aquí reutilizamos la lógica de la clase base
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    # CAMBIO CLAVE: Renombramos la función y cambiamos el campo de búsqueda
    def get_by_username(self, db: Session, *, username: str) -> models.User | None:
        """
        Busca un usuario por su nombre de usuario.
        """
        return db.query(self.model).filter(self.model.username == username).first()


# Creamos una instancia del servicio para poder usarla en otras partes del código
user_service = UserService(models.User)
