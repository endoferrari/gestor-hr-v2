from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..db.database import Base


class Hospedaje(Base):
    __tablename__ = "hospedajes"

    id = Column(Integer, primary_key=True, index=True)
    habitacion_id = Column(Integer, ForeignKey("habitaciones.id"), nullable=False)
    huesped_id = Column(Integer, ForeignKey("huespedes.id"), nullable=False)
    fecha_entrada = Column(DateTime, default=datetime.utcnow, nullable=False)
    fecha_salida = Column(DateTime, nullable=True)

    # Relaciones
    habitacion = relationship("Habitacion", back_populates="hospedajes")
    huesped = relationship("Huesped", back_populates="hospedajes")
