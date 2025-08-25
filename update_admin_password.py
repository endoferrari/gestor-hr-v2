#!/usr/bin/env python3

import sys
import os

sys.path.insert(0, os.path.abspath("."))

from sqlalchemy.orm import sessionmaker
from app.db.database import engine
from passlib.context import CryptContext
from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

# Crear una clase User simple solo para este script
Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)


# Configurar cifrado de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def update_admin_password():
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Buscar el usuario admin
        admin_user = session.query(User).filter(User.username == "admin").first()
        if not admin_user:
            print("❌ Usuario 'admin' no encontrado")
            return

        print("✅ Usuario 'admin' encontrado")
        print(f"   ID: {admin_user.id}")
        print(f"   Nombre completo: {admin_user.full_name}")
        print(f"   Usuario: {admin_user.username}")

        # Actualizar contraseña
        new_hashed_password = pwd_context.hash("admin123")
        admin_user.hashed_password = new_hashed_password

        session.commit()

        print("✅ Contraseña actualizada exitosamente")
        print("   Nueva contraseña: admin123")

        # Verificar que la contraseña funciona
        if pwd_context.verify("admin123", admin_user.hashed_password):
            print("✅ Verificación de contraseña exitosa")
        else:
            print("❌ Error en verificación de contraseña")

    except Exception as e:
        session.rollback()
        print(f"❌ Error al actualizar contraseña: {e}")
    finally:
        session.close()


if __name__ == "__main__":
    update_admin_password()
