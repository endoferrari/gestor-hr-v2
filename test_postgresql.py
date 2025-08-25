#!/usr/bin/env python3
"""
Test de conexión PostgreSQL para Gestor HR v3
"""

import os
import sys

# Agregar el directorio actual al path
sys.path.insert(0, os.getcwd())

try:
    from sqlalchemy import create_engine, text

    from app.core.config import get_settings

    print("🔗 Probando conexión a PostgreSQL desde Python...")
    settings = get_settings()

    print(f"📊 DATABASE_URL: {settings.DATABASE_URL}")
    print(f"🏗️  PROJECT_NAME: {settings.PROJECT_NAME}")

    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT current_database(), current_user, version();")
            )
            row = result.fetchone()
            print("✅ Conexión exitosa!")
            print(f"🏛️  Base de datos: {row[0]}")
            print(f"👤 Usuario: {row[1]}")
            print(f"🔧 Versión: {row[2]}")
            print("")
            print("🎉 PostgreSQL está configurado correctamente!")
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        sys.exit(1)

except ImportError as e:
    print(f"❌ Error de importación: {e}")
    print("Asegúrate de estar en el directorio correcto del proyecto")
    sys.exit(1)
