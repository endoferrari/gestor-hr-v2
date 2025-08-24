"""
Prueba básica para verificar que todo funciona
"""

from app.main import app


def test_app_exists() -> None:
    """Prueba que la aplicación FastAPI existe"""
    assert app is not None
    assert hasattr(app, "title")
    assert hasattr(app, "version")
