#!/usr/bin/env python3
"""
Script simple para iniciar el servidor FastAPI
"""

import sys
from pathlib import Path

# Añadir el directorio actual al path de Python
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

if __name__ == "__main__":
    import uvicorn
    from app.main import app

    print("Iniciando servidor FastAPI en http://localhost:8000")
    print("CORS habilitado para http://localhost:3000")

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
