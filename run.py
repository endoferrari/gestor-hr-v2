#!/usr/bin/env python3
"""
Archivo de inicio para el servidor FastAPI
"""

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
