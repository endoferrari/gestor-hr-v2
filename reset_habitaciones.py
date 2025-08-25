"""
Script para resetear las habitaciones y limpiar el estado de la base de datos
"""

import sys
from pathlib import Path

# Agregar directorio raíz al path
project_root = str(Path(__file__).parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from sqlalchemy import text  # noqa: E402

from app.db.session import SessionLocal  # noqa: E402
from app.models.habitacion import Habitacion  # noqa: E402
from app.models.hospedaje import Hospedaje  # noqa: E402
from app.models.pedido import LineaPedido, Pedido  # noqa: E402
from app.models.producto import Producto  # noqa: E402


def reset_habitaciones():
    """
    Resetea el estado de todas las habitaciones a 'disponible'
    y limpia registros de hospedajes y pedidos para tener un estado limpio
    """
    db = SessionLocal()
    try:
        print("🔄 Iniciando reseteo de habitaciones y estado de la base de datos...")

        # 1. Eliminar líneas de pedido primero (por foreign keys)
        if hasattr(db.query(LineaPedido), "delete"):
            num_lineas = db.query(LineaPedido).delete()
            print(f"  ✅ {num_lineas} líneas de pedido eliminadas.")

        # 2. Eliminar todos los pedidos
        if hasattr(db.query(Pedido), "delete"):
            num_pedidos = db.query(Pedido).delete()
            print(f"  ✅ {num_pedidos} pedidos eliminados.")

        # 3. Eliminar todos los hospedajes
        if hasattr(db.query(Hospedaje), "delete"):
            num_hospedajes = db.query(Hospedaje).delete()
            print(f"  ✅ {num_hospedajes} hospedajes eliminados.")

        # 4. Resetear estado de todas las habitaciones a 'DISPONIBLE'
        db.execute(text("UPDATE habitaciones SET estado = 'DISPONIBLE'"))
        habitaciones_count = db.execute(
            text("SELECT COUNT(*) FROM habitaciones WHERE estado = 'DISPONIBLE'")
        ).scalar()
        print(f"  ✅ {habitaciones_count} habitaciones resetadas a 'DISPONIBLE'.")

        # 5. Asegurar que los productos estén activos
        num_productos = db.query(Producto).update({"activo": True})
        print(f"  ✅ {num_productos} productos activados.")

        # Guardar todos los cambios
        db.commit()

        # Mostrar estado final
        print("\n📊 Estado final:")
        habitaciones_disponibles = db.execute(
            text("SELECT COUNT(*) FROM habitaciones WHERE estado = 'DISPONIBLE'")
        ).scalar()
        print(f"  🏠 Habitaciones disponibles: {habitaciones_disponibles}")
        productos_activos = db.execute(
            text("SELECT COUNT(*) FROM productos WHERE activo = true")
        ).scalar()
        print(f"  🛍️ Productos activos: {productos_activos}")
        hospedajes_count = db.execute(text("SELECT COUNT(*) FROM hospedajes")).scalar()
        print(f"  📋 Hospedajes: {hospedajes_count}")
        pedidos_count = db.execute(text("SELECT COUNT(*) FROM pedidos")).scalar()
        print(f"  🧾 Pedidos: {pedidos_count}")

        print("\n✅ ¡Reseteo completado exitosamente!")
        print("🎯 El sistema está limpio y listo para pruebas fiables.")

    except Exception as e:
        print(f"\n❌ Error durante el reseteo: {e}")
        print("🔄 Haciendo rollback...")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    reset_habitaciones()
