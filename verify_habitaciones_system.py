#!/usr/bin/env python3
"""
Script para verificar el modelo y esquemas de habitación
"""

import sys
from pathlib import Path

# Agregar el directorio raíz al Python path
root_dir = Path(__file__).parent
sys.path.append(str(root_dir))


def test_habitacion_model():
    """Verificar que el modelo de habitación funciona correctamente"""
    try:
        from app.models.habitacion import TipoHabitacion, EstadoHabitacion

        print("✅ Importación del modelo exitosa")
        print(f"📋 Tipos disponibles: {[tipo.value for tipo in TipoHabitacion]}")
        print(
            f"📋 Estados disponibles: {[estado.value for estado in EstadoHabitacion]}"
        )

        return True
    except Exception as e:
        print(f"❌ Error en modelo: {e}")
        return False


def test_habitacion_schemas():
    """Verificar que los esquemas de habitación funcionan correctamente"""
    try:
        from app.schemas.habitacion import HabitacionCreate
        from app.models.habitacion import TipoHabitacion

        print("✅ Importación de esquemas exitosa")

        # Probar creación de esquema
        habitacion_data = {
            "numero": "TEST001",
            "tipo": TipoHabitacion.SUITE,
            "precio_por_noche": 200.0,
        }

        habitacion_create = HabitacionCreate(**habitacion_data)
        print(
            f"✅ Esquema de creación: {habitacion_create.numero} - {habitacion_create.tipo.value}"
        )

        return True
    except Exception as e:
        print(f"❌ Error en esquemas: {e}")
        return False


def test_database_connection():
    """Verificar conexión a la base de datos y consulta de habitaciones"""
    try:
        from app.db.database import SessionLocal
        from app.models.habitacion import Habitacion

        db = SessionLocal()

        # Consulta básica
        habitaciones = db.query(Habitacion).all()
        print("✅ Conexión a BD exitosa")
        print(f"📊 Habitaciones encontradas: {len(habitaciones)}")

        # Mostrar algunas habitaciones
        for hab in habitaciones[:3]:
            print(
                f"  - {hab.numero}: {hab.tipo.value} - ${hab.precio_por_noche} ({hab.estado.value})"
            )

        if len(habitaciones) > 3:
            print(f"  ... y {len(habitaciones) - 3} más")

        db.close()
        return True

    except Exception as e:
        print(f"❌ Error en BD: {e}")
        return False


if __name__ == "__main__":
    print("🧪 Verificación del sistema de habitaciones - SKYNET 2.0")
    print("=" * 60)

    tests = [
        ("Modelo de habitación", test_habitacion_model),
        ("Esquemas de habitación", test_habitacion_schemas),
        ("Conexión a base de datos", test_database_connection),
    ]

    results = []

    for test_name, test_func in tests:
        print(f"\n🔍 {test_name}:")
        print("-" * 40)
        result = test_func()
        results.append(result)

    # Resumen
    print("\n📊 RESUMEN DE VERIFICACIÓN:")
    print("=" * 60)
    passed = sum(results)
    total = len(results)

    for i, (test_name, _) in enumerate(tests):
        status = "✅ PASS" if results[i] else "❌ FAIL"
        print(f"{status} - {test_name}")

    print(f"\n🎯 Resultado final: {passed}/{total} pruebas exitosas")

    if passed == total:
        print(
            "🎉 ¡Todos los componentes de habitaciones están funcionando correctamente!"
        )
        print("💡 El sistema está listo para el desarrollo del mapa de habitaciones")
    else:
        print("⚠️ Algunos componentes necesitan revisión")
        sys.exit(1)
