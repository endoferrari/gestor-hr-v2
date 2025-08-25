"""
Configuración de la sesión de base de datos con SQLAlchemy
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()

# Configuración del engine de SQLAlchemy
if settings.DATABASE_URL.startswith("sqlite"):
    # Configuración específica para SQLite con UTF-8
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        echo=settings.DEBUG,
        connect_args={
            "check_same_thread": False,
            # Garantizar UTF-8 en SQLite
            "timeout": 20,
        },
    )
    # Configurar SQLite para UTF-8
    from sqlalchemy import event

    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, _connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA encoding = 'UTF-8'")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

else:
    # Configuración para PostgreSQL con UTF-8
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        echo=settings.DEBUG,
        connect_args={"client_encoding": "utf8", "options": "-c timezone=utc"},
    )

# Configuración del session maker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Generador de dependencia para obtener una sesión de base de datos
    Utilizada por FastAPI para inyección de dependencias
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
