# /tests/conftest.py
from playwright.sync_api import Page
import pytest


@pytest.fixture
def page(page: Page):
    """
    Configuración base para todas las pruebas.
    Establece timeouts y configuraciones comunes.
    """
    # Configurar timeout más largo para operaciones lentas
    page.set_default_timeout(10000)  # 10 segundos

    # Configurar viewport consistente
    page.set_viewport_size({"width": 1280, "height": 720})

    return page
