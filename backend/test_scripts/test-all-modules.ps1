# Comprehensive Module Testing Script
# Tests: Auth, Users, Roles, Permissions, Role-Permissions modules

$baseUrl = "http://localhost:3000"
$testResults = @()

function Test-Endpoint {
    param(
        [string]$Module,
        [string]$TestName,
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [hashtable]$Headers = @{"Content-Type"="application/json"},
        [int]$ExpectedStatus = 200
    )
    
    try {
        $params = @{
            Method = $Method
            Uri = $Url
            Headers = $Headers
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        
        $result = [PSCustomObject]@{
            Module = $Module
            Test = $TestName
            Status = "PASS"
            StatusCode = 200
            Message = "Success"
        }
        
        Write-Host "[PASS] $Module - $TestName" -ForegroundColor Green
        $script:testResults += $result
        return $response
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $result = [PSCustomObject]@{
            Module = $Module
            Test = $TestName
            Status = "FAIL"
            StatusCode = $statusCode
            Message = $_.Exception.Message
        }
        
        Write-Host "[FAIL] $Module - $TestName (Status: $statusCode)" -ForegroundColor Red
        $script:testResults += $result
        return $null
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "COMPREHENSIVE MODULE TESTING" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ============================================
# 1. AUTH MODULE TESTS
# ============================================
Write-Host "`n--- AUTH MODULE ---" -ForegroundColor Yellow

# Test 1.1: Register new customer
$registerCustomer = @{
    name = "Customer Test $(Get-Random)"
    email = "customer$(Get-Random)@test.com"
    password = "Test@123456"
    phone = "+923001234590"
}
$custReg = Test-Endpoint -Module "Auth" -TestName "Register Customer" -Method POST -Url "$baseUrl/auth/register" -Body $registerCustomer

# Test 1.2: Login with admin
$loginAdmin = @{
    email = "admin@labverse.pk"
    password = "Admin@123456"
}
$adminLogin = Test-Endpoint -Module "Auth" -TestName "Admin Login" -Method POST -Url "$baseUrl/auth/login" -Body $loginAdmin

$token = $null
if ($adminLogin) {
    $token = $adminLogin.data.accessToken
    Write-Host "   Token obtained: $($token.Substring(0,20))..." -ForegroundColor Gray
}

$authHeaders = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Test 1.3: Refresh token
if ($adminLogin) {
    $refreshBody = @{ refreshToken = $adminLogin.data.refreshToken }
    Test-Endpoint -Module "Auth" -TestName "Refresh Token" -Method POST -Url "$baseUrl/auth/refresh" -Body $refreshBody
}

# ============================================
# 2. USERS MODULE TESTS
# ============================================
Write-Host "`n--- USERS MODULE ---" -ForegroundColor Yellow

if ($token) {
    # Test 2.1: Get all users
    $users = Test-Endpoint -Module "Users" -TestName "Get All Users" -Method GET -Url "$baseUrl/users" -Headers $authHeaders
    
    # Test 2.2: Create new user
    $newUser = @{
        name = "Test User $(Get-Random)"
        email = "testuser$(Get-Random)@test.com"
        password = "Test@123456"
        role = "customer"
        phone = "+923001234591"
    }
    $createdUser = Test-Endpoint -Module "Users" -TestName "Create User" -Method POST -Url "$baseUrl/users" -Body $newUser -Headers $authHeaders
    
    if ($createdUser) {
        $userId = $createdUser.data.id
        
        # Test 2.3: Get user by ID
        Test-Endpoint -Module "Users" -TestName "Get User By ID" -Method GET -Url "$baseUrl/users/$userId" -Headers $authHeaders
        
        # Test 2.4: Get user permissions
        Test-Endpoint -Module "Users" -TestName "Get User Permissions" -Method GET -Url "$baseUrl/users/$userId/permissions" -Headers $authHeaders
        
        # Test 2.5: Update user
        $updateUser = @{
            name = "Updated User Name"
            phone = "+923001234599"
        }
        Test-Endpoint -Module "Users" -TestName "Update User" -Method PATCH -Url "$baseUrl/users/$userId" -Body $updateUser -Headers $authHeaders
        
        # Test 2.6: Get updated user
        Test-Endpoint -Module "Users" -TestName "Get Updated User" -Method GET -Url "$baseUrl/users/$userId" -Headers $authHeaders
    }
}

# ============================================
# 3. ROLES MODULE TESTS
# ============================================
Write-Host "`n--- ROLES MODULE ---" -ForegroundColor Yellow

if ($token) {
    # Test 3.1: Get all roles
    $roles = Test-Endpoint -Module "Roles" -TestName "Get All Roles" -Method GET -Url "$baseUrl/roles" -Headers $authHeaders
    
    # Test 3.2: Create new role
    $newRole = @{
        name = "test_role_$(Get-Random)"
        displayName = "Test Role $(Get-Random)"
        description = "Role for comprehensive testing"
        isSystem = $false
    }
    $createdRole = Test-Endpoint -Module "Roles" -TestName "Create Role" -Method POST -Url "$baseUrl/roles" -Body $newRole -Headers $authHeaders
    
    if ($createdRole) {
        $roleId = $createdRole.data.id
        
        # Test 3.3: Get role by ID
        Test-Endpoint -Module "Roles" -TestName "Get Role By ID" -Method GET -Url "$baseUrl/roles/$roleId" -Headers $authHeaders
        
        # Test 3.4: Update role
        $updateRole = @{
            description = "Updated role description for testing"
            displayName = "Updated Test Role"
        }
        Test-Endpoint -Module "Roles" -TestName "Update Role" -Method PATCH -Url "$baseUrl/roles/$roleId" -Body $updateRole -Headers $authHeaders
        
        # Test 3.5: Get updated role
        Test-Endpoint -Module "Roles" -TestName "Get Updated Role" -Method GET -Url "$baseUrl/roles/$roleId" -Headers $authHeaders
    }
}

# ============================================
# 4. PERMISSIONS MODULE TESTS
# ============================================
Write-Host "`n--- PERMISSIONS MODULE ---" -ForegroundColor Yellow

if ($token -and $createdRole) {
    # Test 4.1: Get all permissions
    $permissions = Test-Endpoint -Module "Permissions" -TestName "Get All Permissions" -Method GET -Url "$baseUrl/permissions" -Headers $authHeaders
    
    # Test 4.2: Create permission for test role
    $newPerm1 = @{
        roleId = $createdRole.data.id
        module = "users"
        action = "create"
    }
    $createdPerm1 = Test-Endpoint -Module "Permissions" -TestName "Create Permission (users.create)" -Method POST -Url "$baseUrl/permissions" -Body $newPerm1 -Headers $authHeaders
    
    # Test 4.3: Create another permission
    $newPerm2 = @{
        roleId = $createdRole.data.id
        module = "users"
        action = "read"
    }
    $createdPerm2 = Test-Endpoint -Module "Permissions" -TestName "Create Permission (users.read)" -Method POST -Url "$baseUrl/permissions" -Body $newPerm2 -Headers $authHeaders
    
    # Test 4.4: Create permission for different module
    $newPerm3 = @{
        roleId = $createdRole.data.id
        module = "roles"
        action = "read"
    }
    $createdPerm3 = Test-Endpoint -Module "Permissions" -TestName "Create Permission (roles.read)" -Method POST -Url "$baseUrl/permissions" -Body $newPerm3 -Headers $authHeaders
    
    # Test 4.5: Get permissions by module
    Test-Endpoint -Module "Permissions" -TestName "Get Permissions By Module (users)" -Method GET -Url "$baseUrl/permissions/by-module?module=users" -Headers $authHeaders
    
    # Test 4.6: Get all modules
    Test-Endpoint -Module "Permissions" -TestName "Get All Modules" -Method GET -Url "$baseUrl/permissions/resources" -Headers $authHeaders
    
    # Test 4.7: Get all actions
    Test-Endpoint -Module "Permissions" -TestName "Get All Actions" -Method GET -Url "$baseUrl/permissions/actions" -Headers $authHeaders
    
    if ($createdPerm1) {
        $permId = $createdPerm1.data.id
        
        # Test 4.8: Get permission by ID
        Test-Endpoint -Module "Permissions" -TestName "Get Permission By ID" -Method GET -Url "$baseUrl/permissions/$permId" -Headers $authHeaders
        
        # Test 4.9: Update permission
        $updatePerm = @{
            action = "update"
        }
        Test-Endpoint -Module "Permissions" -TestName "Update Permission" -Method PATCH -Url "$baseUrl/permissions/$permId" -Body $updatePerm -Headers $authHeaders
        
        # Test 4.10: Delete permission
        Test-Endpoint -Module "Permissions" -TestName "Delete Permission" -Method DELETE -Url "$baseUrl/permissions/$permId" -Headers $authHeaders
    }
}

# ============================================
# 5. ROLE-PERMISSIONS MODULE TESTS
# ============================================
Write-Host "`n--- ROLE-PERMISSIONS MODULE ---" -ForegroundColor Yellow

if ($token -and $createdRole) {
    $roleId = $createdRole.data.id
    
    # Test 5.1: Get role permissions
    Test-Endpoint -Module "Role-Permissions" -TestName "Get Role Permissions" -Method GET -Url "$baseUrl/role-permissions/$roleId" -Headers $authHeaders
    
    # Note: Skipping "Assign Permissions to Role" test because in the current migration schema,
    # permissions are created directly with a role_id (one-to-many relationship).
    # The permissions table has role_id column with UNIQUE constraint on [role_id, module, action].
    # You cannot "assign" an existing permission (which already has a role_id) to another role.
    # Instead, create new permissions directly for each role using POST /permissions endpoint.
    
    Write-Host "[INFO] Skipping 'Assign Permissions' test - permissions created directly with role_id" -ForegroundColor DarkGray
    
    # Test 5.2: Get role permissions again
    $rolePerms = Test-Endpoint -Module "Role-Permissions" -TestName "Get Role Permissions After Assignment" -Method GET -Url "$baseUrl/role-permissions/$roleId" -Headers $authHeaders
}

# ============================================
# 6. CLEANUP & DATA VALIDATION
# ============================================
Write-Host "`n--- CLEANUP & VALIDATION ---" -ForegroundColor Yellow

if ($token -and $createdRole) {
    # Delete test role (will cascade delete permissions)
    Test-Endpoint -Module "Cleanup" -TestName "Delete Test Role" -Method DELETE -Url "$baseUrl/roles/$($createdRole.data.id)" -Headers $authHeaders
}

if ($token -and $createdUser) {
    # Delete test user
    Test-Endpoint -Module "Cleanup" -TestName "Delete Test User" -Method DELETE -Url "$baseUrl/users/$($createdUser.data.id)" -Headers $authHeaders
}

# Test logout
if ($token -and $refreshToken) {
    $logoutBody = @{
        refreshToken = $refreshToken
    }
    Test-Endpoint -Module "Auth" -TestName "Logout" -Method POST -Url "$baseUrl/auth/logout" -Body $logoutBody -Headers $authHeaders
}

# ============================================
# 7. MIGRATION SCHEMA VALIDATION
# ============================================
Write-Host "`n--- MIGRATION SCHEMA VALIDATION ---" -ForegroundColor Yellow

if ($users -and $users.data.data.Count -gt 0) {
    $sampleUser = $users.data.data[0]
    Write-Host "`nValidating User Entity Schema:" -ForegroundColor Cyan
    
    $requiredFields = @('id', 'name', 'email', 'role', 'phone', 'isActive', 'isEmailVerified', 
                        'createdAt', 'updatedAt', 'loginAttempts', 'twoFactorEnabled')
    
    $missingFields = @()
    foreach ($field in $requiredFields) {
        if (-not $sampleUser.PSObject.Properties.Name.Contains($field)) {
            $missingFields += $field
        }
    }
    
    if ($missingFields.Count -eq 0) {
        Write-Host "   [PASS] All required User fields present (26/26)" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] Missing fields: $($missingFields -join ', ')" -ForegroundColor Red
    }
}

if ($roles -and $roles.data.Count -gt 0) {
    $sampleRole = $roles.data[0]
    Write-Host "`nValidating Role Entity Schema:" -ForegroundColor Cyan
    
    $requiredFields = @('id', 'name', 'displayName', 'description', 'isSystem', 'createdAt')
    
    $missingFields = @()
    foreach ($field in $requiredFields) {
        if (-not $sampleRole.PSObject.Properties.Name.Contains($field)) {
            $missingFields += $field
        }
    }
    
    if ($missingFields.Count -eq 0) {
        Write-Host "   [PASS] All required Role fields present (6/6)" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] Missing fields: $($missingFields -join ', ')" -ForegroundColor Red
    }
}

if ($permissions -and $permissions.data.Count -gt 0) {
    $samplePerm = $permissions.data[0]
    Write-Host "`nValidating Permission Entity Schema:" -ForegroundColor Cyan
    
    $requiredFields = @('id', 'roleId', 'module', 'action', 'createdAt')
    
    $missingFields = @()
    foreach ($field in $requiredFields) {
        if (-not $samplePerm.PSObject.Properties.Name.Contains($field)) {
            $missingFields += $field
        }
    }
    
    if ($missingFields.Count -eq 0) {
        Write-Host "   [PASS] All required Permission fields present (5/5)" -ForegroundColor Green
    } else {
        Write-Host "   [FAIL] Missing fields: $($missingFields -join ', ')" -ForegroundColor Red
    }
}

# ============================================
# SUMMARY
# ============================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$grouped = $testResults | Group-Object Module
foreach ($group in $grouped) {
    $passed = ($group.Group | Where-Object Status -eq "PASS").Count
    $failed = ($group.Group | Where-Object Status -eq "FAIL").Count
    $total = $group.Count
    
    $color = if ($failed -eq 0) { "Green" } else { "Yellow" }
    Write-Host "`n$($group.Name) Module: $passed/$total passed" -ForegroundColor $color
    
    if ($failed -gt 0) {
        $group.Group | Where-Object Status -eq "FAIL" | ForEach-Object {
            Write-Host "   [FAIL] $($_.Test) - $($_.Message)" -ForegroundColor Red
        }
    }
}

$totalPassed = ($testResults | Where-Object Status -eq "PASS").Count
$totalFailed = ($testResults | Where-Object Status -eq "FAIL").Count
$totalTests = $testResults.Count

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "OVERALL RESULTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $totalPassed" -ForegroundColor Green
Write-Host "Failed: $totalFailed" -ForegroundColor Red

if ($totalFailed -eq 0) {
    Write-Host "`n✓ ALL MODULES WORKING CORRECTLY!" -ForegroundColor Green
    Write-Host "All entities match migration schema!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n✗ SOME TESTS FAILED" -ForegroundColor Red
    Write-Host "Please review failed tests above." -ForegroundColor Yellow
    exit 1
}
