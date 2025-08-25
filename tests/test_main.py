"""
Tests básicos para verificar que la aplicación arranca correctamente
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client() -> TestClient:
    """Cliente de pruebas para FastAPI"""
    return TestClient(app)


def test_app_startup(client: TestClient) -> None:
    """Test que verifica que la aplicación arranca correctamente"""
    response = client.get("/")
    assert response.status_code == 200


def test_docs_available(client: TestClient) -> None:
    """Test que verifica que la documentación está disponible"""
    response = client.get("/docs")
    assert response.status_code in [200, 307, 308]  # Puede ser redirección


def test_app_structure() -> None:
    """Test que verifica la estructura básica de la aplicación"""
    assert app.title == "Gestor HR v3.0 Profesional"
    assert app.version == "1.0.0"
