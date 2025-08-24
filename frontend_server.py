#!/usr/bin/env python3
"""
Servidor HTTP simple para servir el frontend
"""

import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

# Cambiar al directorio del frontend
frontend_dir = Path(__file__).parent / "frontend"
os.chdir(frontend_dir)

PORT = 3000


class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Agregar headers CORS
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header(
            "Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE"
        )
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()


def start_server():
    try:
        with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
            print(f"🚀 Servidor frontend iniciado en http://localhost:{PORT}")
            print(f"📁 Sirviendo archivos desde: {frontend_dir}")
            print("💡 Presiona Ctrl+C para detener el servidor")

            # Abrir en el navegador automáticamente
            webbrowser.open(f"http://localhost:{PORT}")

            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Servidor detenido")
    except OSError as e:
        if e.errno == 10048:  # Puerto en uso
            print(f"❌ El puerto {PORT} ya está en uso. Intenta con otro puerto.")
        else:
            print(f"❌ Error al iniciar el servidor: {e}")


if __name__ == "__main__":
    start_server()
