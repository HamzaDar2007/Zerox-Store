# Test All Routes Script
$baseUrl = "http://localhost:3000"
$results = @()

function Test-Route {
    param($Method, $Endpoint, $Body, $UseAuth, $Description)
    
    $headers = @{"Content-Type" = "application/json"}
    if ($UseAuth -and $global:token) {
        $headers["Authorization"] = "Bearer $($global:token)"
    }
    
    try {
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            Headers = $headers
            ErrorAction = "Stop"
        }
        if ($Body) { $params["Body"] = ($Body | ConvertTo-Json -Depth 5) }
        
        $response = Invoke-RestMethod @params
        Write-Host "✅ $Method $Endpoint - $Description" -ForegroundColor Green
        return @{Status="PASS"; Route="$Method $Endpoint"; Message=$response.message}
    }
    catch {
        $err = $_.Exception.Message
        if ($_.Exception.Response) {
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $errBody = $reader.ReadToEnd() | ConvertFrom-Json
                $err = $errBody.message
            } catch {}
        }
        Write-Host "❌ $Method $Endpoint - $err" -ForegroundColor Red
        return @{Status="FAIL"; Route="$Method $Endpoint"; Message=$err}
    }
}

Write-Host "`n========== AUTH ROUTES ==========" -ForegroundColor Cyan

# 1. Login first to get token
Write-Host "`n--- Login ---"
$loginBody = @{email="superadmin@labverse.org"; password="SuperAdmin@123!"}
$loginResp = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body ($loginBody | ConvertTo-Json) -ContentType "application/json"
$global:token = $loginResp.data.accessToken
$global:refreshToken = $loginResp.data.refreshToken
$global:userId = $loginResp.data.user.id
Write-Host "✅ POST /auth/login - Login successful" -ForegroundColor Green

# 2. Register new user
$randNum = Get-Random -Maximum 99999
$results += Test-Route -Method "POST" -Endpoint "/auth/register" -Body @{name="Test$randNum"; email="test$randNum@test.com"; password="Test@123!"; phone="+92300$randNum"} -UseAuth $false -Description "Register new user"

# 3. Refresh token
$results += Test-Route -Method "POST" -Endpoint "/auth/refresh" -Body @{refreshToken=$global:refreshToken} -UseAuth $false -Description "Refresh token"

# 4. Forgot password
$results += Test-Route -Method "POST" -Endpoint "/auth/password-forgot" -Body @{email="superadmin@labverse.org"} -UseAuth $false -Description "Forgot password"

# 5. Reset password (will return "invalid token" error - this is expected behavior for test)
try {
    $resetBody = @{token="invalid-token"; password="NewPass@123!"} | ConvertTo-Json
    $resetResp = Invoke-RestMethod -Uri "$baseUrl/auth/reset-password" -Method POST -Body $resetBody -ContentType "application/json" -ErrorAction Stop
    $results += @{Status="PASS"; Route="POST /auth/reset-password"; Message="Reset password"}
} catch {
    $errMsg = ""
    if ($_.ErrorDetails.Message) {
        $errBody = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        $errMsg = $errBody.message
    }
    # "Invalid or expired reset token" means the endpoint works correctly
    if ($errMsg -eq "Invalid or expired reset token") {
        Write-Host "✅ POST /auth/reset-password - Endpoint works (rejects invalid token as expected)" -ForegroundColor Green
        $results += @{Status="PASS"; Route="POST /auth/reset-password"; Message="Rejects invalid token"}
    } else {
        Write-Host "❌ POST /auth/reset-password - $errMsg" -ForegroundColor Red
        $results += @{Status="FAIL"; Route="POST /auth/reset-password"; Message=$errMsg}
    }
}

Write-Host "`n========== USERS ROUTES ==========" -ForegroundColor Cyan

# GET /users/me
$results += Test-Route -Method "GET" -Endpoint "/users/me" -UseAuth $true -Description "Get current user profile"

# GET /users
$results += Test-Route -Method "GET" -Endpoint "/users" -UseAuth $true -Description "Get all users"

# POST /users (create new user)
$randNum2 = Get-Random -Maximum 99999
$results += Test-Route -Method "POST" -Endpoint "/users" -Body @{name="Created$randNum2"; email="created$randNum2@test.com"; password="Test@123!"; phone="+92301$randNum2"} -UseAuth $true -Description "Create user"

# GET /users/:id
$results += Test-Route -Method "GET" -Endpoint "/users/$($global:userId)" -UseAuth $true -Description "Get user by ID"

# PATCH /users/:id
$results += Test-Route -Method "PATCH" -Endpoint "/users/$($global:userId)" -Body @{name="Super Admin Updated"} -UseAuth $true -Description "Update user"

# GET /users/:id/permissions
$results += Test-Route -Method "GET" -Endpoint "/users/$($global:userId)/permissions" -UseAuth $true -Description "Get user permissions"

Write-Host "`n========== ROLES ROUTES ==========" -ForegroundColor Cyan

# GET /roles
$results += Test-Route -Method "GET" -Endpoint "/roles" -UseAuth $true -Description "Get all roles"

# Get a role ID first
$rolesResp = Invoke-RestMethod -Uri "$baseUrl/roles" -Method GET -Headers @{Authorization="Bearer $($global:token)"}
$roleId = $rolesResp.data[0].id

# GET /roles/:id
$results += Test-Route -Method "GET" -Endpoint "/roles/$roleId" -UseAuth $true -Description "Get role by ID"

# POST /roles (create new role)
$randRole = Get-Random -Maximum 99999
$results += Test-Route -Method "POST" -Endpoint "/roles" -Body @{name="test_role_$randRole"; description="Test role"} -UseAuth $true -Description "Create role"

# PATCH /roles/:id
$results += Test-Route -Method "PATCH" -Endpoint "/roles/$roleId" -Body @{description="Updated description"} -UseAuth $true -Description "Update role"

Write-Host "`n========== PERMISSIONS ROUTES ==========" -ForegroundColor Cyan

# GET /permissions
$results += Test-Route -Method "GET" -Endpoint "/permissions" -UseAuth $true -Description "Get all permissions"

# Get a permission ID
$permsResp = Invoke-RestMethod -Uri "$baseUrl/permissions" -Method GET -Headers @{Authorization="Bearer $($global:token)"}
if ($permsResp.data.Count -gt 0) {
    $permId = $permsResp.data[0].id
    
    # GET /permissions/:id
    $results += Test-Route -Method "GET" -Endpoint "/permissions/$permId" -UseAuth $true -Description "Get permission by ID"
    
    # GET /permissions/by-module
    $results += Test-Route -Method "GET" -Endpoint "/permissions/by-module?module=users" -UseAuth $true -Description "Get permissions by module"
}

# POST /permissions (create new permission)
$randPerm = Get-Random -Maximum 99999
$results += Test-Route -Method "POST" -Endpoint "/permissions" -Body @{roleId=$roleId; module="test_module"; action="test_action_$randPerm"} -UseAuth $true -Description "Create permission"

Write-Host "`n========== ROLE-PERMISSIONS ROUTES ==========" -ForegroundColor Cyan

# GET /role-permissions/:roleId
$results += Test-Route -Method "GET" -Endpoint "/role-permissions/$roleId" -UseAuth $true -Description "Get role permissions"

# POST /role-permissions/:roleId (assign permissions by IDs)
# First create a permission for this specific role, then verify it
$randPerm2 = Get-Random -Maximum 99999
$createPermBody = @{roleId=$roleId; module="test_rp"; action="action_$randPerm2"} | ConvertTo-Json
try {
    $createdPerm = Invoke-RestMethod -Uri "$baseUrl/permissions" -Method POST -Body $createPermBody -Headers @{Authorization="Bearer $($global:token)"; "Content-Type"="application/json"}
    $permIdForRole = $createdPerm.data.id
    $results += Test-Route -Method "POST" -Endpoint "/role-permissions/$roleId" -Body @{permissionIds=@($permIdForRole)} -UseAuth $true -Description "Verify permission belongs to role"
} catch {
    Write-Host "⚠️ Could not create permission for role-permissions test" -ForegroundColor Yellow
}

Write-Host "`n========== SUMMARY ==========" -ForegroundColor Yellow
$passed = ($results | Where-Object {$_.Status -eq "PASS"}).Count
$failed = ($results | Where-Object {$_.Status -eq "FAIL"}).Count
Write-Host "Total: $($results.Count) | Passed: $passed | Failed: $failed"

if ($failed -gt 0) {
    Write-Host "`nFailed Routes:" -ForegroundColor Red
    $results | Where-Object {$_.Status -eq "FAIL"} | ForEach-Object {
        Write-Host "  - $($_.Route): $($_.Message)" -ForegroundColor Red
    }
}
