import requests
import time

# Test manual de registro con username
test_user = {
    "full_name": "Test User Manual Final",
    "username": "testusernamefinal" + str(int(time.time())),
    "password": "testpassword123",
}

try:
    response = requests.post(
        "http://localhost:8000/api/users/", json=test_user, timeout=5
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        user_data = response.json()
        print("Registro exitoso!")
        print(f"ID: {user_data.get('id')}")
        print(f"Username: {user_data.get('username')}")
        print(f"Full Name: {user_data.get('full_name')}")
    else:
        print(f"Error: {response.text}")

    # Test de login
    login_data = {"username": test_user["username"], "password": test_user["password"]}

    login_response = requests.post(
        "http://localhost:8000/api/users/login/", json=login_data, timeout=5
    )
    print(f"Login Status: {login_response.status_code}")
    if login_response.status_code == 200:
        login_result = login_response.json()
        print("Login exitoso!")
        print(f"Token: {login_result.get('access_token', '')[:20]}...")
        print(f"User: {login_result.get('user', {})}")
    else:
        print(f"Login Error: {login_response.text}")

except Exception as e:
    print(f"Error: {e}")
