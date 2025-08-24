-- Script para crear la base de datos y usuario para el proyecto HR
-- Ejecutar este script como superusuario (postgres)

-- Crear la base de datos usando template0 para evitar problemas de collation
CREATE DATABASE gestor_hr_db
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    TEMPLATE = template0;

-- Crear usuario para la aplicación (opcional, por seguridad)
CREATE USER hr_user WITH PASSWORD 'hr_password_123';

-- Dar permisos al usuario
GRANT ALL PRIVILEGES ON DATABASE gestor_hr_db TO hr_user;

-- Mostrar las bases de datos disponibles
\l
