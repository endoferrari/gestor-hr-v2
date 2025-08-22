# Gestor HR v2.0 🏨

Sistema moderno de gestión hotelera desarrollado con **FastAPI**, **SQLAlchemy** y **PostgreSQL**.

## ✨ Características

- 🚀 **FastAPI**: Framework moderno y de alto rendimiento
- 🗄️ **SQLAlchemy**: ORM robusto para Python
- 🐘 **PostgreSQL**: Base de datos robusta y escalable
- 🔍 **Ruff**: Linter y formateador ultrarrápido
- 🧪 **Pytest**: Framework de pruebas completo
- 🔒 **MyPy**: Verificación estática de tipos
- 🎯 **Pre-commit**: Hooks automáticos de calidad
- 📖 **Documentación automática**: Swagger UI y ReDoc

## 🛠️ Configuración del Entorno de Desarrollo

### Prerrequisitos

- Python 3.10+
- PostgreSQL
- Git
- Node.js y npm

### Instalación

1. **Clona el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd gestor_hr_v2
   ```

2. **Crea y activa el entorno virtual**
   ```bash
   python -m venv venv
   .\venv\Scripts\Activate.ps1  # Windows PowerShell
   ```

3. **Instala las dependencias**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configura las variables de entorno**
   ```bash
   cp .env.example .env
   # Edita el archivo .env con tu configuración
   ```

5. **Configura pre-commit**
   ```bash
   pre-commit install
   ```

## 🚀 Ejecución

### Servidor de desarrollo

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Acceso a la documentación

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Pruebas

```bash
# Ejecutar todas las pruebas
pytest

# Ejecutar con cobertura
pytest --cov=app

# Modo watch (recarga automática)
pytest-watch
```

## 🔧 Herramientas de Desarrollo

### Linting y formateo

```bash
# Verificar código
ruff check .

# Formatear código
ruff format .

# MyPy - verificación de tipos
mypy app/
```

### Pre-commit hooks

Los hooks se ejecutan automáticamente antes de cada commit para mantener la calidad del código.

## 📁 Estructura del Proyecto

```
gestor_hr_v2/
├── app/
│   ├── __init__.py
│   ├── main.py              # Aplicación principal
│   ├── api/                 # Endpoints de la API
│   ├── core/                # Configuración y utilidades
│   │   └── config.py
│   ├── db/                  # Configuración de base de datos
│   ├── models/              # Modelos SQLAlchemy
│   ├── schemas/             # Esquemas Pydantic
│   └── services/            # Lógica de negocio
├── tests/                   # Pruebas
├── frontend/                # Aplicación frontend
├── venv/                    # Entorno virtual
├── .env.example             # Variables de entorno ejemplo
├── .gitignore
├── pyproject.toml           # Configuración del proyecto
├── .pre-commit-config.yaml  # Configuración de pre-commit
└── README.md
```

## 🤝 Flujo de Trabajo con Git + IA

Para evitar problemas de código duplicado al trabajar con asistentes de IA:

1. **Haz commit antes de cambios importantes**
   ```bash
   git add .
   git commit -m "Antes de refactorizar función X"
   ```

2. **Verifica cambios visualmente** en VS Code (panel Source Control 📦)

3. **Revierte si es necesario**
   ```bash
   # Para descartar cambios problemáticos
   git checkout -- nombre_del_archivo.py
   ```

## 🌟 Próximos Pasos

Una vez completada la configuración, los siguientes pasos serán:

1. ✅ Configurar conexión a PostgreSQL
2. ✅ Crear modelos de base de datos
3. ✅ Implementar endpoints básicos
4. ✅ Añadir autenticación y autorización
5. ✅ Crear frontend con el framework elegido

---

**¡Tu entorno de desarrollo profesional está listo! 🎉**
