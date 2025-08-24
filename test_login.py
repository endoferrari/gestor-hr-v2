#!/usr/bin/env python3
"""
Script para probar login con usuarios de prueba.
"""

import requests


def test_login():
    """Prueba el login con usuarios de prueba."""
    print("🚀 Probando login en SKYNET 2.0")
    print("=" * 50)

    # Probar login con admin
    try:
        response = requests.post(
            "http://localhost:8002/api/users/login/",
            json={"username": "admin", "password": "123456"},
        )

        if response.status_code == 200:
            data = response.json()
            print("✅ Login exitoso con admin!")
            print(f"   Token: {data.get('access_token', '')[:50]}...")
        else:
            print(f"❌ Error en login: {response.status_code}")
            print(f"   Respuesta: {response.text}")

    except Exception as e:
        print(f"❌ Error de conexión: {e}")

    print("\n🔐 CREDENCIALES PARA LOGIN:")
    print("━" * 40)
    print("👤 Usuario: admin")
    print("🔑 Contraseña: 123456")
    print("")
    print("👤 Usuario: usuario1")
    print("🔑 Contraseña: password123")
    print("\n🌐 Ve a http://localhost:3000 e inicia sesión")
    print("💡 Usa Ctrl+Shift+R para limpiar caché del navegador")


if __name__ == "__main__":
    test_login()
