#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if MinIO is running
check_minio() {
    echo -e "${YELLOW}Checking MinIO server...${NC}"
    if nc -z localhost 9000 2>/dev/null; then
        echo -e "${GREEN}MinIO server is running${NC}"
        return 0
    else
        echo -e "${RED}MinIO server is not running${NC}"
        return 1
    fi
}

# Function to start MinIO if not running
start_minio() {
    if ! check_minio; then
        echo -e "${YELLOW}Starting MinIO server...${NC}"
        # Check if running on Windows
        if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
            start /B minio.exe server data
        else
            minio server data &
        fi
        sleep 5
        if check_minio; then
            echo -e "${GREEN}MinIO server started successfully${NC}"
        else
            echo -e "${RED}Failed to start MinIO server${NC}"
            exit 1
        fi
    fi
}

# Function to check environment variables
check_env() {
    echo -e "${YELLOW}Checking environment variables...${NC}"
    if [ ! -f .env ]; then
        echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
        cp .env.example .env
        echo -e "${GREEN}.env file created${NC}"
    fi
}

# Function to install dependencies
install_deps() {
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}Dependencies installed${NC}"
}

# Function to run tests
run_tests() {
    echo -e "${YELLOW}Running tests...${NC}"
    npm test
}

# Function to start development server
start_dev() {
    echo -e "${YELLOW}Starting development server...${NC}"
    npm run dev
}

# Main script
echo -e "${GREEN}=== File Manager Development Setup ===${NC}"

# Parse command line arguments
case "$1" in
    "test")
        check_env
        start_minio
        run_tests
        ;;
    "install")
        install_deps
        ;;
    "clean")
        echo -e "${YELLOW}Cleaning up...${NC}"
        rm -rf node_modules
        rm -rf dist
        rm -rf coverage
        echo -e "${GREEN}Clean up complete${NC}"
        ;;
    *)
        check_env
        start_minio
        start_dev
        ;;
esac

# Trap Ctrl+C and cleanup
trap 'echo -e "${YELLOW}\nShutting down...${NC}"; exit 0' INT
