#!/usr/bin/env python3
"""
Script para verificar los datos en PostgreSQL
"""

from pathlib import Path
import sys

# Agregar el directorio raíz al Python path
root_dir = Path(__file__).parent
sys.path.append(str(root_dir))

# Imports después de configurar el path
from app.db.database import SessionLocal  # noqa: E402
from app.models.user import User  # noqa: E402


def verify_database_data():
    """Verificar los datos en PostgreSQL"""
    db = SessionLocal()

    try:
        # Obtener todos los usuarios
        users = db.query(User).all()

        print("📊 Usuarios en la base de datos PostgreSQL:")
        print(f"Total de usuarios: {len(users)}\n")

        for user in users:
            print(f"ID: {user.id}")
            print(f"Username: {user.username}")
            print(f"Full Name: {user.full_name}")
            print(f"Contraseña hasheada: {user.hashed_password[:30]}...")
            print("─" * 50)

        return users

    except Exception as e:
        print(f"❌ Error al consultar la base de datos: {e}")
        return []
    finally:
        db.close()


if __name__ == "__main__":
    print("=== Verificando datos en PostgreSQL ===\n")
    users = verify_database_data()
    print(f"\n✅ Verificación completada. Se encontraron {len(users)} usuarios.")
