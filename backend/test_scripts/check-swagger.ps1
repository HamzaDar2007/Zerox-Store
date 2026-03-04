# Verify Swagger Request Body Schemas
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " SWAGGER REQUEST BODY VERIFICATION" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/docs-json" -UseBasicParsing
$swagger = $response.Content | ConvertFrom-Json

Write-Host "Server: Running" -ForegroundColor Green
Write-Host ""

# Function to check schema
function Test-Schema {
    param($Path, $Method, $Title)
    
    Write-Host "$Title " -NoNewline -ForegroundColor Yellow
    Write-Host "($Method $Path)" -ForegroundColor Gray
    
    $endpoint = $swagger.paths.$Path.$Method
    $schemaRef = $endpoint.requestBody.content.'application/json'.schema.'$ref'
    
    if ($schemaRef) {
        $schemaName = $schemaRef.Split('/')[-1]
        $schema = $swagger.components.schemas.$schemaName
        
        Write-Host "  Schema: $schemaName" -ForegroundColor Green
        
        if ($schema.properties.PSObject.Properties.Count -gt 0) {
            Write-Host "  Fields:" -ForegroundColor Cyan
            foreach ($prop in $schema.properties.PSObject.Properties) {
                $name = $prop.Name
                $value = $prop.Value
                $example = $value.example
                
                if ($example) {
                    Write-Host "    - $name = $example" -ForegroundColor White
                } else {
                    Write-Host "    - $name (type: $($value.type))" -ForegroundColor Gray
                }
            }
        }
    } else {
        Write-Host "  NO SCHEMA!" -ForegroundColor Red
    }
    Write-Host ""
}

# Auth Endpoints
Write-Host "AUTH ENDPOINTS" -ForegroundColor Cyan
Write-Host "---------------" -ForegroundColor Cyan
Test-Schema "/auth/login" "post" "Login"
Test-Schema "/auth/register" "post" "Register"
Test-Schema "/auth/refresh" "post" "Refresh Token"
Test-Schema "/auth/logout" "post" "Logout"
Test-Schema "/auth/password-forgot" "post" "Password Reset"
Test-Schema "/auth/reset-password" "post" "Reset Password"

# User Endpoints  
Write-Host "USER ENDPOINTS" -ForegroundColor Cyan
Write-Host "---------------" -ForegroundColor Cyan
Test-Schema "/users" "post" "Create User"
Test-Schema "/users/{userId}/roles" "post" "Assign Role"

# Permission Endpoints
Write-Host "PERMISSION ENDPOINTS" -ForegroundColor Cyan
Write-Host "---------------------" -ForegroundColor Cyan
Test-Schema "/permissions" "post" "Create Permission"

# Role Endpoints
Write-Host "ROLE ENDPOINTS" -ForegroundColor Cyan
Write-Host "---------------" -ForegroundColor Cyan
Test-Schema "/roles" "post" "Create Role"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Swagger UI: http://localhost:3000/api/docs" -ForegroundColor Blue
Write-Host ""
