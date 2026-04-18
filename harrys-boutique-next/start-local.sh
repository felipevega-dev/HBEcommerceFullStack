#!/bin/bash

# ─── Quick Start Script for Local Development ────────────────────────────────
# Usage: ./start-local.sh

set -e

echo "🚀 Starting Harry's Boutique..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your credentials."
    echo ""
    echo "Required variables:"
    echo "  - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo "  - BLOB_READ_WRITE_TOKEN (get from Vercel Dashboard)"
    echo "  - MERCADOPAGO_ACCESS_TOKEN"
    echo "  - RESEND_API_KEY"
    echo ""
    read -p "Press Enter after editing .env file..."
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "🐳 Starting Docker containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

echo ""
echo "✅ Services started successfully!"
echo ""
echo "📍 Access your application:"
echo "   🌐 App:      http://localhost:3000"
echo "   👨‍💼 Admin:    http://localhost:3000/admin"
echo "   🏥 Health:   http://localhost:3000/api/health"
echo ""
echo "📊 View logs:"
echo "   docker-compose logs -f app"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
echo ""
