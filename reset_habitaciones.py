# reset_habitaciones.py
from sqlalchemy.orm import sessionmaker
from app.db.database import engine
from app.models.habitacion import Habitacion, EstadoHabitacion
from app.models.hospedaje import Hospedaje
from app.models.huesped import Huesped

# Configuración de la sesión de la base de datos
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def reset_database_state():
    """
    Elimina todos los registros de hospedajes y huéspedes,
    y resetea el estado de todas las habitaciones a 'disponible'.
    """
    db = SessionLocal()
    try:
        print("Iniciando reseteo de la base de datos...")

        # 1. Eliminar todos los registros de hospedajes
        num_hospedajes = db.query(Hospedaje).delete()
        print(f"-> {num_hospedajes} registros de 'hospedajes' eliminados.")

        # 2. Eliminar todos los registros de huéspedes
        num_huespedes = db.query(Huesped).delete()
        print(f"-> {num_huespedes} registros de 'huespedes' eliminados.")

        # 3. Actualizar todas las habitaciones a 'disponible'
        num_habitaciones = db.query(Habitacion).update(
            {"estado": EstadoHabitacion.DISPONIBLE}
        )
        print(f"-> {num_habitaciones} habitaciones actualizadas a 'disponible'.")

        # 4. Guardar los cambios
        db.commit()
        print("\n✅ ¡Reseteo completado! Todas las habitaciones están disponibles.")

    except Exception as e:
        print(f"\n❌ Ocurrió un error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    reset_database_state()
