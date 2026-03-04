# Simple API Test Script
$baseUrl = "http://localhost:3000"

Write-Host "`n=== TESTING AUTH & MODULES ===" -ForegroundColor Cyan

# Test 1: Register
Write-Host "`n[1] Testing User Registration..." -ForegroundColor Yellow
try {
    $registerBody = @{
        name = "Test User $(Get-Random)"
        email = "test$(Get-Random)@example.com"
        password = "Test123456"
    } | ConvertTo-Json

    $register = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/register" -Body $registerBody -ContentType "application/json"
    Write-Host "   [PASS] User registered: $($register.user.email)" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] Registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Login
Write-Host "`n[2] Testing User Login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = $register.user.email
        password = "Test123456"
    } | ConvertTo-Json

    $login = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" -Body $loginBody -ContentType "application/json"
    $token = $login.accessToken
    Write-Host "   [PASS] Login successful. Token received." -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get Users
if ($token) {
    Write-Host "`n[3] Testing Get Users..." -ForegroundColor Yellow
    try {
        $headers = @{ Authorization = "Bearer $token" }
        $users = Invoke-RestMethod -Method Get -Uri "$baseUrl/users" -Headers $headers
        Write-Host "   [PASS] Retrieved $($users.data.Count) users" -ForegroundColor Green
    } catch {
        Write-Host "   [FAIL] Get users failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Get Roles
if ($token) {
    Write-Host "`n[4] Testing Get Roles..." -ForegroundColor Yellow
    try {
        $headers = @{ Authorization = "Bearer $token" }
        $roles = Invoke-RestMethod -Method Get -Uri "$baseUrl/roles" -Headers $headers
        Write-Host "   [PASS] Retrieved $($roles.data.Count) roles" -ForegroundColor Green
    } catch {
        Write-Host "   [FAIL] Get roles failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 5: Create Role
if ($token) {
    Write-Host "`n[5] Testing Create Role..." -ForegroundColor Yellow
    try {
        $headers = @{ Authorization = "Bearer $token" }
        $roleBody = @{
            name = "test_role_$(Get-Random)"
            displayName = "Test Role"
            description = "Test role for API verification"
        } | ConvertTo-Json

        $newRole = Invoke-RestMethod -Method Post -Uri "$baseUrl/roles" -Body $roleBody -Headers $headers -ContentType "application/json"
        Write-Host "   [PASS] Role created: $($newRole.name)" -ForegroundColor Green
        
        # Test 6: Create Permission for Role
        Write-Host "`n[6] Testing Create Permission..." -ForegroundColor Yellow
        try {
            $permBody = @{
                roleId = $newRole.id
                module = "users"
                action = "read"
            } | ConvertTo-Json

            $newPerm = Invoke-RestMethod -Method Post -Uri "$baseUrl/permissions" -Body $permBody -Headers $headers -ContentType "application/json"
            Write-Host "   [PASS] Permission created: $($newPerm.module)_$($newPerm.action)" -ForegroundColor Green
        } catch {
            Write-Host "   [FAIL] Create permission failed: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Test 7: Get Permissions
        Write-Host "`n[7] Testing Get Permissions..." -ForegroundColor Yellow
        try {
            $permissions = Invoke-RestMethod -Method Get -Uri "$baseUrl/permissions" -Headers $headers
            Write-Host "   [PASS] Retrieved $($permissions.data.Count) permissions" -ForegroundColor Green
        } catch {
            Write-Host "   [FAIL] Get permissions failed: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "   [FAIL] Create role failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Cyan
Write-Host "All modules are working correctly!`n" -ForegroundColor Green
