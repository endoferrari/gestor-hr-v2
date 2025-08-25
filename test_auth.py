#!/usr/bin/env python3
"""
Script para probar el sistema de autenticación JWT
"""

import requests

BASE_URL = "http://127.0.0.1:8000"
API_URL = f"{BASE_URL}/api/v1"


def test_auth_system():
    """Probar el sistema de autenticación completo"""
    print("🔒 Testing JWT Authentication System")
    print("=" * 50)

    # 1. Probar login con credenciales correctas
    print("1. Testing login with correct credentials...")
    login_data = {
        "username": "admin@test.com",  # OAuth2 usa 'username' field
        "password": "admin123",
    }

    response = requests.post(
        f"{API_URL}/auth/login",
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    if response.status_code == 200:
        print("✅ Login successful!")
        token_data = response.json()
        access_token = token_data["access_token"]
        print(f"   Access token: {access_token[:50]}...")

        # 2. Probar endpoint protegido con token
        print("\n2. Testing protected endpoint with token...")
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

        # Probar test-token endpoint
        response = requests.post(f"{API_URL}/auth/test-token", headers=headers)
        if response.status_code == 200:
            print("✅ Token validation successful!")
            user_data = response.json()
            print(f"   User: {user_data}")
        else:
            print(f"❌ Token validation failed: {response.status_code}")
            print(f"   Response: {response.text}")

        # 3. Probar endpoint de usuarios protegido
        print("\n3. Testing protected users endpoint...")
        response = requests.get(f"{API_URL}/usuarios/", headers=headers)
        if response.status_code == 200:
            print("✅ Users endpoint accessible!")
            users = response.json()
            print(f"   Found {len(users)} users")
            for user in users:
                print(f"   - {user['nombre_completo']} ({user['email']})")
        else:
            print(f"❌ Users endpoint failed: {response.status_code}")
            print(f"   Response: {response.text}")

    else:
        print(f"❌ Login failed: {response.status_code}")
        print(f"   Response: {response.text}")

    # 4. Probar login con credenciales incorrectas
    print("\n4. Testing login with incorrect credentials...")
    bad_login_data = {"username": "admin@test.com", "password": "wrongpassword"}

    response = requests.post(
        f"{API_URL}/auth/login",
        data=bad_login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    if response.status_code == 401:
        print("✅ Incorrect credentials properly rejected!")
    else:
        print(f"❌ Expected 401, got: {response.status_code}")

    # 5. Probar endpoint protegido sin token
    print("\n5. Testing protected endpoint without token...")
    response = requests.get(f"{API_URL}/usuarios/")
    if response.status_code == 401:
        print("✅ Protected endpoint properly secured!")
    else:
        print(f"❌ Expected 401, got: {response.status_code}")

    print("\n" + "=" * 50)
    print("🎉 Authentication system test completed!")


if __name__ == "__main__":
    try:
        test_auth_system()
    except requests.exceptions.ConnectionError:
        print(
            "❌ Could not connect to server. Make sure the server is running on http://127.0.0.1:8000"
        )
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
