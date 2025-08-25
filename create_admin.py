#!/usr/bin/env python3
"""
Script para crear un usuario administrador de prueba
"""

from app.core.config import get_settings
from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.usuario import Usuario

settings = get_settings()


def create_admin_user():
    """Crear un usuario administrador de prueba"""
    db = SessionLocal()

    try:
        # Verificar si el usuario admin ya existe
        existing_user = (
            db.query(Usuario).filter(Usuario.email == "admin@test.com").first()
        )
        if existing_user:
            print("Usuario admin ya existe:", existing_user.email)
            return existing_user

        # Crear usuario admin
        hashed_password = get_password_hash("admin123")
        admin_user = Usuario(
            nombre_completo="Administrador Test",
            email="admin@test.com",
            telefono="+1234567890",
            puesto="Administrador",
            departamento="IT",
            hashed_password=hashed_password,
            is_active=True,
            is_superuser=True,
        )

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        print("Usuario admin creado exitosamente:")
        print(f"  Email: {admin_user.email}")
        print(f"  ID: {admin_user.id}")
        print(f"  Activo: {admin_user.is_active}")

        return admin_user

    except Exception as e:
        print(f"Error creando usuario admin: {e}")
        db.rollback()
        return None
    finally:
        db.close()


if __name__ == "__main__":
    create_admin_user()
