#!/usr/bin/env python3
"""
Script para inicializar la base de datos PostgreSQL con las tablas del proyecto
"""

import os
import sys

# Agregar el directorio del proyecto al path
sys.path.insert(0, os.getcwd())


def init_database():
    """Inicializa las tablas de la base de datos"""
    try:
        print("🔄 Inicializando base de datos PostgreSQL...")

        from app.core.config import get_settings
        from app.db.base_class import Base
        from app.db.session import engine
        from app.models import (  # noqa: F401
            Habitacion,  # noqa: F401  # Needed for table creation
            Hospedaje,  # noqa: F401  # Needed for table creation
            LineaPedido,  # noqa: F401  # Needed for table creation
            Pedido,  # noqa: F401  # Needed for table creation
            Producto,  # noqa: F401  # Needed for table creation
            Tarifa,  # noqa: F401  # Needed for table creation
            Usuario,  # noqa: F401  # Needed for table creation
        )

        settings = get_settings()
        print(
            f"📊 Usando base de datos: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else 'Local'}"
        )

        # Crear todas las tablas
        print("📝 Creando tablas...")
        Base.metadata.create_all(bind=engine)

        print("✅ Tablas creadas exitosamente!")

        # Verificar conexión
        from sqlalchemy import text

        with engine.connect() as conn:
            result = conn.execute(text("SELECT current_database(), current_user;"))
            row = result.fetchone()
            print(f"🏛️  Base de datos activa: {row[0]}")
            print(f"👤 Usuario conectado: {row[1]}")

            # Listar las tablas creadas
            result = conn.execute(
                text("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_type = 'BASE TABLE'
                ORDER BY table_name;
            """)
            )
            tables = result.fetchall()

            if tables:
                print("\n📋 Tablas creadas:")
                for table in tables:
                    print(f"  • {table[0]}")
            else:
                print("⚠️  No se encontraron tablas en el schema público")

        print("\n🎉 Base de datos inicializada correctamente!")
        return True

    except ImportError as e:
        print(f"❌ Error de importación: {e}")
        print("Verifica que estés en el directorio correcto del proyecto")
        return False
    except Exception as e:
        print(f"❌ Error inicializando la base de datos: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)
