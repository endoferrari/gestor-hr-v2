#!/usr/bin/env python3
"""
Script para inicializar la base de datos
Crear las tablas necesarias
"""

from pathlib import Path
import sys

# Agregar el directorio raíz al Python path
root_dir = Path(__file__).parent
sys.path.append(str(root_dir))

# Imports después de configurar el path
from app.db.database import Base, engine  # noqa: E402


def init_db():
    """Inicializar la base de datos creando todas las tablas"""
    try:
        print("Creando tablas en la base de datos...")

        # Crear todas las tablas
        Base.metadata.create_all(bind=engine)

        print("✅ Tablas creadas exitosamente!")
        print("Las siguientes tablas fueron creadas:")

        # Mostrar las tablas creadas
        for table_name in Base.metadata.tables.keys():
            print(f"  - {table_name}")

        return True

    except Exception as e:
        print(f"❌ Error al crear las tablas: {e}")
        return False


if __name__ == "__main__":
    success = init_db()
    sys.exit(0 if success else 1)
