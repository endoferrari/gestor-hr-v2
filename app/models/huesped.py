from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from ..db.database import Base


class Huesped(Base):
    __tablename__ = "huespedes"

    id = Column(Integer, primary_key=True, index=True)
    nombre_completo = Column(String, nullable=False)
    telefono = Column(String, nullable=True)
    email = Column(String, nullable=True)

    # Relación con hospedajes
    hospedajes = relationship("Hospedaje", back_populates="huesped")
