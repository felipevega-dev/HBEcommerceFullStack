@echo off
REM ─── Setup Verification Script (Windows) ──────────────────────────────────────
REM Verifica que todo esté configurado correctamente antes de desplegar

setlocal enabledelayedexpansion
set ERRORS=0
set WARNINGS=0

echo 🔍 Verificando configuración de Harry's Boutique...
echo.

REM Check Docker
echo 📦 Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Docker instalado
    docker info >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ Docker corriendo
    ) else (
        echo ✗ Docker no está corriendo. Inicia Docker Desktop.
        set /a ERRORS+=1
    )
) else (
    echo ✗ Docker no instalado. Instala Docker Desktop.
    set /a ERRORS+=1
)

REM Check Docker Compose
docker-compose --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Docker Compose instalado
) else (
    echo ✗ Docker Compose no instalado
    set /a ERRORS+=1
)

echo.

REM Check Node.js
echo 📦 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✓ Node.js instalado (!NODE_VERSION!)
) else (
    echo ✗ Node.js no instalado
    set /a ERRORS+=1
)

REM Check npm
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✓ npm instalado (!NPM_VERSION!)
) else (
    echo ✗ npm no instalado
    set /a ERRORS+=1
)

echo.

REM Check .env file
echo 🔐 Verificando variables de entorno...
if exist .env (
    echo ✓ .env existe
    
    REM Check required variables
    findstr /B "DATABASE_URL=" .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ DATABASE_URL configurado
    ) else (
        echo ⚠ DATABASE_URL no encontrado en .env
        set /a WARNINGS+=1
    )
    
    findstr /B "NEXTAUTH_SECRET=" .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ NEXTAUTH_SECRET configurado
    ) else (
        echo ⚠ NEXTAUTH_SECRET no encontrado en .env
        set /a WARNINGS+=1
    )
    
    findstr /B "BLOB_READ_WRITE_TOKEN=" .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ BLOB_READ_WRITE_TOKEN configurado
    ) else (
        echo ⚠ BLOB_READ_WRITE_TOKEN no encontrado en .env
        set /a WARNINGS+=1
    )
) else (
    echo ✗ .env no existe. Copia .env.example a .env
    set /a ERRORS+=1
)

echo.

REM Check package.json
echo 📦 Verificando dependencias...
if exist package.json (
    echo ✓ package.json existe
    
    if exist node_modules (
        echo ✓ node_modules existe
    ) else (
        echo ⚠ node_modules no existe. Ejecuta: npm install
        set /a WARNINGS+=1
    )
) else (
    echo ✗ package.json no encontrado
    set /a ERRORS+=1
)

echo.

REM Check Prisma
echo 🗄️ Verificando Prisma...
if exist prisma (
    echo ✓ Directorio prisma/ existe
    
    if exist prisma\schema.prisma (
        echo ✓ schema.prisma existe
    ) else (
        echo ✗ schema.prisma no encontrado
        set /a ERRORS+=1
    )
    
    if exist node_modules\.prisma (
        echo ✓ Prisma Client generado
    ) else (
        echo ⚠ Prisma Client no generado. Ejecuta: npm run db:generate
        set /a WARNINGS+=1
    )
) else (
    echo ✗ Directorio prisma/ no encontrado
    set /a ERRORS+=1
)

echo.

REM Check Docker files
echo 🐳 Verificando archivos Docker...
if exist Dockerfile (
    echo ✓ Dockerfile existe
) else (
    echo ✗ Dockerfile no encontrado
    set /a ERRORS+=1
)

if exist docker-compose.yml (
    echo ✓ docker-compose.yml existe
) else (
    echo ✗ docker-compose.yml no encontrado
    set /a ERRORS+=1
)

if exist .dockerignore (
    echo ✓ .dockerignore existe
) else (
    echo ⚠ .dockerignore no encontrado (opcional)
    set /a WARNINGS+=1
)

echo.

REM Check Git
echo 📝 Verificando Git...
git --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Git instalado
    
    if exist .git (
        echo ✓ Repositorio Git inicializado
        
        git status --porcelain >nul 2>&1
        if %errorlevel% equ 0 (
            echo ✓ Git funcionando correctamente
        )
    ) else (
        echo ⚠ No es un repositorio Git
        set /a WARNINGS+=1
    )
) else (
    echo ✗ Git no instalado
    set /a ERRORS+=1
)

echo.

REM Summary
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

if %ERRORS% equ 0 (
    if %WARNINGS% equ 0 (
        echo ✓ Todo está configurado correctamente!
        echo.
        echo Próximos pasos:
        echo   1. Iniciar servicios: docker-compose up -d
        echo   2. Ver logs: docker-compose logs -f app
        echo   3. Acceder a: http://localhost:3000
    ) else (
        echo ⚠ Configuración completa con %WARNINGS% advertencias
        echo.
        echo Puedes continuar, pero revisa las advertencias arriba.
    )
) else (
    echo ✗ Encontrados %ERRORS% errores y %WARNINGS% advertencias
    echo.
    echo Por favor, corrige los errores antes de continuar.
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

pause
exit /b %ERRORS%
