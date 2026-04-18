@echo off
REM ─── Quick Start Script for Local Development (Windows) ──────────────────────
REM Usage: start-local.bat

echo 🚀 Starting Harry's Boutique...

REM Check if .env exists
if not exist .env (
    echo ⚠️  .env file not found. Copying from .env.example...
    copy .env.example .env
    echo ✅ Created .env file. Please edit it with your credentials.
    echo.
    echo Required variables:
    echo   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32^)
    echo   - BLOB_READ_WRITE_TOKEN (get from Vercel Dashboard^)
    echo   - MERCADOPAGO_ACCESS_TOKEN
    echo   - RESEND_API_KEY
    echo.
    pause
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

echo 🐳 Starting Docker containers...
docker-compose up -d

echo.
echo ⏳ Waiting for services to be ready...
timeout /t 5 /nobreak >nul

echo.
echo ✅ Services started successfully!
echo.
echo 📍 Access your application:
echo    🌐 App:      http://localhost:3000
echo    👨‍💼 Admin:    http://localhost:3000/admin
echo    🏥 Health:   http://localhost:3000/api/health
echo.
echo 📊 View logs:
echo    docker-compose logs -f app
echo.
echo 🛑 Stop services:
echo    docker-compose down
echo.
pause
