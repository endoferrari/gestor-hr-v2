#!/usr/bin/env python3
"""
Script para verificar usuarios existentes en la base de datos SQLite.
"""

import sqlite3
from pathlib import Path


def check_users():
    """Verifica y muestra todos los usuarios en la base de datos."""
    print("🚀 Verificando usuarios en SKYNET 2.0")
    print("=" * 50)

    # Buscar la base de datos
    db_path = Path("gestor_hr.db")
    if not db_path.exists():
        print("❌ Base de datos no encontrada!")
        print("💡 Ejecuta: python init_db.py")
        return

    try:
        # Conectar a la base de datos
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        # Verificar si existe la tabla users
        cursor.execute("""
            SELECT name FROM sqlite_master
            WHERE type='table' AND name='users';
        """)

        if not cursor.fetchone():
            print("❌ Tabla 'users' no encontrada!")
            print("💡 Ejecuta: python init_db.py")
            return

        # Obtener todos los usuarios
        cursor.execute("SELECT id, username, full_name FROM users")
        users = cursor.fetchall()

        if not users:
            print("📝 No hay usuarios registrados")
            print("\n🔧 Creando usuario de prueba...")

            # Crear usuario de prueba
            from app.services.user import user_service
            from app.schemas.user import UserCreate
            from app.database import get_db

            db = next(get_db())
            test_user = UserCreate(
                username="admin", password="123456", full_name="Administrador"
            )

            created_user = user_service.create(db, obj_in=test_user)
            print(f"✅ Usuario creado: {created_user.username}")

        else:
            print(f"👥 Usuarios encontrados: {len(users)}")
            print("\n📋 Lista de usuarios:")
            for user_id, username, full_name in users:
                print(f"  - ID: {user_id}")
                print(f"    Usuario: {username}")
                print(f"    Nombre: {full_name}")
                print("")

        conn.close()

        print("\n🔐 Credenciales para login:")
        print("Usuario: admin")
        print("Contraseña: 123456")
        print("\n💡 Si no funciona, crea un usuario nuevo desde el registro")

    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    check_users()
