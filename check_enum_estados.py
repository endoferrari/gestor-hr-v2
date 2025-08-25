#!/usr/bin/env python3

from sqlalchemy import text

from app.db.session import SessionLocal


def main():
    db = SessionLocal()
    try:
        print("🔍 Consultando información del enum estadohabitacion...")

        # Consultar información del enum
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

        print("\n🔍 Consultando habitaciones directamente...")
        try:
            result = db.execute(text("SELECT numero, estado FROM habitaciones LIMIT 3"))
            print("✅ Habitaciones encontradas:")
            for row in result:
                print(f"  🏠 Habitación {row[0]}: estado='{row[1]}'")
        except Exception as e:
            print(f"❌ Error consultando habitaciones: {e}")

    except Exception as e:
        print(f"❌ Error general: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
