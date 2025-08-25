"""
Test simple para verificar la configuración básica
"""


def test_import_base():
    """Test que verifica que Base se puede importar"""
    try:
        from app.db.base_class import Base

        assert Base is not None
        print("✅ Base se importó correctamente")
    except ImportError as e:
        print(f"❌ Error al importar Base: {e}")
        raise


def test_import_models():
    """Test que verifica que los modelos se pueden importar"""
    try:
        from app.models.hospedaje import Hospedaje
        from app.models.usuario import Usuario

        assert Usuario is not None
        assert Hospedaje is not None
        print("✅ Modelos se importaron correctamente")
    except ImportError as e:
        print(f"❌ Error al importar modelos: {e}")
        raise


if __name__ == "__main__":
    test_import_base()
    test_import_models()
    print("🎉 Todas las importaciones funcionan correctamente")
