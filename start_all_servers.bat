@echo off
echo 🚀 Iniciando servidores para SKYNET 2.0
echo.
echo ⚡ Backend (puerto 8002)
start cmd /k "cd /d \"c:\SOFTWARE\SKYNET 2.0\gestor_hr_v2\" && python start_backend.py"
timeout /t 3 /nobreak > nul

echo ⚡ Frontend (puerto 3000)
start cmd /k "cd /d \"c:\SOFTWARE\SKYNET 2.0\gestor_hr_v2\frontend\" && python -m http.server 3000"
timeout /t 2 /nobreak > nul

echo.
echo ✅ Servidores iniciados!
echo 🌐 Ve a: http://localhost:3000
echo 📊 API: http://localhost:8002
echo.
echo 🔐 Credenciales:
echo    Usuario: admin
echo    Contraseña: 123456
pause
