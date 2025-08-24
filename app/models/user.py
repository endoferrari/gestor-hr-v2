# /app/models/user.py
from sqlalchemy import Column, Integer, String

from ..db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)  # Mantenemos el nombre completo
    username = Column(String, unique=True, index=True, nullable=False)  # CAMBIO CLAVE
    hashed_password = Column(String, nullable=False)
