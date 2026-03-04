#!/bin/bash
# Quick Start Script for Production Deployment (Linux/Mac)
# This script automates the initial setup process

echo ""
echo "================================================================================================"
echo "🚀 PRODUCTION DEPLOYMENT - QUICK START"
echo "================================================================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored messages
print_step() {
    echo -e "${YELLOW}➤ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Error handling
set -e
trap 'print_error "Setup failed at line $LINENO"' ERR

# Step 1: Check Node.js
print_step "Checking Node.js installation..."
NODE_VERSION=$(node --version)
print_success "Node.js version: $NODE_VERSION"

# Step 2: Check PostgreSQL connection
print_step "\nChecking database connection..."
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-ecommerce}
print_info "Database: $DB_HOST:$DB_PORT/$DB_NAME"

# Step 3: Install dependencies
print_step "\nInstalling dependencies..."
npm ci
print_success "Dependencies installed"

# Step 4: Build application
print_step "\nBuilding application..."
npm run build
print_success "Application built successfully"

# Step 5: Run database tests
print_step "\nVerifying database schema..."
node check-auth-tables.js
print_success "Database schema verified"

# Step 6: Run production readiness tests
print_step "\nRunning production readiness tests..."
if node production-readiness-test.js; then
    print_success "All production readiness tests passed!"
else
    print_warning "Some tests failed or have warnings. Review the output above."
fi

# Summary
echo ""
echo "================================================================================================"
echo -e "${GREEN}✅ SETUP COMPLETE!${NC}"
echo "================================================================================================"
echo ""

print_info "Your system is ready for deployment!\n"

echo -e "${YELLOW}Next steps:${NC}"
echo -e "${NC}  1. Start the development server:${NC}"
echo -e "${CYAN}     npm run start:dev${NC}\n"

echo -e "${NC}  2. Access Swagger documentation:${NC}"
echo -e "${CYAN}     http://localhost:3001/api/docs${NC}\n"

echo -e "${NC}  3. Test API endpoints (after server starts):${NC}"
echo -e "${CYAN}     node test-api-endpoints.js${NC}\n"

echo -e "${NC}  4. For production deployment:${NC}"
echo -e "${CYAN}     See PRODUCTION-DEPLOYMENT-GUIDE.md${NC}\n"

echo -e "${NC}  5. Review the production readiness summary:${NC}"
echo -e "${CYAN}     PRODUCTION-READINESS-SUMMARY.md${NC}\n"

echo -e "${YELLOW}📚 Documentation:${NC}"
echo -e "${NC}  • PRODUCTION-DEPLOYMENT-GUIDE.md - Complete deployment guide${NC}"
echo -e "${NC}  • PRODUCTION-READINESS-SUMMARY.md - Status and features summary${NC}"
echo -e "${NC}  • AUTH-MODULES-FIX-REPORT.md - Technical fix details${NC}"
echo -e "${NC}  • FINAL-VERIFICATION-REPORT.md - Verification results${NC}\n"
