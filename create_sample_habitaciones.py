#!/usr/bin/env python3
"""
Script para crear habitaciones de ejemplo en la base de datos
"""

import sys
from pathlib import Path

# Agregar el directorio raíz al Python path
root_dir = Path(__file__).parent
sys.path.append(str(root_dir))

from app.db.database import SessionLocal
from app.models.habitacion import Habitacion, TipoHabitacion, EstadoHabitacion


def create_sample_habitaciones():
    """Crear habitaciones de ejemplo"""
    db = SessionLocal()

    try:
        # Habitaciones de ejemplo
        habitaciones_ejemplo = [
            {
                "numero": "101",
                "tipo": TipoHabitacion.SIMPLE,
                "precio_por_noche": 50.0,
                "estado": EstadoHabitacion.DISPONIBLE,
            },
            {
                "numero": "102",
                "tipo": TipoHabitacion.DOBLE,
                "precio_por_noche": 75.0,
                "estado": EstadoHabitacion.DISPONIBLE,
            },
            {
                "numero": "201",
                "tipo": TipoHabitacion.SUITE,
                "precio_por_noche": 150.0,
                "estado": EstadoHabitacion.DISPONIBLE,
            },
            {
                "numero": "202",
                "tipo": TipoHabitacion.MATRIMONIAL,
                "precio_por_noche": 85.0,
                "estado": EstadoHabitacion.OCUPADA,
            },
            {
                "numero": "301",
                "tipo": TipoHabitacion.FAMILIAR,
                "precio_por_noche": 120.0,
                "estado": EstadoHabitacion.DISPONIBLE,
            },
            {
                "numero": "302",
                "tipo": TipoHabitacion.SUITE,
                "precio_por_noche": 160.0,
                "estado": EstadoHabitacion.MANTENIMIENTO,
            },
        ]

        print("🏨 Creando habitaciones de ejemplo...")

        for hab_data in habitaciones_ejemplo:
            # Verificar si la habitación ya existe
            existing = (
                db.query(Habitacion)
                .filter(Habitacion.numero == hab_data["numero"])
                .first()
            )
            if existing:
                print(f"⚠️  Habitación {hab_data['numero']} ya existe, saltando...")
                continue

            habitacion = Habitacion(**hab_data)
            db.add(habitacion)
            print(
                f"✅ Habitación {hab_data['numero']} ({hab_data['tipo'].value}) creada"
            )

        db.commit()

        # Verificar el resultado
        total = db.query(Habitacion).count()
        print("\n🎉 Proceso completado!")
        print(f"📊 Total de habitaciones en BD: {total}")

        # Mostrar resumen por tipo
        print("\n📋 Resumen por tipo:")
        for tipo in TipoHabitacion:
            count = db.query(Habitacion).filter(Habitacion.tipo == tipo).count()
            if count > 0:
                print(f"  - {tipo.value.capitalize()}: {count}")

        # Mostrar resumen por estado
        print("\n📋 Resumen por estado:")
        for estado in EstadoHabitacion:
            count = db.query(Habitacion).filter(Habitacion.estado == estado).count()
            if count > 0:
                print(f"  - {estado.value.capitalize()}: {count}")

        return True

    except Exception as e:
        print(f"❌ Error al crear habitaciones: {e}")
        db.rollback()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    print("🚀 Creación de habitaciones de ejemplo - SKYNET 2.0")
    print("=" * 55)

    success = create_sample_habitaciones()

    if success:
        print("\n💡 Las habitaciones están listas para ser usadas en el mapa")
    else:
        print("\n❌ Falló la creación de habitaciones")
        sys.exit(1)
