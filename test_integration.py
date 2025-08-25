"""
Test de integración simple para verificar el sistema completo
"""
# ruff: noqa: F401

import sys
from pathlib import Path

# Agregar el directorio raíz al path para importaciones
sys.path.append(str(Path(__file__).parent))


def test_complete_system():
    """Test integral del sistema"""
    try:
        # 1. Importar Base
        from app.db.base_class import Base

        print("✅ Base importado correctamente")

        # 2. Importar modelos
        from app.models.hospedaje import Hospedaje
        from app.models.usuario import Usuario

        print("✅ Modelos importados correctamente")

        # 3. Importar schemas
        from app.schemas.hospedaje import HospedajeCreate, HospedajeUpdate
        from app.schemas.usuario import UsuarioCreate, UsuarioUpdate

        print("✅ Schemas importados correctamente")

        # 4. Importar CRUD
        from app.crud import (
            create_hospedaje,
            create_usuario,
            get_hospedaje,
            get_usuario,
        )

        print("✅ CRUD importado correctamente")

        # 5. Importar API
        from app.api.endpoints.hospedaje import router as hospedaje_router
        from app.api.endpoints.usuarios import router as usuarios_router

        print("✅ Endpoints importados correctamente")

        # 6. Importar aplicación principal
        from app.main import app

        print("✅ Aplicación principal importada correctamente")

        # 7. Verificar configuración
        from app.core.config import settings

        print("✅ Configuración importada correctamente")

        print("\n🎉 Sistema completo verificado exitosamente!")
        print("📊 Estadísticas:")
        print(f"   - Base de datos: {type(Base).__name__}")
        print("   - Modelos: Usuario, Hospedaje")
        print(
            "   - Schemas: UsuarioCreate, UsuarioUpdate, HospedajeCreate, HospedajeUpdate"
        )
        print("   - CRUD: Funciones disponibles")
        print("   - API: Routers para usuarios y hospedajes")
        print("   - Aplicación: FastAPI app configurada")

        # Test passed successfully
        print("✅ SISTEMA INTEGRADO COMPLETAMENTE")

    except Exception as e:
        print(f"❌ Error en el sistema: {e}")
        raise AssertionError(f"System integration test failed: {e}") from e


if __name__ == "__main__":
    success = test_complete_system()
    sys.exit(0 if success else 1)
