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


def create_admin_user():
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Verificar si ya existe el usuario admin
        existing_admin = session.query(User).filter(User.username == "admin").first()
        if existing_admin:
            print("❌ Usuario 'admin' ya existe")
            print(f"   ID: {existing_admin.id}")
            print(f"   Nombre completo: {existing_admin.full_name}")
            print(f"   Usuario: {existing_admin.username}")
            return

        # Crear usuario admin
        hashed_password = pwd_context.hash("admin123")
        admin_user = User(
            full_name="Administrador", username="admin", hashed_password=hashed_password
        )

        session.add(admin_user)
        session.commit()
        session.refresh(admin_user)

        print("✅ Usuario 'admin' creado exitosamente")
        print("   Usuario: admin")
        print("   Contraseña: admin123")
        print(f"   ID: {admin_user.id}")

    except Exception as e:
        session.rollback()
        print(f"❌ Error al crear usuario admin: {e}")
    finally:
        session.close()


if __name__ == "__main__":
    create_admin_user()
