#!/usr/bin/env python3
"""
Script para verificar el estado de los servidores backend y frontend.
"""

import requests


def check_backend():
    """Verifica si el backend está respondiendo."""
    try:
        response = requests.get("http://localhost:8001", timeout=5)
        print(f"✅ Backend: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ Backend: {e}")
        return False


def check_frontend():
    """Verifica si el frontend está respondiendo."""
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        print(f"✅ Frontend: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ Frontend: {e}")
        return False


if __name__ == "__main__":
    print("🔍 Verificando servidores...")

    backend_ok = check_backend()
    frontend_ok = check_frontend()

    if backend_ok and frontend_ok:
        print("\n✅ Todos los servidores están funcionando")
    else:
        print("\n❌ Algunos servidores no están respondiendo")
        print("   Por favor reinicia los servidores:")
        print("   - Backend: python run.py")
        print("   - Frontend: python -m http.server 3000 --directory frontend")
