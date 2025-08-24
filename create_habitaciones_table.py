#!/usr/bin/env python3
"""
Script para crear la tabla de habitaciones en la base de datos
"""

import sys
from pathlib import Path

# Agregar el directorio raíz al Python path
root_dir = Path(__file__).parent
sys.path.append(str(root_dir))

# Imports después de configurar el path
from app.db.database import engine
from app.models.habitacion import Habitacion


def create_habitaciones_table():
    """Crear la tabla de habitaciones"""
    try:
        print("🏨 Creando tabla de habitaciones...")

        # Crear solo la tabla de habitaciones
        Habitacion.__table__.create(bind=engine, checkfirst=True)

        print("✅ Tabla 'habitaciones' creada exitosamente!")
        return True

    except Exception as e:
        print(f"❌ Error al crear la tabla: {e}")
        return False


def verify_table():
    """Verificar que la tabla se creó correctamente"""
    try:
        from app.db.database import SessionLocal

        db = SessionLocal()

        # Verificar que podemos hacer una consulta básica
        result = db.query(Habitacion).count()
        print(f"✅ Verificación exitosa. Habitaciones en BD: {result}")

        db.close()
        return True

    except Exception as e:
        print(f"❌ Error en verificación: {e}")
        return False


if __name__ == "__main__":
    print("🚀 Creación de tabla de habitaciones - SKYNET 2.0")
    print("=" * 50)

    success = create_habitaciones_table()

    if success:
        verify_table()
        print("\n🎉 ¡Tabla de habitaciones lista!")
        print("💡 Ahora puedes empezar a crear habitaciones")
    else:
        print("\n❌ Falló la creación de la tabla")
        sys.exit(1)
