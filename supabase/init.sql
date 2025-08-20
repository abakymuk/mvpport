-- Инициализация базы данных для MVP Port
-- Этот файл выполняется при первом запуске PostgreSQL контейнера

-- Создание расширений
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Создание схемы для приложения
CREATE SCHEMA IF NOT EXISTS app;

-- Установка поиска по умолчанию
SET search_path TO app, public;

-- Комментарий к базе данных
COMMENT ON DATABASE app_db IS 'База данных для MVP Port приложения';

-- Создание пользователя для приложения (опционально)
-- CREATE USER app_user WITH PASSWORD 'app_password';
-- GRANT ALL PRIVILEGES ON DATABASE app_db TO app_user;
-- GRANT ALL PRIVILEGES ON SCHEMA app TO app_user;
