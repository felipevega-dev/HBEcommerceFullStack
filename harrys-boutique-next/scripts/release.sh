#!/bin/bash
# Release script for production deployment
# Usage: ./scripts/release.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}

echo "Starting release process for: $ENVIRONMENT"

# Build the application
echo "Building application..."
npm run build

# Run migrations
echo "Running database migrations..."
npm run db:migrate:deploy

echo "Release completed successfully."
echo "   - Application built"
echo "   - Migrations applied"
echo ""
echo "   To start the server: npm start"
