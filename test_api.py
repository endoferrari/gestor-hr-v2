#!/usr/bin/env python3
"""
Prueba rápida de la API de registro de usuarios
"""

import json

import requests

# URL del backend
API_BASE = "http://localhost:8000"


def test_user_registration():
    """Prueba el registro de un usuario"""

    # Datos de prueba
    test_user = {
        "email": "nuevo_usuario@ejemplo.com",
        "name": "Usuario Nuevo",
        "password": "password123",
    }

    # Datos de prueba
    test_user = {
        "email": "test@ejemplo.com",
        "name": "Usuario Prueba",
        "password": "password123",
    }

    print("🧪 Probando registro de usuario...")
    print(f"📤 Enviando datos: {json.dumps(test_user, indent=2)}")

    try:
        # Hacer la petición POST
        response = requests.post(f"{API_BASE}/api/users/", json=test_user)

        print(f"📊 Status Code: {response.status_code}")
        print(f"📥 Respuesta: {json.dumps(response.json(), indent=2)}")

        if response.status_code == 201:
            print("✅ Usuario registrado exitosamente!")
        elif response.status_code == 400:
            print("⚠️  Error en los datos enviados")
        else:
            print(f"❌ Error inesperado: {response.status_code}")

    except requests.exceptions.ConnectionError:
        print(
            "❌ No se puede conectar al backend. Verifica que esté corriendo en puerto 8000"
        )
    except Exception as e:
        print(f"❌ Error: {e}")


def test_duplicate_email():
    """Prueba el registro con email duplicado"""

    # Mismo email de arriba
    test_user = {
        "email": "test@ejemplo.com",
        "name": "Otro Usuario",
        "password": "password456",
    }

    print("\n🧪 Probando registro con email duplicado...")

    try:
        response = requests.post(f"{API_BASE}/api/users/", json=test_user)

        print(f"📊 Status Code: {response.status_code}")
        print(f"📥 Respuesta: {json.dumps(response.json(), indent=2)}")

        if response.status_code == 400:
            print("✅ Validación de email duplicado funciona correctamente!")
        else:
            print("⚠️  La validación de email duplicado no funcionó como esperado")

    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    test_user_registration()
    test_duplicate_email()
