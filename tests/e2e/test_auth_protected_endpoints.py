# /tests/e2e/test_auth_protected_endpoints.py
import uuid

from playwright.sync_api import Page
import requests


def test_oauth2_token_endpoint(page: Page):
    """
    Prueba simple del endpoint OAuth2 token usando requests.
    """
    # 1. Primero crear un usuario para las pruebas usando requests
    unique_username = f"authtest_{str(uuid.uuid4()).replace('-', '')[:8]}"
    full_name = "Usuario Auth Test"
    password = "testpassword123"

    # Crear usuario via API directa
    user_data = {
        "full_name": full_name,
        "username": unique_username,
        "password": password,
    }

    response = requests.post("http://localhost:8002/api/users/", json=user_data)
    assert response.status_code == 201, f"Error creando usuario: {response.text}"

    # 2. Obtener token OAuth2 usando requests
    token_data = {
        "username": unique_username,
        "password": password,
        "grant_type": "password",
    }

    response = requests.post(
        "http://localhost:8002/api/token",
        data=token_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert response.status_code == 200, f"Error obteniendo token: {response.text}"
    token_response = response.json()
    assert "access_token" in token_response, "Token no encontrado en respuesta"
    assert token_response["token_type"] == "bearer", "Tipo de token incorrecto"

    # 3. Usar el token para acceder a endpoint protegido
    token = token_response["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    response = requests.get("http://localhost:8002/api/users/me/", headers=headers)
    assert response.status_code == 200, (
        f"Error accediendo a endpoint protegido: {response.text}"
    )

    user_info = response.json()
    assert user_info["username"] == unique_username, f"Username incorrecto: {user_info}"
    assert user_info["full_name"] == full_name, f"Nombre incorrecto: {user_info}"


def test_protected_endpoint_without_token(page: Page):
    """
    Prueba que los endpoints protegidos requieren autenticación.
    """
    page.goto("http://localhost:3000")

    # Intentar acceder a endpoint protegido sin token
    test_no_auth_script = """
    fetch('http://localhost:8002/api/users/me/', {
        method: 'GET'
    }).then(response => {
        window.noAuthResponse = {
            status: response.status,
            ok: response.ok
        };
        return response.json();
    }).then(data => {
        window.noAuthData = data;
        console.log('No auth response:', data);
    })
    """

    page.evaluate(test_no_auth_script)
    page.wait_for_timeout(1000)

    # Verificar que devuelve error 401
    no_auth_response = page.evaluate("window.noAuthResponse")
    no_auth_data = page.evaluate("window.noAuthData")

    assert no_auth_response["status"] == 401
    assert not no_auth_response["ok"]
    assert "Not authenticated" in no_auth_data.get("detail", "")


def test_protected_endpoint_with_invalid_token(page: Page):
    """
    Prueba que los endpoints protegidos rechazan tokens inválidos.
    """
    page.goto("http://localhost:3000")

    # Intentar acceder con token inválido
    test_invalid_token_script = """
    fetch('http://localhost:8002/api/users/me/', {
        method: 'GET',
        headers: {'Authorization': 'Bearer invalid_token_12345'}
    }).then(response => {
        window.invalidTokenResponse = {
            status: response.status,
            ok: response.ok
        };
        return response.json();
    }).then(data => {
        window.invalidTokenData = data;
        console.log('Invalid token response:', data);
    })
    """

    page.evaluate(test_invalid_token_script)
    page.wait_for_timeout(1000)

    # Verificar que devuelve error 401
    invalid_token_response = page.evaluate("window.invalidTokenResponse")
    invalid_token_data = page.evaluate("window.invalidTokenData")

    assert invalid_token_response["status"] == 401
    assert not invalid_token_response["ok"]
    assert "Could not validate credentials" in invalid_token_data.get("detail", "")
