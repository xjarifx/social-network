#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_section "Social Network - Setup Script"

# Check for required tools
print_section "Checking Prerequisites"

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi
print_success "Node.js found ($(node --version))"

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm found ($(npm --version))"

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi
print_success "Docker found ($(docker --version))"

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed"
    exit 1
fi
print_success "Docker Compose found ($(docker-compose --version))"

# Setup environment variables
print_section "Setting Up Environment Variables"

if [ -f "$SCRIPT_DIR/.env" ]; then
    print_warning ".env file already exists, skipping..."
else
    if [ ! -f "$SCRIPT_DIR/.env.example" ]; then
        print_error ".env.example file not found"
        exit 1
    fi
    
    cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
    print_success ".env file created from .env.example"
    print_warning "Please update .env with your credentials before starting the application"
fi

# Start Docker containers
print_section "Starting Docker Containers"

cd "$SCRIPT_DIR"

# Check if containers are already running
if docker ps | grep -q "social_network_postgres"; then
    print_warning "PostgreSQL container already running"
else
    echo "Starting PostgreSQL and Redis..."
    docker-compose up -d
    if [ $? -eq 0 ]; then
        print_success "Docker containers started"
        echo "Waiting for PostgreSQL to be ready..."
        sleep 5
    else
        print_error "Failed to start Docker containers"
        exit 1
    fi
fi

# Install server dependencies
print_section "Installing Server Dependencies"

if [ ! -d "$SCRIPT_DIR/server/node_modules" ]; then
    cd "$SCRIPT_DIR/server"
    npm install
    if [ $? -eq 0 ]; then
        print_success "Server dependencies installed"
    else
        print_error "Failed to install server dependencies"
        exit 1
    fi
else
    print_success "Server dependencies already installed"
fi

# Run database migrations
print_section "Setting Up Database"

cd "$SCRIPT_DIR/server"

if npx prisma migrate deploy 2>/dev/null; then
    print_success "Database migrations applied"
else
    print_warning "Could not apply existing migrations, generating schema..."
    npx prisma generate
    print_success "Prisma schema generated"
fi

# Install client dependencies
print_section "Installing Client Dependencies"

if [ ! -d "$SCRIPT_DIR/client/node_modules" ]; then
    cd "$SCRIPT_DIR/client"
    npm install
    if [ $? -eq 0 ]; then
        print_success "Client dependencies installed"
    else
        print_error "Failed to install client dependencies"
        exit 1
    fi
else
    print_success "Client dependencies already installed"
fi

# Final summary
print_section "Setup Complete!"

echo -e "${GREEN}Your development environment is ready!${NC}"
echo -e ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Review and update .env file with your API keys"
echo -e "  2. Run: ${BLUE}bash dev.sh${NC} to start all services"
echo -e ""
echo -e "${YELLOW}Services will run on:${NC}"
echo -e "  • Backend:       http://localhost:3000"
echo -e "  • Frontend:      http://localhost:5173"
echo -e "  • Prisma Studio: http://localhost:5555"
echo -e "  • PostgreSQL:    localhost:5432"
echo -e "  • Redis:         localhost:6379"
echo -e ""
print_success "Setup finished!"
