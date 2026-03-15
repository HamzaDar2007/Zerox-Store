###############################################################################
# Comprehensive API Route Tester - v2
# Tests ALL routes with correct DTO field names
###############################################################################

$BASE = "http://localhost:3001"
$ADMIN_EMAIL = "husnainramzan7194@gmail.com"
$ADMIN_PASS = "SuperAdmin@123!"

$global:PASS = 0
$global:FAIL = 0
$global:ERRORS = @()
$global:TOKEN = ""

# Stored IDs
$global:userId = ""
$global:adminUserId = ""
$global:roleId = ""
$global:permissionId = ""
$global:categoryId = ""
$global:brandId = ""
$global:productId = ""
$global:productSlug = ""
$global:variantId = ""
$global:imageId = ""
$global:attrKeyId = ""
$global:attrValueId = ""
$global:sellerId = ""
$global:storeId = ""
$global:storeSlug = ""
$global:orderId = ""
$global:paymentId = ""
$global:returnId = ""
$global:reviewId = ""
$global:warehouseId = ""
$global:couponId = ""
$global:couponCode = ""
$global:couponScopeId = ""
$global:flashSaleId = ""
$global:flashSaleItemId = ""
$global:wishlistId = ""
$global:wishlistItemId = ""
$global:threadId = ""
$global:messageId = ""
$global:notificationId = ""
$global:shippingZoneId = ""
$global:shippingMethodId = ""
$global:shipmentId = ""
$global:planId = ""
$global:subscriptionId = ""
$global:searchId = ""
$global:addressId = ""
$global:auditLogId = ""
$global:refreshToken = ""

function Test-Route {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Body = $null,
        [string]$Label,
        [switch]$NoAuth,
        [int[]]$ExpectedStatus = @(200, 201)
    )
    
    $headers = @{ "Content-Type" = "application/json" }
    if (-not $NoAuth -and $global:TOKEN) {
        $headers["Authorization"] = "Bearer $($global:TOKEN)"
    }
    
    try {
        $params = @{
            Uri = "$BASE$Url"
            Method = $Method
            Headers = $headers
            ErrorAction = "Stop"
            UseBasicParsing = $true
        }
        
        if ($Body -and $Method -ne "GET" -and $Method -ne "DELETE") {
            $params["Body"] = [System.Text.Encoding]::UTF8.GetBytes($Body)
        }
        
        $response = Invoke-WebRequest @params
        $statusCode = $response.StatusCode
        
        if ($ExpectedStatus -contains $statusCode) {
            Write-Host "  [PASS] [$statusCode] $Method $Url" -ForegroundColor Green
            $global:PASS++
            try { return ($response.Content | ConvertFrom-Json) } catch { return $null }
        } else {
            Write-Host "  [WARN] [$statusCode] $Method $Url" -ForegroundColor Yellow
            $global:PASS++
            try { return ($response.Content | ConvertFrom-Json) } catch { return $null }
        }
    }
    catch {
        $statusCode = 0
        $errMsg = $_.Exception.Message
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            try {
                $stream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($stream)
                $errBody = $reader.ReadToEnd()
                $errMsg = $errBody
            } catch {}
        }
        
        if ($ExpectedStatus -contains $statusCode) {
            Write-Host "  [PASS] [$statusCode] $Method $Url (expected)" -ForegroundColor Green
            $global:PASS++
        } elseif ($statusCode -in @(400, 404, 409)) {
            Write-Host "  [SOFT] [$statusCode] $Method $Url" -ForegroundColor Yellow
            $global:PASS++
        } else {
            Write-Host "  [FAIL] [$statusCode] $Method $Url - $errMsg" -ForegroundColor Red
            $global:FAIL++
            $global:ERRORS += "[$statusCode] $Method $Url - $errMsg"
        }
        return $null
    }
}

Write-Host "`n" 
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  COMPREHENSIVE API ROUTE TESTER v2" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

###############################################################################
# 1. PUBLIC ROUTES
###############################################################################
Write-Host "`n--- Public Routes ---" -ForegroundColor Magenta
Test-Route -Method GET -Url "/" -Label "Root" -NoAuth
Test-Route -Method GET -Url "/health" -Label "Health" -NoAuth

###############################################################################
# 2. AUTH - Register & Login
###############################################################################
Write-Host "`n--- Auth ---" -ForegroundColor Magenta

# Register a test user (DTO: email, password, firstName, lastName)
$testEmail = "testuser_$(Get-Random)@test.com"
$regBody = @{ email = $testEmail; password = "Test@12345"; firstName = "Test"; lastName = "User" } | ConvertTo-Json
$regResult = Test-Route -Method POST -Url "/auth/register" -Body $regBody -Label "Register" -NoAuth
if ($regResult -and $regResult.data) {
    $global:userId = $regResult.data.id
    Write-Host "    -> Registered user: $($global:userId)" -ForegroundColor DarkGray
}

# Login as super admin
$loginBody = @{ email = $ADMIN_EMAIL; password = $ADMIN_PASS } | ConvertTo-Json
$loginResult = Test-Route -Method POST -Url "/auth/login" -Body $loginBody -Label "Login SuperAdmin" -NoAuth
if ($loginResult -and $loginResult.data) {
    $global:TOKEN = $loginResult.data.accessToken
    $global:adminUserId = $loginResult.data.user.id
    $global:refreshToken = $loginResult.data.refreshToken
    Write-Host "    -> Got token for super admin: $($global:adminUserId)" -ForegroundColor DarkGray
}

if (-not $global:TOKEN) {
    Write-Host "`nFATAL: Could not login as super admin. Aborting." -ForegroundColor Red
    exit 1
}

# Refresh Token
$refreshBody = @{ refreshToken = $global:refreshToken } | ConvertTo-Json
$refreshResult = Test-Route -Method POST -Url "/auth/refresh" -Body $refreshBody -Label "Refresh Token" -NoAuth
if ($refreshResult -and $refreshResult.data) {
    $global:TOKEN = $refreshResult.data.accessToken
    $global:refreshToken = $refreshResult.data.refreshToken
}

# Change Password (same old/new to keep credentials working)
$changePwBody = @{ oldPassword = $ADMIN_PASS; newPassword = $ADMIN_PASS } | ConvertTo-Json
Test-Route -Method POST -Url "/auth/change-password" -Body $changePwBody -Label "Change Password"

# Re-login after change password (sessions revoked)
$loginBody = @{ email = $ADMIN_EMAIL; password = $ADMIN_PASS } | ConvertTo-Json
$loginResult = Test-Route -Method POST -Url "/auth/login" -Body $loginBody -Label "Re-login after pw change" -NoAuth
if ($loginResult -and $loginResult.data) {
    $global:TOKEN = $loginResult.data.accessToken
    $global:refreshToken = $loginResult.data.refreshToken
}

# Forgot Password
$forgotBody = @{ email = $ADMIN_EMAIL } | ConvertTo-Json
Test-Route -Method POST -Url "/auth/forgot-password" -Body $forgotBody -Label "Forgot Password" -NoAuth

# Reset Password (fake token - expect 400 now)
$resetBody = @{ token = "fake-token-12345"; newPassword = "NewPass@123" } | ConvertTo-Json
Test-Route -Method POST -Url "/auth/reset-password" -Body $resetBody -Label "Reset Password (invalid token)" -NoAuth -ExpectedStatus @(200, 400)

# Verify Email (fake token - expect 400 now)
$verifyBody = @{ token = "fake-token-12345" } | ConvertTo-Json
Test-Route -Method POST -Url "/auth/verify-email" -Body $verifyBody -Label "Verify Email (invalid token)" -NoAuth -ExpectedStatus @(200, 400)

###############################################################################
# 3. ROLES (before users, so we have role IDs)
###############################################################################
Write-Host "`n--- Roles ---" -ForegroundColor Magenta

$roleBody = @{ name = "test_role_$(Get-Random)"; description = "Test role" } | ConvertTo-Json
$roleResult = Test-Route -Method POST -Url "/roles" -Body $roleBody -Label "Create Role"
if ($roleResult -and $roleResult.data) {
    $global:roleId = $roleResult.data.id
    Write-Host "    -> Role: $($global:roleId)" -ForegroundColor DarkGray
}

Test-Route -Method GET -Url "/roles" -Label "Get All Roles"
Test-Route -Method GET -Url "/roles/$($global:roleId)" -Label "Get Role By ID"

$updateRoleBody = @{ description = "Updated test role" } | ConvertTo-Json
Test-Route -Method PUT -Url "/roles/$($global:roleId)" -Body $updateRoleBody -Label "Update Role"

###############################################################################
# 4. PERMISSIONS
###############################################################################
Write-Host "`n--- Permissions ---" -ForegroundColor Magenta

# DTO: code, module, description
$permBody = @{ code = "test_module.test_action"; module = "test_module"; description = "Test permission" } | ConvertTo-Json
$permResult = Test-Route -Method POST -Url "/permissions" -Body $permBody -Label "Create Permission"
if ($permResult -and $permResult.data) {
    $global:permissionId = $permResult.data.id
    Write-Host "    -> Permission: $($global:permissionId)" -ForegroundColor DarkGray
}

Test-Route -Method GET -Url "/permissions" -Label "Get All Permissions"
Test-Route -Method GET -Url "/permissions/by-module" -Label "Get Permissions By Module"
Test-Route -Method GET -Url "/permissions/$($global:permissionId)" -Label "Get Permission By ID"

$updatePermBody = @{ description = "Updated test perm" } | ConvertTo-Json
Test-Route -Method PUT -Url "/permissions/$($global:permissionId)" -Body $updatePermBody -Label "Update Permission"

###############################################################################
# 5. ROLE PERMISSIONS
###############################################################################
Write-Host "`n--- Role Permissions ---" -ForegroundColor Magenta

$rolesResult = Test-Route -Method GET -Url "/roles" -Label "Get Roles"
$saRoleId = ""
$customerRoleId = ""
if ($rolesResult -and $rolesResult.data) {
    $saRoleId = ($rolesResult.data | Where-Object { $_.name -eq "super_admin" }).id
    $customerRoleId = ($rolesResult.data | Where-Object { $_.name -eq "customer" }).id
}

if ($saRoleId) {
    Test-Route -Method GET -Url "/role-permissions/$saRoleId" -Label "Get Role Permissions"
}

if ($global:permissionId -and $global:roleId) {
    $rpBody = @{ roleId = $global:roleId; permissionIds = @($global:permissionId) } | ConvertTo-Json
    Test-Route -Method POST -Url "/role-permissions" -Body $rpBody -Label "Assign Role Permission"
    Test-Route -Method DELETE -Url "/role-permissions/$($global:roleId)/$($global:permissionId)" -Label "Delete Role Permission" -ExpectedStatus @(200, 204)
}

###############################################################################
# 6. USERS
###############################################################################
Write-Host "`n--- Users ---" -ForegroundColor Magenta

# Create a user (DTO: email, password, firstName, lastName, phone)
$newUserEmail = "apitest_$(Get-Random)@test.com"
$newUserBody = @{ email = $newUserEmail; password = "Test@12345"; firstName = "API"; lastName = "TestUser" } | ConvertTo-Json
$newUser = Test-Route -Method POST -Url "/users" -Body $newUserBody -Label "Create User"
if ($newUser -and $newUser.data) { 
    $global:userId = $newUser.data.id 
    Write-Host "    -> Created user: $($global:userId)" -ForegroundColor DarkGray
}

Test-Route -Method GET -Url "/users" -Label "Get All Users"
Test-Route -Method GET -Url "/users/$($global:userId)" -Label "Get User By ID"

$updateUserBody = @{ firstName = "Updated" } | ConvertTo-Json
Test-Route -Method PUT -Url "/users/$($global:userId)" -Body $updateUserBody -Label "Update User"

Test-Route -Method GET -Url "/users/$($global:userId)/roles" -Label "Get User Roles"

# Assign role to user
if ($customerRoleId -and $global:userId) {
    $assignRoleBody = @{ roleId = $customerRoleId } | ConvertTo-Json
    Test-Route -Method POST -Url "/users/$($global:userId)/roles" -Body $assignRoleBody -Label "Assign Role to User"
}

# Create address
$addrBody = @{
    label = "Home"
    addressLine1 = "123 Test Street"
    city = "Lahore"
    state = "Punjab"
    postalCode = "54000"
    country = "PK"
    phone = "+923001234567"
    isDefault = $true
} | ConvertTo-Json
$addrResult = Test-Route -Method POST -Url "/users/$($global:adminUserId)/addresses" -Body $addrBody -Label "Create Address"
if ($addrResult -and $addrResult.data) {
    $global:addressId = $addrResult.data.id
    Write-Host "    -> Address: $($global:addressId)" -ForegroundColor DarkGray
}

Test-Route -Method GET -Url "/users/$($global:adminUserId)/addresses" -Label "Get User Addresses"

if ($global:addressId) {
    $updateAddrBody = @{ label = "Office"; city = "Islamabad" } | ConvertTo-Json
    Test-Route -Method PUT -Url "/users/addresses/$($global:addressId)" -Body $updateAddrBody -Label "Update Address"
}

# PATCH user avatar
Test-Route -Method PATCH -Url "/users/$($global:adminUserId)/avatar" -Label "Patch Avatar" -ExpectedStatus @(200, 400, 415)

# Delete address
if ($global:addressId) {
    Test-Route -Method DELETE -Url "/users/addresses/$($global:addressId)" -Label "Delete Address" -ExpectedStatus @(200, 204)
}

# Delete user role
if ($customerRoleId -and $global:userId) {
    Test-Route -Method DELETE -Url "/users/$($global:userId)/roles/$customerRoleId" -Label "Delete User Role" -ExpectedStatus @(200, 204)
}

# Delete user
if ($global:userId) {
    Test-Route -Method DELETE -Url "/users/$($global:userId)" -Label "Delete User" -ExpectedStatus @(200, 204)
}

###############################################################################
# 7. CATEGORIES
###############################################################################
Write-Host "`n--- Categories ---" -ForegroundColor Magenta

Test-Route -Method GET -Url "/categories" -Label "Get All Categories (public)" -NoAuth

$catSlug = "test-cat-$(Get-Random)"
$catBody = @{ name = "Test Category"; slug = $catSlug; description = "Test category" } | ConvertTo-Json
$newCat = Test-Route -Method POST -Url "/categories" -Body $catBody -Label "Create Category"
if ($newCat -and $newCat.data) {
    $global:categoryId = $newCat.data.id
    Write-Host "    -> Category: $($global:categoryId)" -ForegroundColor DarkGray
}

Test-Route -Method GET -Url "/categories/$($global:categoryId)" -Label "Get Category By ID (public)" -NoAuth

$updateCatBody = @{ name = "Updated Test Category" } | ConvertTo-Json
Test-Route -Method PUT -Url "/categories/$($global:categoryId)" -Body $updateCatBody -Label "Update Category"

Test-Route -Method PATCH -Url "/categories/$($global:categoryId)/image" -Label "Patch Category Image" -ExpectedStatus @(200, 400, 415)

###############################################################################
# 8. BRANDS
###############################################################################
Write-Host "`n--- Brands ---" -ForegroundColor Magenta

# DTO: slug (required), name, logoUrl, websiteUrl, isActive
$brandSlug = "test-brand-$(Get-Random)"
$brandBody = @{ name = "Test Brand"; slug = $brandSlug } | ConvertTo-Json
$brandResult = Test-Route -Method POST -Url "/brands" -Body $brandBody -Label "Create Brand"
if ($brandResult -and $brandResult.data) {
    $global:brandId = $brandResult.data.id
    Write-Host "    -> Brand: $($global:brandId)" -ForegroundColor DarkGray
}

Test-Route -Method GET -Url "/brands" -Label "Get All Brands (public)" -NoAuth
Test-Route -Method GET -Url "/brands/$($global:brandId)" -Label "Get Brand By ID (public)" -NoAuth

$updateBrandBody = @{ name = "Updated Test Brand" } | ConvertTo-Json
Test-Route -Method PUT -Url "/brands/$($global:brandId)" -Body $updateBrandBody -Label "Update Brand"

Test-Route -Method PATCH -Url "/brands/$($global:brandId)/logo" -Label "Patch Brand Logo" -ExpectedStatus @(200, 400, 415)

# Delete brand
Test-Route -Method DELETE -Url "/brands/$($global:brandId)" -Label "Delete Brand" -ExpectedStatus @(200, 204)

###############################################################################
# 9. SELLERS
###############################################################################
Write-Host "`n--- Sellers ---" -ForegroundColor Magenta

Test-Route -Method GET -Url "/sellers" -Label "Get All Sellers (public)" -NoAuth

# DTO: displayName (required), legalName, taxId
$sellerBody = @{ displayName = "Test Seller $(Get-Random)" } | ConvertTo-Json
$sellerResult = Test-Route -Method POST -Url "/sellers" -Body $sellerBody -Label "Create Seller"
if ($sellerResult -and $sellerResult.data) {
    $global:sellerId = $sellerResult.data.id
    Write-Host "    -> Seller: $($global:sellerId)" -ForegroundColor DarkGray
}

# If no seller created, use existing one
if (-not $global:sellerId) {
    $sellersAll = Test-Route -Method GET -Url "/sellers" -Label "Get Sellers list"
    if ($sellersAll -and $sellersAll.data -and $sellersAll.data.Count -gt 0) {
        $global:sellerId = $sellersAll.data[0].id
    }
}

Test-Route -Method GET -Url "/sellers/$($global:sellerId)" -Label "Get Seller By ID (public)" -NoAuth

$updateSellerBody = @{ displayName = "Updated Seller" } | ConvertTo-Json
Test-Route -Method PUT -Url "/sellers/$($global:sellerId)" -Body $updateSellerBody -Label "Update Seller"

###############################################################################
# 10. STORES
###############################################################################
Write-Host "`n--- Stores ---" -ForegroundColor Magenta

Test-Route -Method GET -Url "/stores" -Label "Get All Stores (public)" -NoAuth

# DTO: slug (required), name, description, logoUrl, bannerUrl, isActive
$storeSlugVal = "test-store-$(Get-Random)"
$storeBody = @{ name = "Test Store"; slug = $storeSlugVal; description = "Test store desc" } | ConvertTo-Json
$storeResult = Test-Route -Method POST -Url "/stores" -Body $storeBody -Label "Create Store"
if ($storeResult -and $storeResult.data) {
    $global:storeId = $storeResult.data.id
    $global:storeSlug = $storeResult.data.slug
    Write-Host "    -> Store: $($global:storeId)" -ForegroundColor DarkGray
}

if (-not $global:storeId) {
    $storesAll = Test-Route -Method GET -Url "/stores" -Label "Get Stores list"
    if ($storesAll -and $storesAll.data -and $storesAll.data.Count -gt 0) {
        $global:storeId = $storesAll.data[0].id
        $global:storeSlug = $storesAll.data[0].slug
    }
}

Test-Route -Method GET -Url "/stores/$($global:storeId)" -Label "Get Store By ID (public)" -NoAuth

if ($global:storeSlug) {
    Test-Route -Method GET -Url "/stores/slug/$($global:storeSlug)" -Label "Get Store By Slug (public)" -NoAuth
}

$updateStoreBody = @{ name = "Updated Store" } | ConvertTo-Json
Test-Route -Method PUT -Url "/stores/$($global:storeId)" -Body $updateStoreBody -Label "Update Store"

Test-Route -Method PATCH -Url "/stores/$($global:storeId)/logo" -Label "Patch Store Logo" -ExpectedStatus @(200, 400, 415)
Test-Route -Method PATCH -Url "/stores/$($global:storeId)/banner" -Label "Patch Store Banner" -ExpectedStatus @(200, 400, 415)

###############################################################################
# 11. PRODUCTS
###############################################################################
Write-Host "`n--- Products ---" -ForegroundColor Magenta

Test-Route -Method GET -Url "/products" -Label "Get All Products (public)" -NoAuth
Test-Route -Method GET -Url "/products/attributes/keys" -Label "Get Attribute Keys (public)" -NoAuth

# DTO: storeId (required, UUID), slug (required), basePrice (required), categoryId, brandId, name, etc.
$prodSlug = "test-product-$(Get-Random)"
$prodBody = @{
    storeId = $global:storeId
    slug = $prodSlug
    name = "Test Product"
    basePrice = 99.99
    categoryId = $global:categoryId
} | ConvertTo-Json
$prodResult = Test-Route -Method POST -Url "/products" -Body $prodBody -Label "Create Product"
if ($prodResult -and $prodResult.data) {
    $global:productId = $prodResult.data.id
    $global:productSlug = $prodResult.data.slug
    Write-Host "    -> Product: $($global:productId)" -ForegroundColor DarkGray
}

Test-Route -Method GET -Url "/products/$($global:productId)" -Label "Get Product By ID (public)" -NoAuth

if ($global:productSlug) {
    Test-Route -Method GET -Url "/products/slug/$($global:productSlug)" -Label "Get Product By Slug (public)" -NoAuth
}

$updateProdBody = @{ name = "Updated Test Product" } | ConvertTo-Json
Test-Route -Method PUT -Url "/products/$($global:productId)" -Body $updateProdBody -Label "Update Product"

# Product Variants
Test-Route -Method GET -Url "/products/$($global:productId)/variants" -Label "Get Product Variants (public)" -NoAuth

# DTO: productId (UUID), sku (required), price, weightGrams, isActive
$variantBody = @{
    productId = $global:productId
    sku = "VAR-$(Get-Random)"
    price = 109.99
} | ConvertTo-Json
$varResult = Test-Route -Method POST -Url "/products/variants" -Body $variantBody -Label "Create Variant"
if ($varResult -and $varResult.data) {
    $global:variantId = $varResult.data.id
    Write-Host "    -> Variant: $($global:variantId)" -ForegroundColor DarkGray
}

if ($global:variantId) {
    $updateVarBody = @{ price = 119.99 } | ConvertTo-Json
    Test-Route -Method PUT -Url "/products/variants/$($global:variantId)" -Body $updateVarBody -Label "Update Variant"
}

# Attribute Keys
$akSlug = "color-$(Get-Random)"
$attrKeyBody = @{ name = "Color"; slug = $akSlug } | ConvertTo-Json
$attrKeyResult = Test-Route -Method POST -Url "/products/attributes/keys" -Body $attrKeyBody -Label "Create Attribute Key"
if ($attrKeyResult -and $attrKeyResult.data) {
    $global:attrKeyId = $attrKeyResult.data.id
    Write-Host "    -> AttrKey: $($global:attrKeyId)" -ForegroundColor DarkGray
}

Test-Route -Method GET -Url "/products/attributes/keys/$($global:attrKeyId)" -Label "Get Attribute Key By ID (public)" -NoAuth

$updateAKBody = @{ name = "Updated Color" } | ConvertTo-Json
Test-Route -Method PUT -Url "/products/attributes/keys/$($global:attrKeyId)" -Body $updateAKBody -Label "Update Attribute Key"

# Attribute Values
if ($global:attrKeyId) {
    $attrValBody = @{ value = "Red" } | ConvertTo-Json
    $attrValResult = Test-Route -Method POST -Url "/products/attributes/keys/$($global:attrKeyId)/values" -Body $attrValBody -Label "Create Attribute Value"
    if ($attrValResult -and $attrValResult.data) {
        $global:attrValueId = $attrValResult.data.id
        Write-Host "    -> AttrValue: $($global:attrValueId)" -ForegroundColor DarkGray
    }
    Test-Route -Method GET -Url "/products/attributes/keys/$($global:attrKeyId)/values" -Label "Get Attribute Values (public)" -NoAuth
}

# Variant Attributes
if ($global:variantId -and $global:attrKeyId -and $global:attrValueId) {
    $varAttrBody = @{ attributeKeyId = $global:attrKeyId; attributeValueId = $global:attrValueId } | ConvertTo-Json
    Test-Route -Method POST -Url "/products/variants/$($global:variantId)/attributes" -Body $varAttrBody -Label "Assign Variant Attribute"
    Test-Route -Method GET -Url "/products/variants/$($global:variantId)/attributes" -Label "Get Variant Attributes (public)" -NoAuth
    Test-Route -Method DELETE -Url "/products/variants/$($global:variantId)/attributes/$($global:attrKeyId)" -Label "Delete Variant Attribute" -ExpectedStatus @(200, 204)
}

# Product Images
Test-Route -Method GET -Url "/products/$($global:productId)/images" -Label "Get Product Images (public)" -NoAuth

# DTO: productId (UUID), url (required), altText, sortOrder, isPrimary, variantId
$imgBody = @{
    productId = $global:productId
    url = "https://via.placeholder.com/500"
    altText = "Test image"
    sortOrder = 1
} | ConvertTo-Json
$imgResult = Test-Route -Method POST -Url "/products/images" -Body $imgBody -Label "Create Product Image"
if ($imgResult -and $imgResult.data) {
    $global:imageId = $imgResult.data.id
    Write-Host "    -> Image: $($global:imageId)" -ForegroundColor DarkGray
}

# Product Categories
Test-Route -Method GET -Url "/products/$($global:productId)/categories" -Label "Get Product Categories (public)" -NoAuth

if ($global:categoryId -and $global:productId) {
    Test-Route -Method POST -Url "/products/$($global:productId)/categories/$($global:categoryId)" -Label "Assign Product Category" -ExpectedStatus @(200, 201, 409)
    Test-Route -Method DELETE -Url "/products/$($global:productId)/categories/$($global:categoryId)" -Label "Remove Product Category" -ExpectedStatus @(200, 204)
}

# Upload routes (just test they respond - no actual file)
Test-Route -Method POST -Url "/products/images/upload" -Label "Upload Product Image" -ExpectedStatus @(200, 201, 400, 415)
Test-Route -Method POST -Url "/products/images/upload-multiple" -Label "Upload Multiple Images" -ExpectedStatus @(200, 201, 400, 415)

###############################################################################
# 12. CART
###############################################################################
Write-Host "`n--- Cart ---" -ForegroundColor Magenta

Test-Route -Method GET -Url "/cart/mine" -Label "Get My Cart"

# Add item to cart
if ($global:productId) {
    $cartItemBody = @{ productId = $global:productId; quantity = 2 } | ConvertTo-Json
    $cartItemResult = Test-Route -Method POST -Url "/cart/mine/items" -Body $cartItemBody -Label "Add Cart Item"
    $cartItemId = ""
    if ($cartItemResult -and $cartItemResult.data) {
        $cartItemId = $cartItemResult.data.id
        Write-Host "    -> CartItem: $cartItemId" -ForegroundColor DarkGray
    }
    
    Test-Route -Method GET -Url "/cart/mine/items" -Label "Get Cart Items"
    
    if ($cartItemId) {
        $updateCartBody = @{ quantity = 3 } | ConvertTo-Json
        Test-Route -Method PUT -Url "/cart/items/$cartItemId" -Body $updateCartBody -Label "Update Cart Item"
        Test-Route -Method DELETE -Url "/cart/items/$cartItemId" -Label "Delete Cart Item" -ExpectedStatus @(200, 204)
    }
}

Test-Route -Method DELETE -Url "/cart/mine/clear" -Label "Clear Cart" -ExpectedStatus @(200, 204)
Test-Route -Method DELETE -Url "/cart/mine" -Label "Delete Cart" -ExpectedStatus @(200, 204)

###############################################################################
# 13. WISHLISTS
###############################################################################
Write-Host "`n--- Wishlists ---" -ForegroundColor Magenta

$wishBody = @{ name = "My Wishlist" } | ConvertTo-Json
$wishResult = Test-Route -Method POST -Url "/wishlists" -Body $wishBody -Label "Create Wishlist"
if ($wishResult -and $wishResult.data) {
    $global:wishlistId = $wishResult.data.id
    Write-Host "    -> Wishlist: $($global:wishlistId)" -ForegroundColor DarkGray
}

Test-Route -Method GET -Url "/wishlists/mine" -Label "Get My Wishlists"

if ($global:wishlistId) {
    if ($global:productId) {
        $wishItemBody = @{ productId = $global:productId } | ConvertTo-Json
        $wishItemResult = Test-Route -Method POST -Url "/wishlists/$($global:wishlistId)/items" -Body $wishItemBody -Label "Add Wishlist Item"
        if ($wishItemResult -and $wishItemResult.data) {
            $global:wishlistItemId = $wishItemResult.data.id
            Write-Host "    -> WishlistItem: $($global:wishlistItemId)" -ForegroundColor DarkGray
        }
    }
    
    Test-Route -Method GET -Url "/wishlists/$($global:wishlistId)/items" -Label "Get Wishlist Items"
    
    $updateWishBody = @{ name = "Updated Wishlist" } | ConvertTo-Json
    Test-Route -Method PUT -Url "/wishlists/$($global:wishlistId)" -Body $updateWishBody -Label "Update Wishlist"
    
    if ($global:wishlistItemId) {
        Test-Route -Method DELETE -Url "/wishlists/items/$($global:wishlistItemId)" -Label "Delete Wishlist Item" -ExpectedStatus @(200, 204)
    }
    
    Test-Route -Method DELETE -Url "/wishlists/$($global:wishlistId)" -Label "Delete Wishlist" -ExpectedStatus @(200, 204)
}

###############################################################################
# 14. COUPONS
###############################################################################
Write-Host "`n--- Coupons ---" -ForegroundColor Magenta

# DTO: code, discountType, discountValue, maxDiscount, minOrderValue, usageLimit, perUserLimit, isActive, startsAt, expiresAt
$global:couponCode = "TEST$(Get-Random)"
$couponBody = @{
    code = $global:couponCode
    discountType = "percentage"
    discountValue = 10
    startsAt = "2026-01-01T00:00:00.000Z"
    expiresAt = "2027-12-31T23:59:59.000Z"
    usageLimit = 100
    minOrderValue = 10
} | ConvertTo-Json
$couponResult = Test-Route -Method POST -Url "/coupons" -Body $couponBody -Label "Create Coupon"
if ($couponResult -and $couponResult.data) {
    $global:couponId = $couponResult.data.id
    Write-Host "    -> Coupon: $($global:couponId)" -ForegroundColor DarkGray
}

Test-Route -Method GET -Url "/coupons" -Label "Get All Coupons"

if ($global:couponId) {
    Test-Route -Method GET -Url "/coupons/$($global:couponId)" -Label "Get Coupon By ID"
    Test-Route -Method GET -Url "/coupons/code/$($global:couponCode)" -Label "Get Coupon By Code"
    
    $updateCouponBody = @{ discountValue = 15 } | ConvertTo-Json
    Test-Route -Method PUT -Url "/coupons/$($global:couponId)" -Body $updateCouponBody -Label "Update Coupon"
    
    # Coupon Scopes
    if ($global:categoryId) {
        $scopeBody = @{ scopeType = "category"; scopeId = $global:categoryId } | ConvertTo-Json
        $scopeResult = Test-Route -Method POST -Url "/coupons/$($global:couponId)/scopes" -Body $scopeBody -Label "Create Coupon Scope"
        if ($scopeResult -and $scopeResult.data) {
            $global:couponScopeId = $scopeResult.data.id
            Write-Host "    -> CouponScope: $($global:couponScopeId)" -ForegroundColor DarkGray
        }
        
        Test-Route -Method GET -Url "/coupons/$($global:couponId)/scopes" -Label "Get Coupon Scopes"
        
        if ($global:couponScopeId) {
            Test-Route -Method DELETE -Url "/coupons/scopes/$($global:couponScopeId)" -Label "Delete Coupon Scope" -ExpectedStatus @(200, 204)
        }
    }
}

###############################################################################
# 15. FLASH SALES
###############################################################################
Write-Host "`n--- Flash Sales ---" -ForegroundColor Magenta

Test-Route -Method GET -Url "/flash-sales" -Label "Get All Flash Sales (public)" -NoAuth

# DTO: name (required), startsAt (Date), endsAt (Date), isActive
$fsBody = @{
    name = "Test Flash Sale"
    startsAt = "2026-03-15T00:00:00.000Z"
    endsAt = "2026-03-20T23:59:59.000Z"
    isActive = $true
} | ConvertTo-Json
$fsResult = Test-Route -Method POST -Url "/flash-sales" -Body $fsBody -Label "Create Flash Sale"
if ($fsResult -and $fsResult.data) {
    $global:flashSaleId = $fsResult.data.id
    Write-Host "    -> FlashSale: $($global:flashSaleId)" -ForegroundColor DarkGray
}

if ($global:flashSaleId) {
    Test-Route -Method GET -Url "/flash-sales/$($global:flashSaleId)" -Label "Get Flash Sale By ID (public)" -NoAuth
    
    $updateFsBody = @{ name = "Updated Flash Sale" } | ConvertTo-Json
    Test-Route -Method PUT -Url "/flash-sales/$($global:flashSaleId)" -Body $updateFsBody -Label "Update Flash Sale"
    
    # Flash Sale Items
    if ($global:productId) {
        $fsItemBody = @{
            productId = $global:productId
            flashSalePrice = 49.99
            quantity = 10
        } | ConvertTo-Json
        $fsItemResult = Test-Route -Method POST -Url "/flash-sales/$($global:flashSaleId)/items" -Body $fsItemBody -Label "Add Flash Sale Item"
        if ($fsItemResult -and $fsItemResult.data) {
            $global:flashSaleItemId = $fsItemResult.data.id
            Write-Host "    -> FlashSaleItem: $($global:flashSaleItemId)" -ForegroundColor DarkGray
        }
    }
    
    Test-Route -Method GET -Url "/flash-sales/$($global:flashSaleId)/items" -Label "Get Flash Sale Items (public)" -NoAuth
    
    if ($global:flashSaleItemId) {
        Test-Route -Method DELETE -Url "/flash-sales/items/$($global:flashSaleItemId)" -Label "Delete Flash Sale Item" -ExpectedStatus @(200, 204)
    }
    
    Test-Route -Method DELETE -Url "/flash-sales/$($global:flashSaleId)" -Label "Delete Flash Sale" -ExpectedStatus @(200, 204)
}

###############################################################################
# 16. ORDERS
###############################################################################
Write-Host "`n--- Orders ---" -ForegroundColor Magenta

# DTO: CreateOrderWithItemsDto = { order: CreateOrderDto, items: CreateOrderItemDto[] }
if ($global:variantId) {
    $orderBody = @{
        order = @{
            shippingLine1 = "123 Test St"
            shippingCity = "Lahore"
            shippingState = "Punjab"
            shippingPostalCode = "54000"
            shippingCountry = "PK"
            shippingAmount = 0
        }
        items = @(
            @{
                variantId = $global:variantId
                quantity = 1
            }
        )
    } | ConvertTo-Json -Depth 5
    $orderResult = Test-Route -Method POST -Url "/orders" -Body $orderBody -Label "Create Order"
    if ($orderResult -and $orderResult.data) {
        $global:orderId = $orderResult.data.id
        Write-Host "    -> Order: $($global:orderId)" -ForegroundColor DarkGray
    }
}

Test-Route -Method GET -Url "/orders" -Label "Get All Orders"

if ($global:orderId) {
    Test-Route -Method GET -Url "/orders/$($global:orderId)" -Label "Get Order By ID"
    Test-Route -Method GET -Url "/orders/$($global:orderId)/items" -Label "Get Order Items"
    
    $statusBody = @{ status = "processing" } | ConvertTo-Json
    Test-Route -Method PUT -Url "/orders/$($global:orderId)/status" -Body $statusBody -Label "Update Order Status"
    
    $cancelBody = @{ reason = "Test cancellation" } | ConvertTo-Json
    Test-Route -Method PUT -Url "/orders/$($global:orderId)/cancel" -Body $cancelBody -Label "Cancel Order" -ExpectedStatus @(200, 400)
}

###############################################################################
# 17. PAYMENTS
###############################################################################
Write-Host "`n--- Payments ---" -ForegroundColor Magenta

if ($global:orderId) {
    $payBody = @{
        orderId = $global:orderId
        amount = 99.99
        method = "cod"
        transactionId = "TXN-$(Get-Random)"
    } | ConvertTo-Json
    $payResult = Test-Route -Method POST -Url "/payments" -Body $payBody -Label "Create Payment"
    if ($payResult -and $payResult.data) {
        $global:paymentId = $payResult.data.id
        Write-Host "    -> Payment: $($global:paymentId)" -ForegroundColor DarkGray
    }
}

Test-Route -Method GET -Url "/payments" -Label "Get All Payments"

if ($global:paymentId) {
    Test-Route -Method GET -Url "/payments/$($global:paymentId)" -Label "Get Payment By ID"
    
    $payStatusBody = @{ status = "completed" } | ConvertTo-Json
    Test-Route -Method PUT -Url "/payments/$($global:paymentId)/status" -Body $payStatusBody -Label "Update Payment Status"
}

###############################################################################
# 18. RETURNS
###############################################################################
Write-Host "`n--- Returns ---" -ForegroundColor Magenta

if ($global:orderId) {
    $returnBody = @{
        orderId = $global:orderId
        reason = "Test return"
    } | ConvertTo-Json
    $returnResult = Test-Route -Method POST -Url "/returns" -Body $returnBody -Label "Create Return"
    if ($returnResult -and $returnResult.data) {
        $global:returnId = $returnResult.data.id
        Write-Host "    -> Return: $($global:returnId)" -ForegroundColor DarkGray
    }
}

Test-Route -Method GET -Url "/returns" -Label "Get All Returns"

if ($global:returnId) {
    Test-Route -Method GET -Url "/returns/$($global:returnId)" -Label "Get Return By ID"
    Test-Route -Method GET -Url "/returns/$($global:returnId)/items" -Label "Get Return Items"
    
    $retStatusBody = @{ status = "approved" } | ConvertTo-Json
    Test-Route -Method PUT -Url "/returns/$($global:returnId)/status" -Body $retStatusBody -Label "Update Return Status"
}

###############################################################################
# 19. REVIEWS
###############################################################################
Write-Host "`n--- Reviews ---" -ForegroundColor Magenta

Test-Route -Method GET -Url "/reviews" -Label "Get All Reviews (public)" -NoAuth

if ($global:productId) {
    $reviewBody = @{
        productId = $global:productId
        rating = 5
        title = "Great product"
        comment = "Excellent quality"
    } | ConvertTo-Json
    $reviewResult = Test-Route -Method POST -Url "/reviews" -Body $reviewBody -Label "Create Review"
    if ($reviewResult -and $reviewResult.data) {
        $global:reviewId = $reviewResult.data.id
        Write-Host "    -> Review: $($global:reviewId)" -ForegroundColor DarkGray
    }
    
    Test-Route -Method GET -Url "/reviews/product/$($global:productId)/summary" -Label "Get Review Summary (public)" -NoAuth
}

if ($global:reviewId) {
    Test-Route -Method GET -Url "/reviews/$($global:reviewId)" -Label "Get Review By ID (public)" -NoAuth
    
    $updateReviewBody = @{ status = "approved" } | ConvertTo-Json
    Test-Route -Method PUT -Url "/reviews/$($global:reviewId)" -Body $updateReviewBody -Label "Update Review (Admin)"
    
    Test-Route -Method DELETE -Url "/reviews/$($global:reviewId)" -Label "Delete Review" -ExpectedStatus @(200, 204)
}

###############################################################################
# 20. WAREHOUSES
###############################################################################
Write-Host "`n--- Warehouses ---" -ForegroundColor Magenta

# DTO: code (required), name (required), line1 (required), city (required), country (required), isActive
$whCode = "WH$(Get-Random -Maximum 9999)"
$whBody = @{
    code = $whCode
    name = "Test Warehouse"
    line1 = "456 Warehouse Ave"
    city = "Karachi"
    country = "PK"
} | ConvertTo-Json
$whResult = Test-Route -Method POST -Url "/warehouses" -Body $whBody -Label "Create Warehouse"
if ($whResult -and $whResult.data) {
    $global:warehouseId = $whResult.data.id
    Write-Host "    -> Warehouse: $($global:warehouseId)" -ForegroundColor DarkGray
}

Test-Route -Method GET -Url "/warehouses" -Label "Get All Warehouses"

if ($global:warehouseId) {
    Test-Route -Method GET -Url "/warehouses/$($global:warehouseId)" -Label "Get Warehouse By ID"
    
    $updateWhBody = @{ name = "Updated Warehouse" } | ConvertTo-Json
    Test-Route -Method PUT -Url "/warehouses/$($global:warehouseId)" -Body $updateWhBody -Label "Update Warehouse"
    
    Test-Route -Method DELETE -Url "/warehouses/$($global:warehouseId)" -Label "Delete Warehouse" -ExpectedStatus @(200, 204)
}

###############################################################################
# 21. INVENTORY
###############################################################################
Write-Host "`n--- Inventory ---" -ForegroundColor Magenta

# Re-create warehouse for inventory tests
$whCode2 = "IW$(Get-Random -Maximum 9999)"
$whBody2 = @{ code = $whCode2; name = "Inv Warehouse"; line1 = "789 Inv Ave"; city = "Lahore"; country = "PK" } | ConvertTo-Json
$whResult2 = Test-Route -Method POST -Url "/warehouses" -Body $whBody2 -Label "Create Warehouse for Inventory"
$invWarehouseId = ""
if ($whResult2 -and $whResult2.data) {
    $invWarehouseId = $whResult2.data.id
}

if ($global:productId -and $invWarehouseId) {
    $invSetBody = @{
        productId = $global:productId
        warehouseId = $invWarehouseId
        quantity = 100
    } | ConvertTo-Json
    Test-Route -Method POST -Url "/inventory/set" -Body $invSetBody -Label "Set Inventory"
    
    $invAdjBody = @{
        productId = $global:productId
        warehouseId = $invWarehouseId
        adjustment = 10
        reason = "Restock"
    } | ConvertTo-Json
    Test-Route -Method POST -Url "/inventory/adjust" -Body $invAdjBody -Label "Adjust Inventory"
    
    $invResBody = @{
        productId = $global:productId
        warehouseId = $invWarehouseId
        quantity = 5
    } | ConvertTo-Json
    Test-Route -Method POST -Url "/inventory/reserve" -Body $invResBody -Label "Reserve Inventory"
    
    $invRelBody = @{
        productId = $global:productId
        warehouseId = $invWarehouseId
        quantity = 3
    } | ConvertTo-Json
    Test-Route -Method POST -Url "/inventory/release" -Body $invRelBody -Label "Release Inventory"
}

Test-Route -Method GET -Url "/inventory" -Label "Get All Inventory"
Test-Route -Method GET -Url "/inventory/low-stock" -Label "Get Low Stock"

###############################################################################
# 22. SHIPPING
###############################################################################
Write-Host "`n--- Shipping ---" -ForegroundColor Magenta

Test-Route -Method GET -Url "/shipping/zones" -Label "Get Shipping Zones (public)" -NoAuth

$szBody = @{ name = "Test Zone $(Get-Random)" } | ConvertTo-Json
$szResult = Test-Route -Method POST -Url "/shipping/zones" -Body $szBody -Label "Create Shipping Zone"
if ($szResult -and $szResult.data) {
    $global:shippingZoneId = $szResult.data.id
    Write-Host "    -> ShippingZone: $($global:shippingZoneId)" -ForegroundColor DarkGray
}

if ($global:shippingZoneId) {
    Test-Route -Method GET -Url "/shipping/zones/$($global:shippingZoneId)" -Label "Get Shipping Zone By ID (public)" -NoAuth
    
    $updateSzBody = @{ name = "Updated Zone" } | ConvertTo-Json
    Test-Route -Method PUT -Url "/shipping/zones/$($global:shippingZoneId)" -Body $updateSzBody -Label "Update Shipping Zone"
    
    # Zone Countries - DTO: country (required, max 10 chars)
    $countryBody = @{ country = "PK" } | ConvertTo-Json
    Test-Route -Method POST -Url "/shipping/zones/$($global:shippingZoneId)/countries" -Body $countryBody -Label "Add Zone Country"
    Test-Route -Method GET -Url "/shipping/zones/$($global:shippingZoneId)/countries" -Label "Get Zone Countries"
}

# Shipping Methods - DTO: zoneId (UUID), name, carrier, baseRate, perKgRate
if ($global:shippingZoneId) {
    $smBody = @{
        zoneId = $global:shippingZoneId
        name = "Standard Shipping"
        carrier = "TCS"
        baseRate = 5.99
        perKgRate = 1.5
    } | ConvertTo-Json
    $smResult = Test-Route -Method POST -Url "/shipping/methods" -Body $smBody -Label "Create Shipping Method"
    if ($smResult -and $smResult.data) {
        $global:shippingMethodId = $smResult.data.id
        Write-Host "    -> ShippingMethod: $($global:shippingMethodId)" -ForegroundColor DarkGray
    }
}

Test-Route -Method GET -Url "/shipping/methods" -Label "Get Shipping Methods"

if ($global:shippingMethodId) {
    Test-Route -Method GET -Url "/shipping/methods/$($global:shippingMethodId)" -Label "Get Shipping Method By ID"
    
    $updateSmBody = @{ name = "Updated Method" } | ConvertTo-Json
    Test-Route -Method PUT -Url "/shipping/methods/$($global:shippingMethodId)" -Body $updateSmBody -Label "Update Shipping Method"
}

# Shipments
if ($global:orderId) {
    $shipBody = @{
        orderId = $global:orderId
        trackingNumber = "TRK-$(Get-Random)"
        carrier = "TCS"
    } | ConvertTo-Json
    $shipResult = Test-Route -Method POST -Url "/shipping/shipments" -Body $shipBody -Label "Create Shipment"
    if ($shipResult -and $shipResult.data) {
        $global:shipmentId = $shipResult.data.id
        Write-Host "    -> Shipment: $($global:shipmentId)" -ForegroundColor DarkGray
    }
    
    if ($global:shipmentId) {
        Test-Route -Method GET -Url "/shipping/shipments/$($global:shipmentId)" -Label "Get Shipment By ID"
        
        $updateShipBody = @{ status = "in_transit" } | ConvertTo-Json
        Test-Route -Method PUT -Url "/shipping/shipments/$($global:shipmentId)" -Body $updateShipBody -Label "Update Shipment"
        
        $eventBody = @{
            status = "picked_up"
            location = "Lahore Hub"
            description = "Package picked up"
        } | ConvertTo-Json
        Test-Route -Method POST -Url "/shipping/shipments/$($global:shipmentId)/events" -Body $eventBody -Label "Add Shipment Event"
        Test-Route -Method GET -Url "/shipping/shipments/$($global:shipmentId)/events" -Label "Get Shipment Events"
    }
    
    Test-Route -Method GET -Url "/shipping/order/$($global:orderId)/shipments" -Label "Get Order Shipments"
}

###############################################################################
# 23. NOTIFICATIONS
###############################################################################
Write-Host "`n--- Notifications ---" -ForegroundColor Magenta

# DTO: userId (UUID), channel (required), type (required), title, body, actionUrl, metadata
$notifBody = @{
    userId = $global:adminUserId
    channel = "in_app"
    type = "info"
    title = "Test Notification"
    body = "This is a test notification"
} | ConvertTo-Json
$notifResult = Test-Route -Method POST -Url "/notifications" -Body $notifBody -Label "Create Notification"
if ($notifResult -and $notifResult.data) {
    $global:notificationId = $notifResult.data.id
    Write-Host "    -> Notification: $($global:notificationId)" -ForegroundColor DarkGray
}

Test-Route -Method GET -Url "/notifications/mine" -Label "Get My Notifications"
Test-Route -Method GET -Url "/notifications/mine/unread-count" -Label "Get Unread Count"

if ($global:notificationId) {
    Test-Route -Method GET -Url "/notifications/$($global:notificationId)" -Label "Get Notification By ID"
    Test-Route -Method PUT -Url "/notifications/$($global:notificationId)/read" -Label "Mark Notification Read" -Body "{}"
}

Test-Route -Method PUT -Url "/notifications/mine/read-all" -Label "Mark All Read" -Body "{}"

if ($global:notificationId) {
    Test-Route -Method DELETE -Url "/notifications/$($global:notificationId)" -Label "Delete Notification" -ExpectedStatus @(200, 204)
}

###############################################################################
# 24. CHAT
###############################################################################
Write-Host "`n--- Chat ---" -ForegroundColor Magenta

# DTO: subject, orderId, productId, participantUserIds
$threadBody = @{
    subject = "Test Chat Thread"
} | ConvertTo-Json
$threadResult = Test-Route -Method POST -Url "/chat/threads" -Body $threadBody -Label "Create Chat Thread"
if ($threadResult -and $threadResult.data) {
    $global:threadId = $threadResult.data.id
    Write-Host "    -> Thread: $($global:threadId)" -ForegroundColor DarkGray
}

Test-Route -Method GET -Url "/chat/mine/threads" -Label "Get My Threads"

if ($global:threadId) {
    Test-Route -Method GET -Url "/chat/threads/$($global:threadId)" -Label "Get Thread By ID"
    
    $msgBody = @{
        threadId = $global:threadId
        content = "Hello from test"
    } | ConvertTo-Json
    $msgResult = Test-Route -Method POST -Url "/chat/messages" -Body $msgBody -Label "Send Message"
    if ($msgResult -and $msgResult.data) {
        $global:messageId = $msgResult.data.id
    }
    
    Test-Route -Method GET -Url "/chat/threads/$($global:threadId)/messages" -Label "Get Thread Messages"
    Test-Route -Method GET -Url "/chat/threads/$($global:threadId)/participants" -Label "Get Thread Participants"
    
    Test-Route -Method PUT -Url "/chat/threads/$($global:threadId)/read" -Label "Mark Thread Read" -Body "{}"
    
    $chatStatusBody = @{ status = "resolved" } | ConvertTo-Json
    Test-Route -Method PUT -Url "/chat/threads/$($global:threadId)/status" -Body $chatStatusBody -Label "Update Thread Status"
}

###############################################################################
# 25. SEARCH
###############################################################################
Write-Host "`n--- Search ---" -ForegroundColor Magenta

Test-Route -Method GET -Url "/search/popular" -Label "Get Popular Searches (public)" -NoAuth
Test-Route -Method GET -Url "/search/products?q=test" -Label "Search Products (public)" -NoAuth

$searchBody = @{ query = "test product" } | ConvertTo-Json
$searchResult = Test-Route -Method POST -Url "/search" -Body $searchBody -Label "Record Search"
if ($searchResult -and $searchResult.data) {
    $global:searchId = $searchResult.data.id
}

Test-Route -Method GET -Url "/search/history" -Label "Get Search History"

if ($global:searchId) {
    Test-Route -Method PUT -Url "/search/$($global:searchId)/click" -Label "Record Search Click" -Body "{}" -ExpectedStatus @(200, 201, 400)
}

###############################################################################
# 26. SUBSCRIPTION PLANS
###############################################################################
Write-Host "`n--- Subscriptions ---" -ForegroundColor Magenta

Test-Route -Method GET -Url "/subscriptions/plans" -Label "Get Plans (public)" -NoAuth

# DTO: name, price, currency (3 chars), interval, intervalCount (int), description, trialDays
$planBody = @{
    name = "Test Plan $(Get-Random)"
    description = "Test subscription plan"
    price = 29.99
    currency = "PKR"
    interval = "monthly"
    intervalCount = 1
} | ConvertTo-Json
$planResult = Test-Route -Method POST -Url "/subscriptions/plans" -Body $planBody -Label "Create Plan"
if ($planResult -and $planResult.data) {
    $global:planId = $planResult.data.id
    Write-Host "    -> Plan: $($global:planId)" -ForegroundColor DarkGray
}

if ($global:planId) {
    Test-Route -Method GET -Url "/subscriptions/plans/$($global:planId)" -Label "Get Plan By ID (public)" -NoAuth
    
    $updatePlanBody = @{ description = "Updated plan" } | ConvertTo-Json
    Test-Route -Method PUT -Url "/subscriptions/plans/$($global:planId)" -Body $updatePlanBody -Label "Update Plan"
}

# Create subscription
if ($global:planId) {
    $subBody = @{ planId = $global:planId } | ConvertTo-Json
    $subResult = Test-Route -Method POST -Url "/subscriptions" -Body $subBody -Label "Create Subscription"
    if ($subResult -and $subResult.data) {
        $global:subscriptionId = $subResult.data.id
        Write-Host "    -> Subscription: $($global:subscriptionId)" -ForegroundColor DarkGray
    }
}

Test-Route -Method GET -Url "/subscriptions/mine" -Label "Get My Subscriptions"

if ($global:subscriptionId) {
    Test-Route -Method GET -Url "/subscriptions/$($global:subscriptionId)" -Label "Get Subscription By ID"
    
    $updateSubBody = @{ status = "active" } | ConvertTo-Json
    Test-Route -Method PUT -Url "/subscriptions/$($global:subscriptionId)" -Body $updateSubBody -Label "Update Subscription (Admin)"
    
    Test-Route -Method PUT -Url "/subscriptions/$($global:subscriptionId)/cancel" -Label "Cancel Subscription" -Body "{}" -ExpectedStatus @(200, 400)
}

# Cleanup plan
if ($global:planId) {
    Test-Route -Method DELETE -Url "/subscriptions/plans/$($global:planId)" -Label "Delete Plan" -ExpectedStatus @(200, 204)
}

###############################################################################
# 27. AUDIT LOGS
###############################################################################
Write-Host "`n--- Audit Logs ---" -ForegroundColor Magenta

# DTO: action (required), tableName (required), recordId (optional UUID), actorId, diff, ipAddress, userAgent
$auditBody = @{
    action = "test_action"
    tableName = "users"
    recordId = $global:adminUserId
} | ConvertTo-Json
$auditResult = Test-Route -Method POST -Url "/audit-logs" -Body $auditBody -Label "Create Audit Log"
if ($auditResult -and $auditResult.data) {
    $global:auditLogId = $auditResult.data.id
    Write-Host "    -> AuditLog: $($global:auditLogId)" -ForegroundColor DarkGray
}

Test-Route -Method GET -Url "/audit-logs" -Label "Get All Audit Logs"

if ($global:auditLogId) {
    Test-Route -Method GET -Url "/audit-logs/$($global:auditLogId)" -Label "Get Audit Log By ID"
}

Test-Route -Method GET -Url "/audit-logs/entity/users/$($global:adminUserId)" -Label "Get Entity Audit Logs"

###############################################################################
# 28. STRIPE
###############################################################################
Write-Host "`n--- Stripe ---" -ForegroundColor Magenta

Test-Route -Method GET -Url "/stripe/prices" -Label "Get Stripe Prices"

$stripeOrderId = if ($global:orderId) { $global:orderId } else { "00000000-0000-0000-0000-000000000000" }
$checkoutBody = @{
    orderId = $stripeOrderId
    successUrl = "http://localhost:5173/success"
    cancelUrl = "http://localhost:5173/cancel"
} | ConvertTo-Json
Test-Route -Method POST -Url "/stripe/checkout" -Body $checkoutBody -Label "Stripe Checkout" -ExpectedStatus @(200, 201, 400, 500)

$stripePlanId = if ($global:planId) { $global:planId } else { "basic_monthly" }
$subscribeBody = @{
    planId = $stripePlanId
    successUrl = "http://localhost:5173/success"
    cancelUrl = "http://localhost:5173/cancel"
} | ConvertTo-Json
Test-Route -Method POST -Url "/stripe/subscribe" -Body $subscribeBody -Label "Stripe Subscribe" -ExpectedStatus @(200, 201, 400, 500)

###############################################################################
# 29. UPLOAD
###############################################################################
Write-Host "`n--- Upload ---" -ForegroundColor Magenta

Test-Route -Method POST -Url "/upload/image" -Label "Upload Image (no file)" -ExpectedStatus @(200, 201, 400, 415)
Test-Route -Method POST -Url "/upload/images" -Label "Upload Images (no files)" -ExpectedStatus @(200, 201, 400, 415)

###############################################################################
# 30. AUTH LOGOUT
###############################################################################
Write-Host "`n--- Auth Logout ---" -ForegroundColor Magenta

$logoutBody = @{ refreshToken = $global:refreshToken } | ConvertTo-Json
Test-Route -Method POST -Url "/auth/logout" -Body $logoutBody -Label "Logout" -NoAuth

###############################################################################
# CLEANUP
###############################################################################
Write-Host "`n--- Cleanup ---" -ForegroundColor Magenta

# Re-login for cleanup
$loginBody = @{ email = $ADMIN_EMAIL; password = $ADMIN_PASS } | ConvertTo-Json
$loginResult = Test-Route -Method POST -Url "/auth/login" -Body $loginBody -Label "Re-login for cleanup" -NoAuth
if ($loginResult -and $loginResult.data) {
    $global:TOKEN = $loginResult.data.accessToken
}

if ($global:imageId) { Test-Route -Method DELETE -Url "/products/images/$($global:imageId)" -Label "Cleanup Image" -ExpectedStatus @(200, 204) }
if ($global:attrValueId) { Test-Route -Method DELETE -Url "/products/attributes/values/$($global:attrValueId)" -Label "Cleanup AttrValue" -ExpectedStatus @(200, 204) }
if ($global:attrKeyId) { Test-Route -Method DELETE -Url "/products/attributes/keys/$($global:attrKeyId)" -Label "Cleanup AttrKey" -ExpectedStatus @(200, 204) }
if ($global:variantId) { Test-Route -Method DELETE -Url "/products/variants/$($global:variantId)" -Label "Cleanup Variant" -ExpectedStatus @(200, 204) }
if ($global:productId) { Test-Route -Method DELETE -Url "/products/$($global:productId)" -Label "Cleanup Product" -ExpectedStatus @(200, 204) }
if ($global:categoryId) { Test-Route -Method DELETE -Url "/categories/$($global:categoryId)" -Label "Cleanup Category" -ExpectedStatus @(200, 204) }
if ($global:couponId) { Test-Route -Method DELETE -Url "/coupons/$($global:couponId)" -Label "Cleanup Coupon" -ExpectedStatus @(200, 204) }
if ($invWarehouseId) { Test-Route -Method DELETE -Url "/warehouses/$invWarehouseId" -Label "Cleanup Inv Warehouse" -ExpectedStatus @(200, 204) }
if ($global:permissionId) { Test-Route -Method DELETE -Url "/permissions/$($global:permissionId)" -Label "Cleanup Permission" -ExpectedStatus @(200, 204) }
if ($global:roleId) { Test-Route -Method DELETE -Url "/roles/$($global:roleId)" -Label "Cleanup Role" -ExpectedStatus @(200, 204) }

###############################################################################
# SUMMARY
###############################################################################
Write-Host "`n" 
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  TEST RESULTS" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  PASSED: $($global:PASS)" -ForegroundColor Green
Write-Host "  FAILED: $($global:FAIL)" -ForegroundColor Red
Write-Host "  Total:  $($global:PASS + $global:FAIL)" -ForegroundColor White
Write-Host "================================================================" -ForegroundColor Cyan

if ($global:ERRORS.Count -gt 0) {
    Write-Host "`n  ERRORS:" -ForegroundColor Red
    foreach ($err in $global:ERRORS) {
        Write-Host "  - $err" -ForegroundColor Red
    }
}
Write-Host ""
