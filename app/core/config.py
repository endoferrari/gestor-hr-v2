"""
Configuración de la aplicación
"""


class Settings:
    """Configuración de la aplicación"""

    # Configuración general
    PROJECT_NAME: str = "Gestor HR v2.0"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"

    # Base de datos
    DATABASE_URL: str | None = "postgresql://username:password@localhost/gestor_hr_v2"

    # Seguridad
    SECRET_KEY: str = "tu-clave-secreta-super-segura-cambia-esto-en-produccion"


settings = Settings()
