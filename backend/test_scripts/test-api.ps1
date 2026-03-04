# API Testing Script for Auth, Users, Roles, and Permissions Modules
# Run this after starting the server with: npm run start:dev

$baseUrl = "http://localhost:3000"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "API MODULE TESTING" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test counter
$testsPassed = 0
$testsFailed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [hashtable]$Headers = @{"Content-Type"="application/json"},
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    Write-Host "  $Method $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Method = $Method
            Uri = $Url
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
            Write-Host "  Body: $($params.Body)" -ForegroundColor Gray
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        
        Write-Host "  [PASS] PASSED - Status: 200/201" -ForegroundColor Green
        Write-Host "  Response: $($response | ConvertTo-Json -Compress -Depth 2)`n" -ForegroundColor Gray
        $script:testsPassed++
        return $response
    }
    catch {
        try {
            $statusCode = $_.Exception.Response.StatusCode.value__
            if ($statusCode -eq $ExpectedStatus) {
                Write-Host "  [PASS] PASSED - Expected Status: $statusCode" -ForegroundColor Green
                $script:testsPassed++
            } else {
                Write-Host "  [FAIL] FAILED - Status: $statusCode" -ForegroundColor Red
                Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
                $script:testsFailed++
            }
        } catch {
            Write-Host "  [FAIL] FAILED - Error: $($_.Exception.Message)" -ForegroundColor Red
            $script:testsFailed++
        }
        Write-Host ""
        return $null
    }
}

# Wait for server to be ready
Write-Host "Waiting for server..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Test 1: Root endpoint
$root = Test-Endpoint -Name "Root Endpoint" -Method GET -Url "$baseUrl/"

# Test 2: Register a new user
Write-Host "`n--- AUTH MODULE TESTS ---`n" -ForegroundColor Cyan
$registerData = @{
    name = "Test User"
    email = "testuser@example.com"
    password = "Test123456"
    phone = "+923001234567"
}
$registerResponse = Test-Endpoint -Name "Register User" -Method POST -Url "$baseUrl/auth/register" -Body $registerData

# Test 3: Login
$loginData = @{
    email = "testuser@example.com"
    password = "Test123456"
}
$loginResponse = Test-Endpoint -Name "Login User" -Method POST -Url "$baseUrl/auth/login" -Body $loginData

# Store token for authenticated requests
$token = $null
if ($loginResponse) {
    $token = $loginResponse.accessToken
    $headers["Authorization"] = "Bearer $token"
}

# Test 4: Get Users (requires authentication)
Write-Host "`n--- USERS MODULE TESTS ---`n" -ForegroundColor Cyan
if ($token) {
    $users = Test-Endpoint -Name "Get All Users" -Method GET -Url "$baseUrl/users" -Headers $headers
    
    # Test 5: Get specific user
    if ($users -and $users.data -and $users.data.Count -gt 0) {
        $userId = $users.data[0].id
        Test-Endpoint -Name "Get User by ID" -Method GET -Url "$baseUrl/users/$userId" -Headers $headers
        
        # Test 6: Get user permissions
        Test-Endpoint -Name "Get User Permissions" -Method GET -Url "$baseUrl/users/$userId/permissions" -Headers $headers
    }
    
    # Test 7: Create a user with role
    $createUserData = @{
        name = "Admin User"
        email = "admin@example.com"
        password = "Admin123456"
        role = "admin"
    }
    Test-Endpoint -Name "Create User with Role" -Method POST -Url "$baseUrl/users" -Body $createUserData -Headers $headers
}

# Test 8: Roles module
Write-Host "`n--- ROLES MODULE TESTS ---`n" -ForegroundColor Cyan
if ($token) {
    # Get all roles
    $roles = Test-Endpoint -Name "Get All Roles" -Method GET -Url "$baseUrl/roles" -Headers $headers
    
    # Create a new role
    $createRoleData = @{
        name = "test_role"
        displayName = "Test Role"
        description = "A test role for verification"
        isSystem = $false
    }
    $newRole = Test-Endpoint -Name "Create Role" -Method POST -Url "$baseUrl/roles" -Body $createRoleData -Headers $headers
    
    if ($newRole) {
        $roleId = $newRole.id
        
        # Get specific role
        Test-Endpoint -Name "Get Role by ID" -Method GET -Url "$baseUrl/roles/$roleId" -Headers $headers
        
        # Update role
        $updateRoleData = @{
            description = "Updated test role description"
        }
        Test-Endpoint -Name "Update Role" -Method PATCH -Url "$baseUrl/roles/$roleId" -Body $updateRoleData -Headers $headers
    }
}

# Test 9: Permissions module
Write-Host "`n--- PERMISSIONS MODULE TESTS ---`n" -ForegroundColor Cyan
if ($token -and $newRole) {
    # Get all permissions
    $permissions = Test-Endpoint -Name "Get All Permissions" -Method GET -Url "$baseUrl/permissions" -Headers $headers
    
    # Create a permission for the test role
    $createPermissionData = @{
        roleId = $newRole.id
        module = "users"
        action = "read"
    }
    $newPermission = Test-Endpoint -Name "Create Permission" -Method POST -Url "$baseUrl/permissions" -Body $createPermissionData -Headers $headers
    
    # Get permissions by module
    Test-Endpoint -Name "Get Permissions by Module" -Method GET -Url "$baseUrl/permissions/by-module?module=users" -Headers $headers
    
    if ($newPermission) {
        # Get specific permission
        Test-Endpoint -Name "Get Permission by ID" -Method GET -Url "$baseUrl/permissions/$($newPermission.id)" -Headers $headers
        
        # Update permission
        $updatePermissionData = @{
            action = "write"
        }
        Test-Endpoint -Name "Update Permission" -Method PATCH -Url "$baseUrl/permissions/$($newPermission.id)" -Body $updatePermissionData -Headers $headers
        
        # Delete permission
        Test-Endpoint -Name "Delete Permission" -Method DELETE -Url "$baseUrl/permissions/$($newPermission.id)" -Headers $headers
    }
}

# Test 10: Cleanup - Delete test role
if ($token -and $newRole) {
    Test-Endpoint -Name "Delete Test Role" -Method DELETE -Url "$baseUrl/roles/$($newRole.id)" -Headers $headers
}

# Test 11: Logout
if ($token) {
    Test-Endpoint -Name "Logout User" -Method POST -Url "$baseUrl/auth/logout" -Headers $headers
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tests Passed: $testsPassed" -ForegroundColor Green
Write-Host "Tests Failed: $testsFailed" -ForegroundColor Red
Write-Host "Total Tests: $($testsPassed + $testsFailed)" -ForegroundColor White

if ($testsFailed -eq 0) {
    Write-Host "`n[PASS] ALL TESTS PASSED!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n[FAIL] SOME TESTS FAILED!" -ForegroundColor Red
    exit 1
}
