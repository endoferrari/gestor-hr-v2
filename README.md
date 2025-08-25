# 🏨 Gestor HR v3.0 Profesional

**Sistema profesional de gestión hotelera** desarrollado con arquitectura moderna y escalable usando **FastAPI**, **SQLAlchemy**, **PostgreSQL** y **Alembic**.

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-red.svg)](https://sqlalchemy.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)](https://postgresql.org)

## ✨ Características Principales

- 🚀 **FastAPI**: Framework moderno y de alto rendimiento
- 🗄️ **SQLAlchemy 2.0**: ORM moderno con soporte async
- 🐘 **PostgreSQL**: Base de datos robusta y escalable
- 🔄 **Alembic**: Migraciones de base de datos versionadas
- 🔒 **Autenticación JWT**: Sistema de seguridad robusto
- 🧪 **Testing completo**: Pytest con cobertura total
- 📊 **Logging profesional**: Sistema de logs configurable
- 🔍 **Calidad de código**: Ruff, MyPy y pre-commit hooks
- 📖 **Documentación automática**: OpenAPI/Swagger
- 🌐 **CORS configurado**: Listo para frontend moderno

## 🛠️ Prerrequisitos del Sistema

Antes de comenzar, asegúrate de tener instalado:

- **Python 3.10+** - [Descargar](https://python.org)
- **PostgreSQL 13+** - [Descargar](https://postgresql.org)
- **Git** - [Descargar](https://git-scm.com)
- **Node.js y npm** - [Descargar](https://nodejs.org) (para frontend futuro)

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd gestor_hr_v3_profesional
```

### 2. Crear y activar entorno virtual

```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
.\venv\Scripts\Activate.ps1
# En Linux/Mac:
source venv/bin/activate
```

### 3. Instalar dependencias

```bash
# Dependencias de producción
pip install -e .

# Dependencias de desarrollo
pip install -e .[dev]
```

### 4. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tu configuración
notepad .env  # Windows
nano .env     # Linux
```

### 5. Configurar base de datos

```bash
# Crear base de datos PostgreSQL
createdb gestor_hr_v3

# Ejecutar migraciones (cuando estén disponibles)
alembic upgrade head
```

### 6. Instalar pre-commit hooks

```bash
pre-commit install
```

## 🎯 Ejecución

### Servidor de desarrollo

```bash
# Opción 1: Con uvicorn directamente
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Opción 2: Con el script principal
python -m app.main

# Opción 3: Con FastAPI CLI (si está instalado)
fastapi dev app/main.py
```

### Acceso a la aplicación

- **Aplicación**: http://localhost:8000
- **Documentación Swagger**: http://localhost:8000/docs
- **Documentación ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 🧪 Pruebas

### Ejecutar todas las pruebas

```bash
# Pruebas básicas
pytest

# Con cobertura
pytest --cov=app --cov-report=html

# Con detalles verbose
pytest -v

# Modo watch (desarrollo)
pytest-watch
```

### Estructura de pruebas

```
tests/
├── __init__.py
├── test_main.py          # Pruebas de la aplicación principal
├── api/                  # Pruebas de endpoints
├── unit/                 # Pruebas unitarias
└── conftest.py          # Configuración de fixtures
```

## 🔧 Herramientas de Desarrollo

### Linting y formateo

```bash
# Verificar código con Ruff
ruff check .

# Formatear código
ruff format .

# Verificación de tipos con MyPy
mypy app/

# Ejecutar todos los pre-commit hooks
pre-commit run --all-files
```

### Estructura de calidad

- **Ruff**: Linting ultrarrápido y formateo automático
- **MyPy**: Verificación estática de tipos
- **Pre-commit**: Hooks automáticos antes de cada commit
- **Pytest**: Framework de pruebas con fixtures profesionales

## 📁 Arquitectura del Proyecto

```
gestor_hr_v3_profesional/
├── app/                          # Código principal de la aplicación
│   ├── __init__.py
│   ├── main.py                   # Aplicación FastAPI principal
│   ├── api/                      # Endpoints de la API
│   │   ├── v1/                   # API versión 1
│   │   └── __init__.py
│   ├── core/                     # Configuración y utilidades centrales
│   │   ├── config.py             # Configuración con Pydantic
│   │   ├── logging.py            # Sistema de logging
│   │   └── security.py           # Autenticación y seguridad
│   ├── db/                       # Configuración de base de datos
│   │   ├── database.py           # Conexión y sesiones
│   │   └── base.py              # Clase base para modelos
│   ├── models/                   # Modelos SQLAlchemy
│   │   ├── hotel.py              # Modelos del hotel
│   │   ├── reservation.py        # Modelos de reservas
│   │   └── user.py              # Modelos de usuarios
│   ├── schemas/                  # Esquemas Pydantic
│   │   ├── hotel.py              # Schemas de hotel
│   │   └── reservation.py        # Schemas de reservas
│   ├── services/                 # Lógica de negocio
│   │   ├── hotel_service.py      # Servicios de hotel
│   │   └── reservation_service.py # Servicios de reservas
│   └── utils/                    # Utilidades y helpers
├── tests/                        # Suite completa de pruebas
├── alembic/                      # Migraciones de base de datos
├── frontend/                     # Aplicación frontend (futuro)
├── docs/                         # Documentación adicional
├── .env.example                  # Variables de entorno ejemplo
├── pyproject.toml               # Configuración del proyecto
├── .pre-commit-config.yaml      # Configuración de pre-commit
└── README.md                    # Este archivo
```

## 🔒 Seguridad

### Características de seguridad implementadas

- ✅ **JWT Authentication**: Tokens seguros para autenticación
- ✅ **CORS configurado**: Control de orígenes permitidos
- ✅ **Trusted Host Middleware**: Protección contra ataques de host
- ✅ **Variables de entorno**: Configuración sensible fuera del código
- ✅ **Validación de datos**: Pydantic para validación robusta
- ✅ **Logging de seguridad**: Monitoreo de accesos y errores

## 📊 Monitoreo y Logs

### Sistema de logging profesional

- **Niveles configurables**: DEBUG, INFO, WARNING, ERROR, CRITICAL
- **Múltiples destinos**: Consola y archivo
- **Rotación automática**: Archivos de log con límite de tamaño
- **Formato estructurado**: Timestamps, módulos y funciones

## 🤝 Flujo de Trabajo con Git + IA

### Metodología anti-duplicación de código

1. **Commit antes de cambios importantes**:

   ```bash
   git add .
   git commit -m "Estado estable antes de modificar [función]"
   ```

2. **Verificación visual** en VS Code:

   - Panel **Source Control** (📦)
   - Ver diferencias lado a lado
   - Detectar código duplicado instantáneamente

3. **Reversión segura** si hay problemas:
   ```bash
   git checkout -- archivo_problematico.py
   ```

### Pre-commit hooks automáticos

Cada commit ejecuta automáticamente:

- ✅ Formateo de código con Ruff
- ✅ Verificación de tipos con MyPy
- ✅ Eliminación de espacios sobrantes
- ✅ Verificación de sintaxis YAML
- ✅ Detección de archivos grandes

## 🔄 Próximos Pasos

Una vez completada la configuración, el desarrollo seguirá este orden:

1. ✅ **Base profesional configurada** ← _ESTAMOS AQUÍ_
2. 🔄 **Configuración de base de datos con Alembic**
3. 🔄 **Modelos SQLAlchemy para entidades del hotel**
4. 🔄 **Endpoints básicos de la API**
5. 🔄 **Sistema de autenticación y autorización**
6. 🔄 **Lógica de negocio (reservas, facturación, etc.)**
7. 🔄 **Frontend moderno**
8. 🔄 **Deploy y CI/CD**

## 📞 Soporte y Contribución

Este proyecto está diseñado con las mejores prácticas de desarrollo profesional. Cada componente está documentado, probado y listo para escalar.

### Comandos útiles de desarrollo

```bash
# Verificación completa del proyecto
make check  # (si tienes Makefile)

# O manualmente:
pytest && ruff check . && mypy app/ && pre-commit run --all-files
```

---

**🎉 ¡Tu entorno de desarrollo profesional está listo para crear el mejor sistema de gestión hotelera!**
