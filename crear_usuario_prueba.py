"""
Script para crear usuario de prueba para tests E2E
"""

import sys
from pathlib import Path

from app.core.security import get_password_hash  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402
from app.models.usuario import Usuario  # noqa: E402

# Agregar directorio raíz al path
project_root = str(Path(__file__).parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)


def crear_usuario_prueba():
    """Crear usuario de prueba para tests E2E"""

    db = SessionLocal()

    try:
        # Verificar si ya existe
        usuario_existente = (
            db.query(Usuario).filter(Usuario.email == "cajero1@test.com").first()
        )

        if usuario_existente:
            print("Usuario de prueba 'cajero1' ya existe.")
            return

        # Crear usuario de prueba
        usuario_prueba = Usuario(
            nombre_completo="Cajero de Prueba E2E",
            email="cajero1@test.com",
            telefono="123456789",
            hashed_password=get_password_hash("password123"),
            is_active=True,
            is_superuser=False,
            puesto="cajero",
            departamento="recepcion",
        )

        db.add(usuario_prueba)
        db.commit()

        print("✅ Usuario de prueba 'cajero1' creado exitosamente")
        print("   Email: cajero1@test.com")
        print("   Password: password123")

    except Exception as e:
        print(f"❌ Error creando usuario de prueba: {e}")
        db.rollback()

    finally:
        db.close()


if __name__ == "__main__":
    crear_usuario_prueba()
