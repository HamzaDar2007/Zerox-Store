# Swagger Documentation Verification Script
Write-Host "`n" -NoNewline
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host (" SWAGGER REQUEST BODY VERIFICATION " * 1) -NoNewline -ForegroundColor White -BackgroundColor Cyan
Write-Host "=" -ForegroundColor Cyan
Write-Host ""

try {
    # Fetch Swagger JSON
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/docs-json" -UseBasicParsing
    $swagger = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Swagger JSON loaded successfully`n" -ForegroundColor Green
    
    # Function to check endpoint schema
    function Check-Endpoint {
        param($Path, $Method, $Name)
        
        Write-Host "$Name" -ForegroundColor Yellow -NoNewline
        Write-Host " ($Method $Path)" -ForegroundColor Gray
        
        $endpoint = $swagger.paths.$Path.$Method
        $schemaRef = $endpoint.requestBody.content.'application/json'.schema.'$ref'
        
        if ($schemaRef) {
            $schemaName = $schemaRef.Split('/')[-1]
            $schema = $swagger.components.schemas.$schemaName
            
            Write-Host "  ✅ Schema: " -ForegroundColor Green -NoNewline
            Write-Host $schemaName -ForegroundColor White
            
            if ($schema.properties) {
                Write-Host "  📋 Properties:" -ForegroundColor Cyan
                $schema.properties.PSObject.Properties | ForEach-Object {
                    $propName = $_.Name
                    $propDetails = $_.Value
                    
                    Write-Host "    • " -NoNewline -ForegroundColor Gray
                    Write-Host $propName -NoNewline -ForegroundColor White
                    
                    if ($propDetails.example) {
                        Write-Host " = " -NoNewline -ForegroundColor Gray
                        Write-Host ('"{0}"' -f $propDetails.example) -ForegroundColor Yellow
                    } else {
                        Write-Host " (type: $($propDetails.type))" -ForegroundColor Gray
                    }
                }
            }
        } else {
            Write-Host "  ❌ NO SCHEMA DEFINED!" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    # Check Auth Endpoints
    Write-Host "`n--- AUTH ENDPOINTS ---`n" -ForegroundColor Cyan
    Check-Endpoint "/auth/login" "post" "Login"
    Check-Endpoint "/auth/register" "post" "Register"
    Check-Endpoint "/auth/refresh" "post" "Refresh Token"
    Check-Endpoint "/auth/logout" "post" "Logout"
    Check-Endpoint "/auth/password-forgot" "post" "Password Reset Request"
    Check-Endpoint "/auth/reset-password" "post" "Reset Password"
    
    # Check User Endpoints
    Write-Host "`n--- USER ENDPOINTS ---`n" -ForegroundColor Cyan
    Check-Endpoint "/users" "post" "Create User"
    Check-Endpoint "/users/{userId}/roles" "post" "Assign Role to User"
    
    # Check Permission Endpoints
    Write-Host "`n--- PERMISSION ENDPOINTS ---`n" -ForegroundColor Cyan
    Check-Endpoint "/permissions" "post" "Create Permission"
    
    # Check Role Endpoints
    Write-Host "`n--- ROLE ENDPOINTS ---`n" -ForegroundColor Cyan
    Check-Endpoint "/roles" "post" "Create Role"
    
    Write-Host "`n" -NoNewline
    Write-Host "=" * 70 -ForegroundColor Cyan
    Write-Host "✅ VERIFICATION COMPLETE" -ForegroundColor Green
    Write-Host "=" * 70 -ForegroundColor Cyan
    Write-Host "`n📍 Swagger UI: " -NoNewline
    Write-Host "http://localhost:3000/api/docs" -ForegroundColor Blue
    Write-Host "📍 Swagger JSON: " -NoNewline
    Write-Host "http://localhost:3000/api/docs-json" -ForegroundColor Blue
    Write-Host ""
    
} catch {
    Write-Host "`n❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nMake sure the server is running with: npm run start:dev" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
