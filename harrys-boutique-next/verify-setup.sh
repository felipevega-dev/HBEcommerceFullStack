#!/bin/bash

# ─── Setup Verification Script ────────────────────────────────────────────────
# Verifica que todo esté configurado correctamente antes de desplegar

set -e

echo "🔍 Verificando configuración de Harry's Boutique..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        ((ERRORS++))
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

# Check Docker
echo "📦 Verificando Docker..."
if command_exists docker; then
    print_status 0 "Docker instalado"
    if docker info >/dev/null 2>&1; then
        print_status 0 "Docker corriendo"
    else
        print_status 1 "Docker no está corriendo. Inicia Docker Desktop."
    fi
else
    print_status 1 "Docker no instalado. Instala Docker Desktop."
fi

# Check Docker Compose
if command_exists docker-compose; then
    print_status 0 "Docker Compose instalado"
else
    print_status 1 "Docker Compose no instalado"
fi

echo ""

# Check Node.js
echo "📦 Verificando Node.js..."
if command_exists node; then
    NODE_VERSION=$(node -v)
    print_status 0 "Node.js instalado ($NODE_VERSION)"
    
    # Check if version is >= 20
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -ge 20 ]; then
        print_status 0 "Versión de Node.js correcta (>= 20)"
    else
        print_warning "Versión de Node.js < 20. Se recomienda Node.js 20+"
    fi
else
    print_status 1 "Node.js no instalado"
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm -v)
    print_status 0 "npm instalado ($NPM_VERSION)"
else
    print_status 1 "npm no instalado"
fi

echo ""

# Check .env file
echo "🔐 Verificando variables de entorno..."
if [ -f .env ]; then
    print_status 0 ".env existe"
    
    # Check required variables
    required_vars=(
        "DATABASE_URL"
        "NEXTAUTH_SECRET"
        "NEXTAUTH_URL"
        "BLOB_READ_WRITE_TOKEN"
        "MERCADOPAGO_ACCESS_TOKEN"
        "NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY"
        "RESEND_API_KEY"
        "RESEND_FROM_EMAIL"
    )
    
    for var in "${required_vars[@]}"; do
        if grep -q "^${var}=" .env; then
            value=$(grep "^${var}=" .env | cut -d'=' -f2-)
            if [ -z "$value" ] || [[ "$value" == *"your-"* ]] || [[ "$value" == *"tu-"* ]]; then
                print_warning "$var está vacío o tiene valor de ejemplo"
            else
                print_status 0 "$var configurado"
            fi
        else
            print_warning "$var no encontrado en .env"
        fi
    done
    
    # Check NEXTAUTH_SECRET length
    if grep -q "^NEXTAUTH_SECRET=" .env; then
        SECRET=$(grep "^NEXTAUTH_SECRET=" .env | cut -d'=' -f2-)
        if [ ${#SECRET} -lt 32 ]; then
            print_warning "NEXTAUTH_SECRET debe tener al menos 32 caracteres"
        fi
    fi
else
    print_status 1 ".env no existe. Copia .env.example a .env"
fi

echo ""

# Check package.json
echo "📦 Verificando dependencias..."
if [ -f package.json ]; then
    print_status 0 "package.json existe"
    
    if [ -d node_modules ]; then
        print_status 0 "node_modules existe"
    else
        print_warning "node_modules no existe. Ejecuta: npm install"
    fi
else
    print_status 1 "package.json no encontrado"
fi

echo ""

# Check Prisma
echo "🗄️ Verificando Prisma..."
if [ -d prisma ]; then
    print_status 0 "Directorio prisma/ existe"
    
    if [ -f prisma/schema.prisma ]; then
        print_status 0 "schema.prisma existe"
    else
        print_status 1 "schema.prisma no encontrado"
    fi
    
    if [ -d node_modules/.prisma ]; then
        print_status 0 "Prisma Client generado"
    else
        print_warning "Prisma Client no generado. Ejecuta: npm run db:generate"
    fi
else
    print_status 1 "Directorio prisma/ no encontrado"
fi

echo ""

# Check Docker files
echo "🐳 Verificando archivos Docker..."
if [ -f Dockerfile ]; then
    print_status 0 "Dockerfile existe"
else
    print_status 1 "Dockerfile no encontrado"
fi

if [ -f docker-compose.yml ]; then
    print_status 0 "docker-compose.yml existe"
else
    print_status 1 "docker-compose.yml no encontrado"
fi

if [ -f .dockerignore ]; then
    print_status 0 ".dockerignore existe"
else
    print_warning ".dockerignore no encontrado (opcional)"
fi

echo ""

# Check Git
echo "📝 Verificando Git..."
if command_exists git; then
    print_status 0 "Git instalado"
    
    if [ -d .git ]; then
        print_status 0 "Repositorio Git inicializado"
        
        # Check if there are uncommitted changes
        if [ -n "$(git status --porcelain)" ]; then
            print_warning "Hay cambios sin commitear"
        else
            print_status 0 "No hay cambios sin commitear"
        fi
        
        # Check remote
        if git remote -v | grep -q origin; then
            print_status 0 "Remote 'origin' configurado"
        else
            print_warning "Remote 'origin' no configurado"
        fi
    else
        print_warning "No es un repositorio Git"
    fi
else
    print_status 1 "Git no instalado"
fi

echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ Todo está configurado correctamente!${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "  1. Iniciar servicios: docker-compose up -d"
    echo "  2. Ver logs: docker-compose logs -f app"
    echo "  3. Acceder a: http://localhost:3000"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Configuración completa con $WARNINGS advertencias${NC}"
    echo ""
    echo "Puedes continuar, pero revisa las advertencias arriba."
else
    echo -e "${RED}✗ Encontrados $ERRORS errores y $WARNINGS advertencias${NC}"
    echo ""
    echo "Por favor, corrige los errores antes de continuar."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $ERRORS
