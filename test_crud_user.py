#!/usr/bin/env python3
"""
Script para probar la creación de usuarios con PostgreSQL
"""

from pathlib import Path
import sys

# Agregar el directorio raíz al Python path
root_dir = Path(__file__).parent
sys.path.append(str(root_dir))

# Imports después de configurar el path
from app.db.database import SessionLocal  # noqa: E402
from app.schemas.user import UserCreate  # noqa: E402
from app.services.user import user_service  # noqa: E402


def test_user_creation():
    """Probar la creación de un usuario usando el nuevo servicio CRUD"""
    db = SessionLocal()

    try:
        # Datos del usuario de prueba
        user_data = UserCreate(email="test@example.com", password="testpassword123")

        print(f"Creando usuario: {user_data.email}")

        # Verificar si el usuario ya existe
        existing_user = user_service.get_by_email(db, email=user_data.email)
        if existing_user:
            print(f"⚠️ El usuario {user_data.email} ya existe")
            print(f"ID: {existing_user.id}")
            return existing_user

        # Crear el usuario usando el nuevo servicio CRUD
        new_user = user_service.create(db, obj_in=user_data)

        print("✅ Usuario creado exitosamente!")
        print(f"ID: {new_user.id}")
        print(f"Email: {new_user.email}")
        print(f"Contraseña hasheada: {new_user.hashed_password[:20]}...")

        return new_user

    except Exception as e:
        print(f"❌ Error al crear el usuario: {e}")
        return None
    finally:
        db.close()


def test_user_retrieval():
    """Probar la búsqueda de un usuario por ID"""
    db = SessionLocal()

    try:
        # Obtener el usuario por email primero
        user = user_service.get_by_email(db, email="test@example.com")
        if not user:
            print("❌ Usuario no encontrado por email")
            return None

        # Ahora buscar por ID usando el método base
        user_by_id = user_service.get(db, id=user.id)

        if user_by_id:
            print("✅ Usuario encontrado por ID!")
            print(f"ID: {user_by_id.id}")
            print(f"Email: {user_by_id.email}")
            return user_by_id
        else:
            print("❌ Usuario no encontrado por ID")
            return None

    except Exception as e:
        print(f"❌ Error al buscar el usuario: {e}")
        return None
    finally:
        db.close()


if __name__ == "__main__":
    print("=== Probando la clase CRUD User con PostgreSQL ===\n")

    print("1. Probando creación de usuario:")
    user = test_user_creation()

    if user:
        print("\n2. Probando búsqueda por ID:")
        test_user_retrieval()

    print("\n=== Pruebas completadas ===")
