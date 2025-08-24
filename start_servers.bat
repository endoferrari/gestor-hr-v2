@echo off
echo Iniciando backend y frontend para pruebas E2E...

REM Terminar procesos existentes en los puertos
echo Terminando procesos existentes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8002') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /F /PID %%a 2>nul

echo.
echo Iniciando backend en puerto 8002...
start "Backend" cmd /c "python run.py && pause"

echo Esperando 5 segundos...
timeout /t 5 /nobreak >nul

echo.
echo Iniciando frontend en puerto 3000...
start "Frontend" cmd /c "python -m http.server 3000 --directory frontend && pause"

echo.
echo Esperando 3 segundos adicionales...
timeout /t 3 /nobreak >nul

echo.
echo Verificando servidores...
python check_servers.py

echo.
echo ¡Listo! Los servidores deberían estar funcionando.
echo Backend: http://localhost:8002
echo Frontend: http://localhost:3000
