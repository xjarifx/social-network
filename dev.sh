#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to cleanup on exit
cleanup() {
    echo -e "\n${RED}Shutting down all processes...${NC}"
    kill 0
}

# Set trap to catch signals
trap cleanup SIGINT SIGTERM

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Starting Social Network Dev Environment${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if node_modules exist in both directories
if [ ! -d "$SCRIPT_DIR/client/node_modules" ]; then
    echo -e "${YELLOW}Installing client dependencies...${NC}"
    (cd "$SCRIPT_DIR/client" && npm install)
fi

if [ ! -d "$SCRIPT_DIR/server/node_modules" ]; then
    echo -e "${YELLOW}Installing server dependencies...${NC}"
    (cd "$SCRIPT_DIR/server" && npm install)
fi

# Start server
echo -e "${GREEN}Starting server...${NC}"
(cd "$SCRIPT_DIR/server" && npm run dev) &
SERVER_PID=$!
sleep 3

# Start client
echo -e "${GREEN}Starting client...${NC}"
(cd "$SCRIPT_DIR/client" && npm run dev) &
CLIENT_PID=$!
sleep 3

# Start Prisma Studio
echo -e "${GREEN}Starting Prisma Studio...${NC}"
(cd "$SCRIPT_DIR/server" && npx prisma studio) &
PRISMA_PID=$!

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}All services started!${NC}"
echo -e "${GREEN}  Server:  http://localhost:3000${NC}"
echo -e "${GREEN}  Client:  http://localhost:5173${NC}"
echo -e "${GREEN}  Studio:  http://localhost:5555${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Wait for all processes
wait
