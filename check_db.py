#!/usr/bin/env python3
"""
Script para verificar la conectividad a PostgreSQL y crear la base de datos si no existe.
"""

from dotenv import load_dotenv
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Cargar variables de entorno
load_dotenv()


def check_and_create_database():
    # Configuración de conexión
    host = "localhost"
    port = "5432"
    user = "postgres"
    password = "password"  # Cambiar por tu contraseña
    database = "skynet_hr_db"

    print("🔍 Verificando conexión a PostgreSQL...")

    try:
        # Intentar conectar al servidor PostgreSQL (sin especificar base de datos)
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database="postgres",  # Base de datos por defecto
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        print("✅ Conexión a PostgreSQL exitosa!")

        # Verificar si la base de datos existe
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{database}'")
        exists = cursor.fetchone()

        if exists:
            print(f"✅ La base de datos '{database}' ya existe.")
        else:
            print(f"🔧 Creando base de datos '{database}'...")
            cursor.execute(f"CREATE DATABASE {database}")
            print(f"✅ Base de datos '{database}' creada exitosamente!")

        cursor.close()
        conn.close()

        # Probar conexión a la nueva base de datos
        conn = psycopg2.connect(
            host=host, port=port, user=user, password=password, database=database
        )
        cursor = conn.cursor()
        cursor.execute("SELECT version()")
        version = cursor.fetchone()
        print(f"✅ Conexión a '{database}' exitosa!")
        print(f"📊 Versión de PostgreSQL: {version[0]}")

        cursor.close()
        conn.close()

        return True

    except psycopg2.OperationalError as e:
        print(f"❌ Error de conexión a PostgreSQL: {e}")
        print("\n📋 Pasos para solucionar:")
        print("1. Asegúrate de que PostgreSQL esté instalado y corriendo")
        print("2. Verifica las credenciales (usuario: postgres, contraseña)")
        print("3. Confirma que el puerto 5432 esté disponible")
        print(
            "4. En Windows: Busca 'Services' y verifica que 'PostgreSQL' esté corriendo"
        )
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False


if __name__ == "__main__":
    print("🚀 Script de verificación de PostgreSQL para SKYNET 2.0")
    print("=" * 50)
    success = check_and_create_database()

    if success:
        print("\n🎉 ¡Listo! Ya puedes usar la aplicación FastAPI.")
        print("💡 Ejecuta: python -m uvicorn app.main:app --reload")
    else:
        print("\n❌ No se pudo establecer la conexión. Revisa la configuración.")
