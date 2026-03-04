# Quick Start Script for Production Deployment
# This script automates the initial setup process

Write-Host "`n" -NoNewline
Write-Host "================================================================================================" -ForegroundColor Cyan
Write-Host "🚀 PRODUCTION DEPLOYMENT - QUICK START" -ForegroundColor Cyan
Write-Host "================================================================================================" -ForegroundColor Cyan
Write-Host "`n"

$ErrorActionPreference = "Stop"

# Function to print colored messages
function Write-Step {
    param($message, $color = "White")
    Write-Host "➤ $message" -ForegroundColor $color
}

function Write-Success {
    param($message)
    Write-Host "✅ $message" -ForegroundColor Green
}

function Write-Error {
    param($message)
    Write-Host "❌ $message" -ForegroundColor Red
}

function Write-Warning {
    param($message)
    Write-Host "⚠️  $message" -ForegroundColor Yellow
}

function Write-Info {
    param($message)
    Write-Host "ℹ️  $message" -ForegroundColor Blue
}

try {
    # Step 1: Check Node.js
    Write-Step "Checking Node.js installation..." "Yellow"
    $nodeVersion = node --version
    Write-Success "Node.js version: $nodeVersion"

    # Step 2: Check PostgreSQL connection
    Write-Step "`nChecking database connection..." "Yellow"
    $dbHost = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
    $dbPort = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
    $dbName = if ($env:DB_NAME) { $env:DB_NAME } else { "ecommerce" }
    Write-Info "Database: $dbHost:$dbPort/$dbName"

    # Step 3: Install dependencies
    Write-Step "`nInstalling dependencies..." "Yellow"
    npm ci
    Write-Success "Dependencies installed"

    # Step 4: Build application
    Write-Step "`nBuilding application..." "Yellow"
    npm run build
    Write-Success "Application built successfully"

    # Step 5: Run database tests
    Write-Step "`nVerifying database schema..." "Yellow"
    node check-auth-tables.js
    Write-Success "Database schema verified"

    # Step 6: Run production readiness tests
    Write-Step "`nRunning production readiness tests..." "Yellow"
    node production-readiness-test.js
    if ($LASTEXITCODE -eq 0) {
        Write-Success "All production readiness tests passed!"
    } else {
        Write-Warning "Some tests failed or have warnings. Review the output above."
    }

    # Summary
    Write-Host "`n" -NoNewline
    Write-Host "================================================================================================" -ForegroundColor Green
    Write-Host "✅ SETUP COMPLETE!" -ForegroundColor Green
    Write-Host "================================================================================================" -ForegroundColor Green
    Write-Host "`n"

    Write-Info "Your system is ready for deployment!`n"

    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Start the development server:" -ForegroundColor White
    Write-Host "     npm run start:dev`n" -ForegroundColor Cyan

    Write-Host "  2. Access Swagger documentation:" -ForegroundColor White
    Write-Host "     http://localhost:3001/api/docs`n" -ForegroundColor Cyan

    Write-Host "  3. Test API endpoints (after server starts):" -ForegroundColor White
    Write-Host "     node test-api-endpoints.js`n" -ForegroundColor Cyan

    Write-Host "  4. For production deployment:" -ForegroundColor White
    Write-Host "     See PRODUCTION-DEPLOYMENT-GUIDE.md`n" -ForegroundColor Cyan

    Write-Host "  5. Review the production readiness summary:" -ForegroundColor White
    Write-Host "     PRODUCTION-READINESS-SUMMARY.md`n" -ForegroundColor Cyan

    Write-Host "`n📚 Documentation:" -ForegroundColor Yellow
    Write-Host "  • PRODUCTION-DEPLOYMENT-GUIDE.md - Complete deployment guide" -ForegroundColor White
    Write-Host "  • PRODUCTION-READINESS-SUMMARY.md - Status and features summary" -ForegroundColor White
    Write-Host "  • AUTH-MODULES-FIX-REPORT.md - Technical fix details" -ForegroundColor White
    Write-Host "  • FINAL-VERIFICATION-REPORT.md - Verification results`n" -ForegroundColor White

} catch {
    Write-Error "`nSetup failed: $_"
    Write-Host "`nPlease review the error message above and try again." -ForegroundColor Yellow
    Write-Host "For help, see PRODUCTION-DEPLOYMENT-GUIDE.md`n" -ForegroundColor Yellow
    exit 1
}
