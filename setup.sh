#!/bin/bash

# Setup script for first-time project initialization

echo "🚀 Setting up Social Network project..."

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd ../client
npm install
cd ../server

# Start Docker containers
echo "🐳 Starting Docker containers..."
docker compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Run Prisma migrations
echo "🗄️  Running Prisma migrations..."
npx prisma migrate deploy

# Seed the database
echo "🌱 Seeding database..."
npm run seed

echo "✅ Setup complete! You can now run 'bash dev.sh' to start development."
