#!/usr/bin/env python3
"""
Script para probar la conexión a PostgreSQL
"""

import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()


def test_connection():
    """Probar la conexión a PostgreSQL"""
    try:
        # Obtener la URL de la base de datos
        database_url = os.getenv("DATABASE_URL")
        print(f"Intentando conectar a: {database_url}")

        # Crear el motor
        engine = create_engine(database_url)

        # Probar la conexión
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version();"))
            version = result.fetchone()
            print("✅ Conexión exitosa!")
            print(f"Versión de PostgreSQL: {version[0]}")

            # Probar que podemos ver las tablas
            result = connection.execute(text("SELECT current_database();"))
            db_name = result.fetchone()
            print(f"Base de datos actual: {db_name[0]}")

        return True

    except Exception as e:
        print(f"❌ Error al conectar a PostgreSQL: {e}")
        print("\nPosibles soluciones:")
        print("1. Verificar que PostgreSQL está corriendo")
        print("2. Verificar que la contraseña en .env es correcta")
        print("3. Verificar que la base de datos 'gestor_hr_db' existe")
        return False


if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
