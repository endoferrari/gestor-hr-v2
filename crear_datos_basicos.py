"""
Script simplificado para crear datos básicos de prueba
"""

import sys
from pathlib import Path

# Agregar el directorio del proyecto al path
project_root = str(Path(__file__).parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Imports de la aplicación (después de configurar el path)
from app.core.security import get_password_hash  # noqa: E402
from app.db.session import SessionLocal  # noqa: E402
from app.models.habitacion import Habitacion  # noqa: E402
from app.models.producto import Producto  # noqa: E402
from app.models.tarifa import Tarifa  # noqa: E402


def crear_datos_basicos():
    """Crear datos básicos para pruebas"""
    db = SessionLocal()
    try:
        print("🏗️ Creando datos básicos...")

        # Crear algunas habitaciones
        habitaciones = [
            {
                "numero": "101",
                "tipo": "individual",
                "estado": "disponible",
                "precio_noche": 50.0,
            },
            {
                "numero": "102",
                "tipo": "doble",
                "estado": "disponible",
                "precio_noche": 80.0,
            },
            {
                "numero": "201",
                "tipo": "suite",
                "estado": "disponible",
                "precio_noche": 150.0,
            },
        ]

        for hab_data in habitaciones:
            existente = (
                db.query(Habitacion)
                .filter(Habitacion.numero == hab_data["numero"])
                .first()
            )
            if not existente:
                habitacion = Habitacion(**hab_data)
                db.add(habitacion)
                print(f"  ✅ Habitación {hab_data['numero']} creada")

        # Crear algunas tarifas
        tarifas = [
            {
                "nombre": "Temporada Baja",
                "tipo_habitacion": "individual",
                "precio_base": 45.0,
                "activa": True,
            },
            {
                "nombre": "Temporada Alta",
                "tipo_habitacion": "individual",
                "precio_base": 60.0,
                "activa": True,
            },
            {
                "nombre": "Suite Premium",
                "tipo_habitacion": "suite",
                "precio_base": 120.0,
                "activa": True,
            },
        ]

        for tar_data in tarifas:
            existente = (
                db.query(Tarifa).filter(Tarifa.nombre == tar_data["nombre"]).first()
            )
            if not existente:
                tarifa = Tarifa(**tar_data)
                db.add(tarifa)
                print(f"  ✅ Tarifa '{tar_data['nombre']}' creada")

        # Crear algunos productos
        productos = [
            {"nombre": "Agua", "categoria": "bebidas", "precio": 2.5, "activo": True},
            {
                "nombre": "Sandwich",
                "categoria": "comidas",
                "precio": 8.0,
                "activo": True,
            },
            {
                "nombre": "Cerveza",
                "categoria": "bebidas",
                "precio": 4.0,
                "activo": True,
            },
        ]

        for prod_data in productos:
            existente = (
                db.query(Producto)
                .filter(Producto.nombre == prod_data["nombre"])
                .first()
            )
            if not existente:
                producto = Producto(**prod_data)
                db.add(producto)
                print(f"  ✅ Producto '{prod_data['nombre']}' creado")

        db.commit()
        print("\n✅ Datos básicos creados exitosamente!")

        # Mostrar resumen
        print("\n📊 Resumen:")
        print(f"  🏠 Habitaciones: {db.query(Habitacion).count()}")
        print(f"  💰 Tarifas: {db.query(Tarifa).count()}")
        print(f"  🛍️ Productos: {db.query(Producto).count()}")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    crear_datos_basicos()
