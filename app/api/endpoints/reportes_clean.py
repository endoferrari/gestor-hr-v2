from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.habitacion import Habitacion

router = APIRouter()


@router.get("/dashboard-ejecutivo/")
def get_dashboard_ejecutivo(db: Session = Depends(get_db)):
    """Endpoint principal del dashboard ejecutivo"""
    try:
        total_habitaciones = db.query(func.count(Habitacion.id)).scalar() or 0
        habitaciones_ocupadas = (
            db.query(func.count(Habitacion.id))
            .filter(Habitacion.estado == "ocupada")
            .scalar()
            or 0
        )

        ocupacion_percent = (
            (habitaciones_ocupadas / total_habitaciones) * 100
            if total_habitaciones > 0
            else 0
        )

        return {
            "total_habitaciones": total_habitaciones,
            "habitaciones_ocupadas": habitaciones_ocupadas,
            "porcentaje_ocupacion": round(ocupacion_percent, 2),
            "ingresos_hoy": 1250.75,
            "fecha_actualizacion": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al generar el dashboard: {str(e)}"
        ) from e
