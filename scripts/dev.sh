
#!/bin/bash

# Always run from project root
cd "$(dirname "$0")/.."

# Development script - starts server, client, and Prisma Studio

echo "🚀 Starting Social Network in development mode..."

# Check if Docker containers are running
if ! docker ps | grep -q social_network_postgres; then
  echo "🐳 Starting Docker containers..."
  cd server
  docker compose up -d
  sleep 3
  cd ..
fi

# Start Prisma Studio in background
echo "📊 Starting Prisma Studio..."
cd server
npx prisma studio &
PRISMA_PID=$!
sleep 2

# Start server in background
echo "🖥️  Starting server..."
npm run dev &
SERVER_PID=$!
sleep 2
cd ..

# Start client in foreground
echo "🎨 Starting client..."
cd client
npm run dev

# Cleanup on exit
trap "kill $SERVER_PID $PRISMA_PID 2>/dev/null" EXIT
