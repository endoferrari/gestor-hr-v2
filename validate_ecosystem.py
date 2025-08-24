#!/usr/bin/env python3
"""
Script de validación final del ecosistema completo de login.
Verifica que todo funcione correctamente con username únicamente.
"""

import requests
import time
import sys


def test_backend_connectivity():
    """Verifica que el backend esté corriendo"""
    try:
        response = requests.get("http://localhost:8000/docs", timeout=5)
        if response.status_code == 200:
            print("✅ Backend está corriendo correctamente")
            return True
        else:
            print(f"❌ Backend responde pero con error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ No se puede conectar al backend: {e}")
        return False


def test_frontend_connectivity():
    """Verifica que el frontend esté corriendo"""
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend está corriendo correctamente")
            return True
        else:
            print(f"❌ Frontend responde pero con error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ No se puede conectar al frontend: {e}")
        return False


def test_user_registration():
    """Prueba el registro de usuario con username"""
    unique_username = f"testuser{int(time.time())}"

    test_user = {
        "full_name": "Usuario Prueba Final",
        "username": unique_username,
        "password": "password123",
    }

    try:
        response = requests.post(
            "http://localhost:8000/api/users/", json=test_user, timeout=5
        )
        if response.status_code == 201:
            user_data = response.json()
            print(f"✅ Registro exitoso - Usuario: {user_data.get('username')}")
            return unique_username, test_user["password"]
        else:
            print(f"❌ Error en registro: {response.status_code} - {response.text}")
            return None, None
    except Exception as e:
        print(f"❌ Error en conexión durante registro: {e}")
        return None, None


def test_user_login(username, password):
    """Prueba el login de usuario"""
    login_data = {"username": username, "password": password}

    try:
        response = requests.post(
            "http://localhost:8000/api/users/login/", json=login_data, timeout=5
        )
        if response.status_code == 200:
            login_result = response.json()
            token = login_result.get("access_token", "")
            print(f"✅ Login exitoso - Token: {token[:20]}...")
            return token
        else:
            print(f"❌ Error en login: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error en conexión durante login: {e}")
        return None


def test_duplicate_username():
    """Prueba que no se puedan registrar usernames duplicados"""
    # Usamos un usuario que sabemos que existe
    duplicate_user = {
        "full_name": "Usuario Duplicado",
        "username": "usuariotest",  # Este ya existe
        "password": "password123",
    }

    try:
        response = requests.post(
            "http://localhost:8000/api/users/", json=duplicate_user, timeout=5
        )
        if response.status_code >= 400:
            print("✅ Validación de username duplicado funciona correctamente")
            return True
        else:
            print(f"❌ Se permitió registro duplicado (código {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Error en prueba de username duplicado: {e}")
        return False


def test_invalid_login():
    """Prueba login con credenciales incorrectas"""
    invalid_login = {"username": "usuarioinexistente", "password": "passwordincorrecto"}

    try:
        response = requests.post(
            "http://localhost:8000/api/users/login/", json=invalid_login, timeout=5
        )
        if response.status_code == 401:
            print("✅ Validación de credenciales incorrectas funciona correctamente")
            return True
        else:
            print(f"❌ Login inválido permitido (código {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Error en prueba de login inválido: {e}")
        return False


def main():
    """Función principal que ejecuta todas las pruebas"""
    print("🚀 VALIDACIÓN FINAL DEL ECOSISTEMA DE LOGIN")
    print("=" * 50)

    # Verificar conectividad
    backend_ok = test_backend_connectivity()
    frontend_ok = test_frontend_connectivity()

    if not backend_ok:
        print("\n❌ El backend no está funcionando. Detener las pruebas.")
        sys.exit(1)

    if not frontend_ok:
        print(
            "\n⚠️  El frontend no está funcionando, pero continuamos con las pruebas del API."
        )

    print("\n📝 PRUEBAS FUNCIONALES:")
    print("-" * 30)

    # Prueba de registro
    username, password = test_user_registration()
    if not username:
        print("❌ No se pudo completar el registro. Detener pruebas.")
        sys.exit(1)

    # Prueba de login
    token = test_user_login(username, password)
    if not token:
        print("❌ No se pudo completar el login. Detener pruebas.")
        sys.exit(1)

    # Pruebas de validación
    print("\n🔒 PRUEBAS DE VALIDACIÓN:")
    print("-" * 30)

    duplicate_ok = test_duplicate_username()
    invalid_login_ok = test_invalid_login()

    # Resumen final
    print("\n📊 RESUMEN FINAL:")
    print("=" * 50)

    tests_passed = 0
    total_tests = 5

    if backend_ok:
        tests_passed += 1
        print("✅ Backend funcionando")

    if username and password:
        tests_passed += 1
        print("✅ Registro de usuario")

    if token:
        tests_passed += 1
        print("✅ Login de usuario")

    if duplicate_ok:
        tests_passed += 1
        print("✅ Validación de username duplicado")

    if invalid_login_ok:
        tests_passed += 1
        print("✅ Validación de credenciales incorrectas")

    print(f"\n🎯 RESULTADO: {tests_passed}/{total_tests} pruebas exitosas")

    if tests_passed == total_tests:
        print(
            "🎉 ¡TODAS LAS PRUEBAS PASARON! El ecosistema de login está funcionando perfectamente."
        )
        print("✨ Sistema completamente migrado a username (sin email)")
        return 0
    else:
        print(f"⚠️  {total_tests - tests_passed} prueba(s) fallaron.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
