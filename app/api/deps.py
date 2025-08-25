"""
Dependencias para los endpoints de la API
"""

from collections.abc import Generator

from sqlalchemy.orm import Session

from app.db.session import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """
    Generador de dependencia para obtener una sesión de base de datos.
    Utilizada por FastAPI para inyección de dependencias.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
