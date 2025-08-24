#!/usr/bin/env python3
"""
Script de utilidades para Ruff - Linting y formateo de código
"""

from pathlib import Path
import subprocess
import sys


def run_command(cmd: str, description: str) -> bool:
    """Ejecuta un comando y retorna True si fue exitoso."""
    print(f"🔍 {description}...")

    # Lista de comandos seguros permitidos
    safe_commands = [
        "ruff check .",
        "ruff check --fix .",
        "ruff format .",
        "ruff check --fix --unsafe-fixes .",
    ]

    if cmd not in safe_commands:
        print(f"❌ Comando no permitido por seguridad: {cmd}")
        return False

    try:
        result = subprocess.run(cmd.split(), capture_output=True, text=True, check=True)  # noqa: S603
        if result.stdout.strip():
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e}")
        if e.stdout:
            print(f"Stdout: {e.stdout}")
        if e.stderr:
            print(f"Stderr: {e.stderr}")
        return False


def main():
    """Función principal del script."""
    project_root = Path(__file__).parent
    print(f"📂 Trabajando en: {project_root}")

    # Cambiar al directorio del proyecto
    import os

    os.chdir(project_root)

    if len(sys.argv) < 2:
        print("🔧 Uso: python ruff_tools.py <comando>")
        print("📝 Comandos disponibles:")
        print("   check    - Analizar código sin arreglar")
        print("   fix      - Analizar y arreglar automáticamente")
        print("   format   - Formatear código")
        print("   all      - Ejecutar check, fix y format")
        print("   unsafe   - Aplicar correcciones inseguras también")
        return

    command = sys.argv[1].lower()

    if command == "check":
        success = run_command("ruff check .", "Analizando código")

    elif command == "fix":
        success = run_command("ruff check --fix .", "Analizando y arreglando código")

    elif command == "format":
        success = run_command("ruff format .", "Formateando código")

    elif command == "unsafe":
        success = run_command(
            "ruff check --fix --unsafe-fixes .", "Aplicando correcciones inseguras"
        )

    elif command == "all":
        print("🚀 Ejecutando análisis completo...")
        success1 = run_command("ruff check --fix .", "Analizando y arreglando")
        success2 = run_command("ruff format .", "Formateando código")
        success3 = run_command("ruff check .", "Verificación final")
        success = success1 and success2 and success3

    else:
        print(f"❌ Comando desconocido: {command}")
        return

    if success:
        print("✅ ¡Todas las operaciones completadas exitosamente!")
    else:
        print("❌ Algunas operaciones fallaron")
        sys.exit(1)


if __name__ == "__main__":
    main()
