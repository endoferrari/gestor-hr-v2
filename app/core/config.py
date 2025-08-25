"""
Configuración profesional de la aplicación con Pydantic Settings
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuración principal de la aplicación usando Pydantic Settings"""

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    # Información del proyecto
    PROJECT_NAME: str = "Gestor HR v3.0 Profesional"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Sistema profesional de gestión hotelera"

    # Configuración del servidor
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = True

    # Base de datos
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/gestor_hr_db"

    # Seguridad
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:8080"]

    # Configuración de logs
    LOG_LEVEL: str = "INFO"


@lru_cache
def get_settings() -> Settings:
    """Obtener la configuración de la aplicación"""
    return Settings()


# Instancia global de configuración
settings = get_settings()
