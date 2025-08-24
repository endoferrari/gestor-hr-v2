#!/usr/bin/env python3
"""
Script para crear un usuario de prueba.
"""

from app.database import SessionLocal
from app.services.user import user_service
from app.schemas.user import UserCreate


def create_test_user():
    """Crea un usuario de prueba."""
    print("🚀 Creando usuario de prueba para SKYNET 2.0")
    print("=" * 50)

    # Crear sesión de base de datos
    db = SessionLocal()

    try:
        # Verificar si ya existe el usuario admin
        existing_user = user_service.get_by_username(db, username="admin")

        if existing_user:
            print("✅ Usuario 'admin' ya existe")
            print(f"   Nombre: {existing_user.full_name}")
            print(f"   ID: {existing_user.id}")
        else:
            # Crear usuario de prueba
            test_user = UserCreate(
                username="admin", password="123456", full_name="Administrador Sistema"
            )

            created_user = user_service.create(db, obj_in=test_user)
            print("✅ Usuario creado exitosamente!")
            print(f"   Usuario: {created_user.username}")
            print(f"   Nombre: {created_user.full_name}")
            print(f"   ID: {created_user.id}")

        # Crear otro usuario de prueba
        existing_user2 = user_service.get_by_username(db, username="usuario1")

        if not existing_user2:
            test_user2 = UserCreate(
                username="usuario1",
                password="password123",
                full_name="Usuario de Prueba",
            )

            created_user2 = user_service.create(db, obj_in=test_user2)
            print("✅ Usuario adicional creado!")
            print(f"   Usuario: {created_user2.username}")
            print(f"   Nombre: {created_user2.full_name}")

        print("\n🔐 Credenciales disponibles:")
        print("━" * 30)
        print("Usuario: admin")
        print("Contraseña: 123456")
        print("")
        print("Usuario: usuario1")
        print("Contraseña: password123")
        print("\n🌐 Ve a http://localhost:3000 e inicia sesión")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    create_test_user()
