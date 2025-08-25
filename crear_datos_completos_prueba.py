#!/usr/bin/env python3
"""
🏗️ Script para crear datos de prueba completos para testing E2E
Crea usuarios, habitaciones, tarifas, y productos necesarios para tests
"""

import os
import sys

# Añadir el directorio raíz al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models.habitacion import Habitacion
from app.models.producto import Producto
from app.models.tarifa import Tarifa
from app.models.usuario import Usuario


def crear_datos_prueba():
    """Crea todos los datos necesarios para tests E2E"""

    print("🏗️ Creando datos de prueba completos...")

    with SessionLocal() as db:
        try:
            # 🔐 USUARIOS DE PRUEBA
            print("\n👤 Creando usuarios de prueba...")

            # Usuario cajero para tests
            cajero_existente = (
                db.query(Usuario).filter(Usuario.email == "cajero1@test.com").first()
            )
            if not cajero_existente:
                cajero = Usuario(
                    nombre_completo="Cajero Test",
                    email="cajero1@test.com",
                    hashed_password=get_password_hash("password123"),
                    puesto="cajero",
                    is_active=True,
                )
                db.add(cajero)
                print("  ✅ Cajero creado: cajero1@test.com / password123")
            else:
                print("  ℹ️ Cajero ya existe")

            # Usuario admin
            admin_existente = (
                db.query(Usuario).filter(Usuario.email == "admin@test.com").first()
            )
            if not admin_existente:
                admin = Usuario(
                    nombre_completo="Admin Test",
                    email="admin@test.com",
                    hashed_password=get_password_hash("admin123"),
                    puesto="administrador",
                    is_active=True,
                    is_superuser=True,
                )
                db.add(admin)
                print("  ✅ Admin creado: admin@test.com / admin123")
            else:
                print("  ℹ️ Admin ya existe")

            db.commit()

            # 🏠 HABITACIONES DE PRUEBA
            print("\n🏠 Creando habitaciones de prueba...")

            habitaciones_datos = [
                {
                    "numero": "101",
                    "tipo": "simple",
                    "precio_noche": 75.00,
                    "descripcion": "Habitación simple con cama individual",
                    "estado": "disponible",
                },
                {
                    "numero": "102",
                    "tipo": "doble",
                    "precio_noche": 120.00,
                    "descripcion": "Habitación doble con dos camas",
                    "estado": "disponible",
                },
                {
                    "numero": "201",
                    "tipo": "suite",
                    "precio_noche": 180.00,
                    "descripcion": "Suite de lujo con jacuzzi",
                    "estado": "disponible",
                },
                {
                    "numero": "202",
                    "tipo": "doble",
                    "precio_noche": 130.00,
                    "descripcion": "Habitación doble con vista al mar",
                    "estado": "ocupada",
                },
                {
                    "numero": "301",
                    "tipo": "simple",
                    "precio_noche": 65.00,
                    "descripcion": "Habitación económica",
                    "estado": "limpieza",
                },
            ]

            for hab_data in habitaciones_datos:
                hab_existente = (
                    db.query(Habitacion)
                    .filter(Habitacion.numero == hab_data["numero"])
                    .first()
                )
                if not hab_existente:
                    habitacion = Habitacion(**hab_data)
                    db.add(habitacion)
                    print(
                        f"  ✅ Habitación {hab_data['numero']} ({hab_data['tipo']}) - {hab_data['estado']}"
                    )
                else:
                    print(f"  ℹ️ Habitación {hab_data['numero']} ya existe")

            db.commit()

            # 💰 TARIFAS DE PRUEBA
            print("\n💰 Creando tarifas de prueba...")

            tarifas_datos = [
                {
                    "nombre": "Tarifa Estándar Simple",
                    "tipo_habitacion": "simple",
                    "descripcion": "Precio regular",
                    "precio": 89.99,
                    "activa": True,
                },
                {
                    "nombre": "Tarifa Estándar Doble",
                    "tipo_habitacion": "doble",
                    "descripcion": "Precio regular",
                    "precio": 129.99,
                    "activa": True,
                },
                {
                    "nombre": "Tarifa Estándar Suite",
                    "tipo_habitacion": "suite",
                    "descripcion": "Precio regular",
                    "precio": 199.99,
                    "activa": True,
                },
                {
                    "nombre": "Tarifa Promocional Simple",
                    "tipo_habitacion": "simple",
                    "descripcion": "Oferta especial",
                    "precio": 69.99,
                    "activa": True,
                },
                {
                    "nombre": "Tarifa Promocional Doble",
                    "tipo_habitacion": "doble",
                    "descripcion": "Oferta especial",
                    "precio": 99.99,
                    "activa": True,
                },
                {
                    "nombre": "Tarifa VIP Suite",
                    "tipo_habitacion": "suite",
                    "descripcion": "Servicio premium",
                    "precio": 299.99,
                    "activa": True,
                },
                {
                    "nombre": "Tarifa Fin de Semana Simple",
                    "tipo_habitacion": "simple",
                    "descripcion": "Precio especial weekend",
                    "precio": 109.99,
                    "activa": True,
                },
                {
                    "nombre": "Tarifa Temporal",
                    "tipo_habitacion": "doble",
                    "descripcion": "Tarifa desactivada",
                    "precio": 99.99,
                    "activa": False,
                },
            ]

            for tar_data in tarifas_datos:
                tar_existente = (
                    db.query(Tarifa).filter(Tarifa.nombre == tar_data["nombre"]).first()
                )
                if not tar_existente:
                    tarifa = Tarifa(**tar_data)
                    db.add(tarifa)
                    print(f"  ✅ Tarifa: {tar_data['nombre']} - €{tar_data['precio']}")
                else:
                    print(f"  ℹ️ Tarifa {tar_data['nombre']} ya existe")

            db.commit()

            # 🛍️ PRODUCTOS DE PRUEBA
            print("\n🛍️ Creando productos de prueba...")

            productos_datos = [
                # Bebidas
                {
                    "nombre": "Coca Cola",
                    "descripcion": "Refresco 33cl",
                    "precio": 2.50,
                    "categoria": "bebidas",
                    "activo": True,
                    "stock": 50,
                },
                {
                    "nombre": "Agua Mineral",
                    "descripcion": "Botella 50cl",
                    "precio": 1.50,
                    "categoria": "bebidas",
                    "activo": True,
                    "stock": 30,
                },
                {
                    "nombre": "Cerveza",
                    "descripcion": "Cerveza nacional 33cl",
                    "precio": 3.00,
                    "categoria": "bebidas",
                    "activo": True,
                    "stock": 25,
                },
                {
                    "nombre": "Café",
                    "descripcion": "Café solo",
                    "precio": 1.80,
                    "categoria": "bebidas",
                    "activo": True,
                    "stock": 100,
                },
                # Comida
                {
                    "nombre": "Sandwich Club",
                    "descripcion": "Sandwich mixto con patatas",
                    "precio": 8.50,
                    "categoria": "comida",
                    "activo": True,
                    "stock": 15,
                },
                {
                    "nombre": "Ensalada César",
                    "descripcion": "Ensalada fresca con pollo",
                    "precio": 12.00,
                    "categoria": "comida",
                    "activo": True,
                    "stock": 10,
                },
                {
                    "nombre": "Pizza Margherita",
                    "descripcion": "Pizza clásica italiana",
                    "precio": 14.50,
                    "categoria": "comida",
                    "activo": True,
                    "stock": 8,
                },
                # Servicios
                {
                    "nombre": "Lavandería Express",
                    "descripcion": "Servicio de lavado rápido",
                    "precio": 15.00,
                    "categoria": "servicios",
                    "activo": True,
                    "stock": 999,
                },
                {
                    "nombre": "Spa Masaje",
                    "descripcion": "Masaje relajante 1h",
                    "precio": 45.00,
                    "categoria": "servicios",
                    "activo": True,
                    "stock": 5,
                },
                {
                    "nombre": "Transporte Aeropuerto",
                    "descripcion": "Traslado ida/vuelta",
                    "precio": 25.00,
                    "categoria": "servicios",
                    "activo": True,
                    "stock": 10,
                },
                # Alojamiento adicional
                {
                    "nombre": "Cama Supletoria",
                    "descripcion": "Cama extra en habitación",
                    "precio": 20.00,
                    "categoria": "alojamiento",
                    "activo": True,
                    "stock": 5,
                },
                {
                    "nombre": "Late Check-out",
                    "descripcion": "Salida tardía hasta 16h",
                    "precio": 10.00,
                    "categoria": "alojamiento",
                    "activo": True,
                    "stock": 999,
                },
            ]

            for prod_data in productos_datos:
                prod_existente = (
                    db.query(Producto)
                    .filter(Producto.nombre == prod_data["nombre"])
                    .first()
                )
                if not prod_existente:
                    producto = Producto(**prod_data)
                    db.add(producto)
                    print(
                        f"  ✅ {prod_data['categoria'].title()}: {prod_data['nombre']} - €{prod_data['precio']}"
                    )
                else:
                    print(f"  ℹ️ Producto {prod_data['nombre']} ya existe")

            db.commit()

            # 📊 RESUMEN FINAL
            print("\n📊 RESUMEN DE DATOS CREADOS:")
            print(f"  👤 Usuarios: {db.query(Usuario).count()}")
            print(f"  🏠 Habitaciones: {db.query(Habitacion).count()}")
            print(
                f"  💰 Tarifas: {db.query(Tarifa).filter(Tarifa.activa).count()} activas"
            )
            print(
                f"  🛍️ Productos: {db.query(Producto).filter(Producto.activo).count()} activos"
            )

            print("\n✅ ¡Datos de prueba creados exitosamente!")
            print("\n🧪 Credenciales para testing:")
            print("   🔐 Cajero: cajero1@test.com / password123")
            print("   🔐 Admin:  admin@test.com / admin123")
            print("\n🎯 El sistema está listo para testing E2E completo!")

        except Exception as e:
            print(f"❌ Error creando datos: {e}")
            db.rollback()
            raise
        finally:
            db.close()


if __name__ == "__main__":
    crear_datos_prueba()
