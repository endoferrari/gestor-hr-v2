#!/usr/bin/env python3

from sqlalchemy import text

from app.db.session import SessionLocal
from app.models.habitacion import Habitacion


def main():
    db = SessionLocal()
    try:
        print("🔍 Verificando estados de habitaciones...")

        # Consultar algunas habitaciones
        habitaciones = db.query(Habitacion).limit(5).all()
        if habitaciones:
            print("\n📋 Estados actuales:")
            for h in habitaciones:
                print(
                    f"  🏠 Habitación {h.numero}: estado='{h.estado}' tipo='{h.tipo}'"
                )
        else:
            print("❌ No hay habitaciones en la base de datos")

        # Consultar información del enum
        print("\n🔧 Consultando información del enum estadohabitacion...")
        try:
            result = db.execute(
                text("""
                SELECT e.enumlabel
                FROM pg_type t
                JOIN pg_enum e ON t.oid = e.enumtypid
                WHERE t.typname = 'estadohabitacion'
                ORDER BY e.enumsortorder;
            """)
            )
            print("✅ Valores válidos del enum estadohabitacion:")
            for row in result:
                print(f"  - '{row[0]}'")
        except Exception as e:
            print(f"❌ Error consultando enum: {e}")

    except Exception as e:
        print(f"❌ Error general: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
