# 🧬 Guía de Migraciones con Alembic

## Comandos Básicos de Alembic

### 📊 **Estado y Historial**

```bash
# Ver migración actual
alembic current

# Ver historial de migraciones
alembic history

# Ver historial detallado
alembic history --verbose

# Ver diferencias pendientes
alembic show head
```

### 🔄 **Crear y Aplicar Migraciones**

```bash
# Generar migración automática (detecta cambios en modelos)
alembic revision --autogenerate -m "Descripción del cambio"

# Crear migración manual vacía
alembic revision -m "Descripción del cambio"

# Aplicar todas las migraciones pendientes
alembic upgrade head

# Aplicar hasta una migración específica
alembic upgrade <revision_id>

# Retroceder una migración
alembic downgrade -1

# Retroceder hasta una migración específica
alembic downgrade <revision_id>
```

### 🔧 **Comandos Avanzados**

```bash
# Generar SQL sin aplicar (útil para revisión)
alembic upgrade head --sql

# Marcar migración como aplicada sin ejecutarla (peligroso)
alembic stamp head

# Ver diferencias entre actual y objetivo
alembic diff
```

## 📋 **Flujo de Trabajo Típico**

### 1. **Modificar Modelo**

```python
# app/models/habitacion.py
class Habitacion(Base):
    # ... campos existentes ...
    nuevo_campo: Mapped[str] = mapped_column(String(100), nullable=True)
```

### 2. **Generar Migración**

```bash
alembic revision --autogenerate -m "Agregar nuevo_campo a habitaciones"
```

### 3. **Revisar Migración Generada**

```python
# alembic/versions/xxx_agregar_nuevo_campo.py
def upgrade() -> None:
    op.add_column('habitaciones', sa.Column('nuevo_campo', sa.String(100), nullable=True))

def downgrade() -> None:
    op.drop_column('habitaciones', 'nuevo_campo')
```

### 4. **Aplicar Migración**

```bash
alembic upgrade head
```

## ⚠️ **Mejores Prácticas**

### ✅ **Hacer**

- Siempre revisar las migraciones generadas antes de aplicarlas
- Usar nombres descriptivos para las migraciones
- Mantener el historial de migraciones en el control de versiones
- Hacer backup de la base de datos antes de migraciones importantes
- Probar migraciones en desarrollo antes de producción

### ❌ **No Hacer**

- No editar migraciones ya aplicadas en producción
- No usar `stamp` a menos que sepas exactamente qué hace
- No hacer downgrade en producción sin extrema precaución
- No modificar directamente la base de datos sin migración

## 🏗️ **Estado Actual del Sistema**

### Migraciones Aplicadas:

1. **aef86e3a39de** - Crear tablas iniciales (usuarios, hospedajes)
2. **414d25e789d9** - Agregar tablas de habitaciones, productos, pedidos y tarifas
3. **7848d470c270** - Agregar campo servicio_lavanderia a habitaciones

### Tablas Creadas:

- `usuarios` - Empleados y administradores
- `hospedajes` - Registro de estancias
- `habitaciones` - Inventario de habitaciones con servicios
- `productos` - Catálogo de productos y servicios
- `pedidos` - Pedidos realizados por huéspedes
- `lineas_pedido` - Detalles de cada pedido
- `tarifas` - Sistema de precios por tipo de habitación

## 🚀 **Ejemplo de Uso Completo**

```bash
# 1. Verificar estado actual
alembic current

# 2. Hacer cambios en modelos
# ... editar app/models/habitacion.py ...

# 3. Generar migración
alembic revision --autogenerate -m "Agregar campo permite_mascotas"

# 4. Revisar migración generada
# ... revisar archivo en alembic/versions/ ...

# 5. Aplicar migración
alembic upgrade head

# 6. Verificar aplicación
alembic current
alembic history
```

## 📁 **Estructura de Archivos**

```
alembic/
├── env.py                    # Configuración de Alembic
├── script.py.mako           # Plantilla para nuevas migraciones
├── alembic.ini              # Configuración principal
└── versions/                # Migraciones
    ├── aef86e3a39de_crear_tablas_iniciales.py
    ├── 414d25e789d9_agregar_tablas_de_habitaciones_.py
    └── 7848d470c270_agregar_campo_servicio_lavanderia_a_.py
```

Esta configuración garantiza que cualquier cambio en los modelos sea gestionado de forma segura y versionada.
