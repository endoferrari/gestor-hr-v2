"""
Sistema de logging simplificado
"""

import logging

from app.core.config import get_settings


def setup_logging() -> None:
    """
    Configurar el sistema de logging de la aplicación
    """
    settings = get_settings()

    # Configuración básica
    logging.basicConfig(
        level=settings.LOG_LEVEL,
        format="[%(asctime)s] [%(levelname)s] [%(name)s] - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[logging.StreamHandler()],
    )

    # Log inicial
    logger = logging.getLogger(__name__)
    logger.info("🔧 Sistema de logging configurado correctamente")


def get_logger(name: str) -> logging.Logger:
    """
    Obtener un logger configurado para un módulo específico

    Args:
        name: Nombre del módulo/logger

    Returns:
        Logger configurado
    """
    return logging.getLogger(name)
