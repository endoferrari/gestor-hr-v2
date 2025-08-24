#!/usr/bin/env python3
"""
Script para probar la API de habitaciones
"""

import requests
import json

# Configuración
API_BASE = "http://localhost:8002"


def test_get_habitaciones():
    """Probar obtener todas las habitaciones"""
    print("🧪 Probando GET /api/habitaciones/")

    try:
        response = requests.get(f"{API_BASE}/api/habitaciones/", timeout=5)
        print(f"📊 Status: {response.status_code}")

        if response.status_code == 200:
            habitaciones = response.json()
            print(f"✅ Se obtuvieron {len(habitaciones)} habitaciones")

            # Mostrar algunas habitaciones
            for hab in habitaciones[:3]:
                print(
                    f"  - #{hab['numero']}: {hab['tipo']} - ${hab['precio_por_noche']} ({hab['estado']})"
                )

            if len(habitaciones) > 3:
                print(f"  ... y {len(habitaciones) - 3} más")

            return habitaciones
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            return []

    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return []


def test_get_habitacion_by_id(habitacion_id):
    """Probar obtener una habitación específica"""
    print(f"\n🧪 Probando GET /api/habitaciones/{habitacion_id}")

    try:
        response = requests.get(
            f"{API_BASE}/api/habitaciones/{habitacion_id}", timeout=5
        )
        print(f"📊 Status: {response.status_code}")

        if response.status_code == 200:
            habitacion = response.json()
            print(
                f"✅ Habitación obtenida: #{habitacion['numero']} - {habitacion['tipo']}"
            )
            return habitacion
        elif response.status_code == 404:
            print("⚠️ Habitación no encontrada (esperado si no existe)")
            return None
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            return None

    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None


def test_create_habitacion():
    """Probar crear una nueva habitación"""
    print("\n🧪 Probando POST /api/habitaciones/")

    nueva_habitacion = {"numero": "TEST999", "tipo": "suite", "precio_por_noche": 200.0}

    print(f"📤 Datos: {json.dumps(nueva_habitacion, indent=2)}")

    try:
        response = requests.post(
            f"{API_BASE}/api/habitaciones/", json=nueva_habitacion, timeout=5
        )
        print(f"📊 Status: {response.status_code}")

        if response.status_code == 201:
            habitacion = response.json()
            print(
                f"✅ Habitación creada: #{habitacion['numero']} (ID: {habitacion['id']})"
            )
            return habitacion
        elif response.status_code == 400:
            print("⚠️ Error de validación (posiblemente habitación duplicada)")
            print(f"   {response.json()}")
            return None
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            return None

    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None


def test_update_habitacion(habitacion_id):
    """Probar actualizar una habitación"""
    print(f"\n🧪 Probando PUT /api/habitaciones/{habitacion_id}")

    datos_actualizacion = {
        "numero": "TEST999-UPDATED",
        "tipo": "familiar",
        "precio_por_noche": 250.0,
    }

    try:
        response = requests.put(
            f"{API_BASE}/api/habitaciones/{habitacion_id}",
            json=datos_actualizacion,
            timeout=5,
        )
        print(f"📊 Status: {response.status_code}")

        if response.status_code == 200:
            habitacion = response.json()
            print(f"✅ Habitación actualizada: #{habitacion['numero']}")
            return habitacion
        elif response.status_code == 404:
            print("⚠️ Habitación no encontrada")
            return None
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            return None

    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None


def test_delete_habitacion(habitacion_id):
    """Probar eliminar una habitación"""
    print(f"\n🧪 Probando DELETE /api/habitaciones/{habitacion_id}")

    try:
        response = requests.delete(
            f"{API_BASE}/api/habitaciones/{habitacion_id}", timeout=5
        )
        print(f"📊 Status: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print(f"✅ {result['message']}")
            return True
        elif response.status_code == 404:
            print("⚠️ Habitación no encontrada")
            return False
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            return False

    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False


def main():
    print("🚀 Prueba de API de Habitaciones - SKYNET 2.0")
    print("=" * 50)

    # 1. Obtener todas las habitaciones
    habitaciones = test_get_habitaciones()

    if not habitaciones:
        print(
            "❌ No se pudieron obtener habitaciones. Verificar que el backend esté corriendo."
        )
        return

    # 2. Obtener una habitación específica
    if habitaciones:
        primera_habitacion = habitaciones[0]
        test_get_habitacion_by_id(primera_habitacion["id"])

    # 3. Crear una nueva habitación
    nueva_habitacion = test_create_habitacion()

    if nueva_habitacion:
        habitacion_id = nueva_habitacion["id"]

        # 4. Actualizar la habitación creada
        test_update_habitacion(habitacion_id)

        # 5. Eliminar la habitación de prueba
        test_delete_habitacion(habitacion_id)

    print("\n🎉 Pruebas de API completadas!")
    print("💡 Para más detalles, revisa la documentación en http://localhost:8000/docs")


if __name__ == "__main__":
    main()
