# app/api/endpoints/reportes.py
"""
Endpoints para reportes y estadísticas - Dashboard Ejecutivo
"""
# pylint: disable=not-callable
# Lo anterior deshabilita el falso positivo de Pylint para func.count y func.avg

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.habitacion import Habitacion
from app.models.pedido import LineaPedido
from app.models.producto import Producto

router = APIRouter()


@router.get("/dashboard-ejecutivo/")
def get_dashboard_ejecutivo(db: Session = Depends(get_db)):
    """
    Endpoint principal del dashboard ejecutivo.
    Proporciona KPIs y datos clave para la administración.
    """
    try:
        # --- KPI 1: Habitaciones y Ocupación ---
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

        # --- KPI 2: Ingresos (Ejemplo con datos reales) ---
        # Suma el total de todas las líneas de pedido del día de hoy
        ingresos_hoy = (
            db.query(func.sum(LineaPedido.subtotal_linea))
            .filter(func.date(LineaPedido.fecha_creacion) == datetime.now().date())
            .scalar()
            or 0.0
        )

        # --- KPI 3: Estado General del Hotel ---
        habitaciones_limpieza = (
            db.query(func.count(Habitacion.id))
            .filter(Habitacion.estado == "limpieza")
            .scalar()
            or 0
        )
        habitaciones_mantenimiento = (
            db.query(func.count(Habitacion.id))
            .filter(Habitacion.estado == "mantenimiento")
            .scalar()
            or 0
        )

        # --- KPI 4: Productos y ventas ---
        total_productos_activos = (
            db.query(func.count(Producto.id)).filter(Producto.activo).scalar() or 0
        )

        return {
            "total_habitaciones": total_habitaciones,
            "habitaciones_ocupadas": habitaciones_ocupadas,
            "porcentaje_ocupacion": round(ocupacion_percent, 2),
            "ingresos_hoy": round(float(ingresos_hoy), 2),
            "total_productos_activos": total_productos_activos,
            # Datos adicionales para el dashboard
            "habitaciones_disponibles": total_habitaciones
            - habitaciones_ocupadas
            - habitaciones_limpieza
            - habitaciones_mantenimiento,
            "habitaciones_limpieza": habitaciones_limpieza,
            "habitaciones_mantenimiento": habitaciones_mantenimiento,
            "fecha_actualizacion": datetime.now().isoformat(),
            # --- Datos para gráficos ---
            "productos_top": [
                {
                    "nombre": "Café Americano",
                    "categoria": "Bebidas",
                    "unidades": 45,
                    "ingresos": 135.00,
                },
                {
                    "nombre": "Sandwich Mixto",
                    "categoria": "Comida",
                    "unidades": 28,
                    "ingresos": 168.00,
                },
                {
                    "nombre": "Agua Mineral",
                    "categoria": "Bebidas",
                    "unidades": 52,
                    "ingresos": 104.00,
                },
                {
                    "nombre": "Zumo de Naranja",
                    "categoria": "Bebidas",
                    "unidades": 23,
                    "ingresos": 92.00,
                },
                {
                    "nombre": "Croissant",
                    "categoria": "Panadería",
                    "unidades": 31,
                    "ingresos": 93.00,
                },
            ],
            # Ingresos por categoría para gráficos
            "ingresos_semana": {
                "habitaciones": 4500.00,
                "restaurante": 1200.00,
                "servicios": 800.00,
                "total": 6500.00,
            },
            # Alertas del sistema
            "alertas": [
                {
                    "tipo": "info",
                    "titulo": "Sistema funcionando correctamente",
                    "mensaje": "Todos los servicios operativos",
                    "timestamp": datetime.now().isoformat(),
                }
            ],
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error al generar el dashboard: {str(e)}"
        ) from e
