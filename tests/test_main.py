"""
Prueba básica para verificar que todo funciona
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_read_root() -> None:
    """Prueba el endpoint raíz"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data


def test_health_check() -> None:
    """Prueba el endpoint de salud"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
