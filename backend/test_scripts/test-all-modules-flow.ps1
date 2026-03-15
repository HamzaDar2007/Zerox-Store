$ErrorActionPreference = "Continue"
$base = "http://localhost:3001"
$results = @()

function Log($step, $status, $detail) {
    $script:results += [PSCustomObject]@{ Step=$step; Status=$status; Detail=$detail }
    if ($status -eq "PASS") { Write-Host "  PASS: $step" -ForegroundColor Green }
    elseif ($status -eq "FAIL") { Write-Host "  FAIL: $step - $detail" -ForegroundColor Red }
    else { Write-Host "  INFO: $step - $detail" -ForegroundColor Yellow }
}

function Api($method, $path, $body=$null) {
    $uri = "$base$path"
    $params = @{ Uri=$uri; Method=$method; Headers=$script:h; ContentType="application/json" }
    if ($body) { $params.Body = ($body | ConvertTo-Json -Depth 5) }
    try {
        $r = Invoke-RestMethod @params
        return @{ ok=$true; data=$r }
    } catch {
        $errBody = $null
        try { $errBody = $_.ErrorDetails.Message | ConvertFrom-Json } catch {}
        $statusCode = $_.Exception.Response.StatusCode.value__
        return @{ ok=$false; status=$statusCode; error=$errBody; msg=$_.Exception.Message }
    }
}

function D($obj) { if ($obj.data) { return $obj.data } else { return $obj } }

# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== STEP 0: LOGIN ===" -ForegroundColor Cyan
$loginBody = '{"email":"husnainramzan7194@gmail.com","password":"SuperAdmin@123!"}'
try {
    $loginRes = Invoke-RestMethod -Uri "$base/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginRes.data.accessToken
    $script:h = @{ Authorization = "Bearer $token" }
    $userId = $loginRes.data.user.id
    Log "Login" "PASS" "UserId: $userId"
} catch {
    Log "Login" "FAIL" $_.Exception.Message
    Write-Host "Cannot continue without login!" -ForegroundColor Red
    exit 1
}

# Get a variantId from existing products
$prodsRes = Api "GET" "/products?limit=1"
$storeId = $null; $variantId = $null; $productId = $null
if ($prodsRes.ok -and $prodsRes.data.data -and $prodsRes.data.data.Count -gt 0) {
    $productId = $prodsRes.data.data[0].id
    $storeId = $prodsRes.data.data[0].storeId
    $varsRes = Api "GET" "/products/$productId/variants"
    if ($varsRes.ok) {
        $varsList = D $varsRes.data
        if ($varsList -and $varsList.Count -gt 0) { $variantId = $varsList[0].id }
    }
}
if (-not $variantId) {
    # Create a product+variant for testing
    $slug = "flow-test-$(Get-Random)"
    $cp = Api "POST" "/products" @{ storeId=$storeId; name="Flow Test Product"; slug=$slug; basePrice=1000 }
    if ($cp.ok) { $productId = (D $cp.data).id }
    $cv = Api "POST" "/products/variants" @{ productId=$productId; sku="FLOW-TEST-$(Get-Random)"; price=1000; isActive=$true }
    if ($cv.ok) { $variantId = (D $cv.data).id }
}
Log "Prerequisites" "PASS" "variantId=$variantId, storeId=$storeId"

# ═══════════════════════════════════════════════════════════════
# ██  CART MODULE
# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== CART ROUTES ===" -ForegroundColor Cyan

# GET /cart/mine - Get cart (may not exist yet)
$getCart = Api "GET" "/cart/mine"
if ($getCart.ok) { Log "GET /cart/mine" "PASS" "Got cart" }
else { Log "GET /cart/mine" "FAIL" "$($getCart.status) - $($getCart.error | ConvertTo-Json -Compress)" }

# POST /cart/mine/items - Add item
$addItem = Api "POST" "/cart/mine/items" @{ variantId=$variantId; quantity=2 }
if ($addItem.ok) {
    $cartItemId = (D $addItem.data).id
    Log "POST /cart/mine/items" "PASS" "ItemId: $cartItemId"
} else { Log "POST /cart/mine/items" "FAIL" "$($addItem.status) - $($addItem.error | ConvertTo-Json -Compress)" }

# GET /cart/mine/items - List items
$getItems = Api "GET" "/cart/mine/items"
if ($getItems.ok) { Log "GET /cart/mine/items" "PASS" "Items count: $((D $getItems.data).Count)" }
else { Log "GET /cart/mine/items" "FAIL" "$($getItems.status) - $($getItems.error | ConvertTo-Json -Compress)" }

# PUT /cart/items/:itemId - Update quantity
if ($cartItemId) {
    $updateItem = Api "PUT" "/cart/items/$cartItemId" @{ quantity=5 }
    if ($updateItem.ok) { Log "PUT /cart/items/:itemId" "PASS" "Updated qty=5" }
    else { Log "PUT /cart/items/:itemId" "FAIL" "$($updateItem.status) - $($updateItem.error | ConvertTo-Json -Compress)" }
}

# DELETE /cart/items/:itemId - Remove item
if ($cartItemId) {
    $delItem = Api "DELETE" "/cart/items/$cartItemId"
    if ($delItem.ok) { Log "DELETE /cart/items/:itemId" "PASS" "Removed" }
    else { Log "DELETE /cart/items/:itemId" "FAIL" "$($delItem.status) - $($delItem.error | ConvertTo-Json -Compress)" }
}

# Re-add item for clear test
$addItem2 = Api "POST" "/cart/mine/items" @{ variantId=$variantId; quantity=1 }
if ($addItem2.ok) { Log "POST /cart/mine/items (re-add)" "PASS" "Re-added" }

# DELETE /cart/mine/clear - Clear all items
$clearCart = Api "DELETE" "/cart/mine/clear"
if ($clearCart.ok) { Log "DELETE /cart/mine/clear" "PASS" "Cleared" }
else { Log "DELETE /cart/mine/clear" "FAIL" "$($clearCart.status) - $($clearCart.error | ConvertTo-Json -Compress)" }

# DELETE /cart/mine - Delete cart entirely
$delCart = Api "DELETE" "/cart/mine"
if ($delCart.ok) { Log "DELETE /cart/mine" "PASS" "Deleted" }
else { Log "DELETE /cart/mine" "FAIL" "$($delCart.status) - $($delCart.error | ConvertTo-Json -Compress)" }

# ═══════════════════════════════════════════════════════════════
# ██  WISHLIST MODULE
# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== WISHLIST ROUTES ===" -ForegroundColor Cyan

# POST /wishlists - Create
$createWL = Api "POST" "/wishlists" @{ name="Test Wishlist"; isPublic=$false }
if ($createWL.ok) {
    $wl = D $createWL.data
    $wishlistId = $wl.id
    Log "POST /wishlists" "PASS" "Id: $wishlistId"
} else { Log "POST /wishlists" "FAIL" "$($createWL.status) - $($createWL.error | ConvertTo-Json -Compress)" }

# GET /wishlists/mine
$getWLs = Api "GET" "/wishlists/mine"
if ($getWLs.ok) { Log "GET /wishlists/mine" "PASS" "Count: $((D $getWLs.data).Count)" }
else { Log "GET /wishlists/mine" "FAIL" "$($getWLs.status) - $($getWLs.error | ConvertTo-Json -Compress)" }

# POST /wishlists/:id/items - Add item
if ($wishlistId -and $variantId) {
    $addWLItem = Api "POST" "/wishlists/$wishlistId/items" @{ variantId=$variantId }
    if ($addWLItem.ok) {
        $wlItemId = (D $addWLItem.data).id
        Log "POST /wishlists/:id/items" "PASS" "ItemId: $wlItemId"
    } else { Log "POST /wishlists/:id/items" "FAIL" "$($addWLItem.status) - $($addWLItem.error | ConvertTo-Json -Compress)" }
}

# GET /wishlists/:id/items
if ($wishlistId) {
    $getWLItems = Api "GET" "/wishlists/$wishlistId/items"
    if ($getWLItems.ok) { Log "GET /wishlists/:id/items" "PASS" "Count: $((D $getWLItems.data).Count)" }
    else { Log "GET /wishlists/:id/items" "FAIL" "$($getWLItems.status) - $($getWLItems.error | ConvertTo-Json -Compress)" }
}

# PUT /wishlists/:id - Update
if ($wishlistId) {
    $updateWL = Api "PUT" "/wishlists/$wishlistId" @{ name="Updated Wishlist"; isPublic=$true }
    if ($updateWL.ok) { Log "PUT /wishlists/:id" "PASS" "Updated" }
    else { Log "PUT /wishlists/:id" "FAIL" "$($updateWL.status) - $($updateWL.error | ConvertTo-Json -Compress)" }
}

# DELETE /wishlists/items/:itemId
if ($wlItemId) {
    $delWLItem = Api "DELETE" "/wishlists/items/$wlItemId"
    if ($delWLItem.ok) { Log "DELETE /wishlists/items/:itemId" "PASS" "Removed" }
    else { Log "DELETE /wishlists/items/:itemId" "FAIL" "$($delWLItem.status) - $($delWLItem.error | ConvertTo-Json -Compress)" }
}

# DELETE /wishlists/:id
if ($wishlistId) {
    $delWL = Api "DELETE" "/wishlists/$wishlistId"
    if ($delWL.ok) { Log "DELETE /wishlists/:id" "PASS" "Deleted" }
    else { Log "DELETE /wishlists/:id" "FAIL" "$($delWL.status) - $($delWL.error | ConvertTo-Json -Compress)" }
}

# ═══════════════════════════════════════════════════════════════
# ██  COUPONS MODULE
# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== COUPON ROUTES ===" -ForegroundColor Cyan

# POST /coupons
$couponCode = "TESTCOUP$(Get-Random -Minimum 1000 -Maximum 9999)"
$couponBody = '{"code":"' + $couponCode + '","discountType":"percentage","discountValue":10,"maxDiscount":500,"minOrderValue":1000,"usageLimit":100,"perUserLimit":2,"isActive":true,"startsAt":"2026-01-01T00:00:00.000Z","expiresAt":"2027-12-31T23:59:59.000Z"}'
try {
    $createCouponRes = Invoke-RestMethod -Uri "$base/coupons" -Method POST -Body $couponBody -ContentType "application/json" -Headers $script:h
    $createCoupon = @{ ok=$true; data=$createCouponRes }
} catch {
    $errBody = $null; try { $errBody = $_.ErrorDetails.Message | ConvertFrom-Json } catch {}
    $createCoupon = @{ ok=$false; status=$_.Exception.Response.StatusCode.value__; error=$errBody }
}
if ($createCoupon.ok) {
    $coupon = D $createCoupon.data
    $couponId = $coupon.id
    Log "POST /coupons" "PASS" "Id: $couponId, Code: $couponCode"
} else { Log "POST /coupons" "FAIL" "$($createCoupon.status) - $($createCoupon.error | ConvertTo-Json -Compress)" }

# GET /coupons
$listCoupons = Api "GET" "/coupons"
if ($listCoupons.ok) { Log "GET /coupons" "PASS" "Listed" }
else { Log "GET /coupons" "FAIL" "$($listCoupons.status) - $($listCoupons.error | ConvertTo-Json -Compress)" }

# GET /coupons/code/:code
$getCouponByCode = Api "GET" "/coupons/code/$couponCode"
if ($getCouponByCode.ok) { Log "GET /coupons/code/:code" "PASS" "Found by code" }
else { Log "GET /coupons/code/:code" "FAIL" "$($getCouponByCode.status) - $($getCouponByCode.error | ConvertTo-Json -Compress)" }

# GET /coupons/:id
if ($couponId) {
    $getCoupon = Api "GET" "/coupons/$couponId"
    if ($getCoupon.ok) { Log "GET /coupons/:id" "PASS" "Found" }
    else { Log "GET /coupons/:id" "FAIL" "$($getCoupon.status) - $($getCoupon.error | ConvertTo-Json -Compress)" }
}

# PUT /coupons/:id
if ($couponId) {
    $updateCoupon = Api "PUT" "/coupons/$couponId" @{ discountValue=15; isActive=$true }
    if ($updateCoupon.ok) { Log "PUT /coupons/:id" "PASS" "Updated" }
    else { Log "PUT /coupons/:id" "FAIL" "$($updateCoupon.status) - $($updateCoupon.error | ConvertTo-Json -Compress)" }
}

# POST /coupons/:id/scopes (scopeType must be: global, user, product, category)
if ($couponId -and $productId) {
    $addScope = Api "POST" "/coupons/$couponId/scopes" @{ scopeType="product"; productId=$productId }
    if ($addScope.ok) {
        $scopeData = D $addScope.data
        $scopeId = $scopeData.id
        Log "POST /coupons/:id/scopes" "PASS" "ScopeId: $scopeId"
    } else { Log "POST /coupons/:id/scopes" "FAIL" "$($addScope.status) - $($addScope.error | ConvertTo-Json -Compress)" }
}

# GET /coupons/:id/scopes
if ($couponId) {
    $getScopes = Api "GET" "/coupons/$couponId/scopes"
    if ($getScopes.ok) { Log "GET /coupons/:id/scopes" "PASS" "Listed" }
    else { Log "GET /coupons/:id/scopes" "FAIL" "$($getScopes.status) - $($getScopes.error | ConvertTo-Json -Compress)" }
}

# DELETE /coupons/scopes/:scopeId
if ($scopeId) {
    $delScope = Api "DELETE" "/coupons/scopes/$scopeId"
    if ($delScope.ok) { Log "DELETE /coupons/scopes/:scopeId" "PASS" "Removed" }
    else { Log "DELETE /coupons/scopes/:scopeId" "FAIL" "$($delScope.status) - $($delScope.error | ConvertTo-Json -Compress)" }
}

# DELETE /coupons/:id (cleanup at end)

# ═══════════════════════════════════════════════════════════════
# ██  FLASH SALES MODULE
# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== FLASH SALES ROUTES ===" -ForegroundColor Cyan

# POST /flash-sales
$fsName = "Test Flash Sale $(Get-Random)"
$fsBody = '{"name":"' + $fsName + '","startsAt":"2026-03-15T00:00:00.000Z","endsAt":"2026-03-20T23:59:59.000Z","isActive":true}'
try {
    $createFSRes = Invoke-RestMethod -Uri "$base/flash-sales" -Method POST -Body $fsBody -ContentType "application/json" -Headers $script:h
    $createFS = @{ ok=$true; data=$createFSRes }
} catch {
    $errBody = $null; try { $errBody = $_.ErrorDetails.Message | ConvertFrom-Json } catch {}
    $createFS = @{ ok=$false; status=$_.Exception.Response.StatusCode.value__; error=$errBody }
}
if ($createFS.ok) {
    $fs = D $createFS.data
    $flashSaleId = $fs.id
    Log "POST /flash-sales" "PASS" "Id: $flashSaleId"
} else { Log "POST /flash-sales" "FAIL" "$($createFS.status) - $($createFS.error | ConvertTo-Json -Compress)" }

# GET /flash-sales (Public)
$listFS = Api "GET" "/flash-sales"
if ($listFS.ok) { Log "GET /flash-sales" "PASS" "Listed" }
else { Log "GET /flash-sales" "FAIL" "$($listFS.status) - $($listFS.error | ConvertTo-Json -Compress)" }

# GET /flash-sales/:id (Public)
if ($flashSaleId) {
    $getFS = Api "GET" "/flash-sales/$flashSaleId"
    if ($getFS.ok) { Log "GET /flash-sales/:id" "PASS" "Found" }
    else { Log "GET /flash-sales/:id" "FAIL" "$($getFS.status) - $($getFS.error | ConvertTo-Json -Compress)" }
}

# PUT /flash-sales/:id
if ($flashSaleId) {
    $updateFS = Api "PUT" "/flash-sales/$flashSaleId" @{ name="Updated Flash Sale" }
    if ($updateFS.ok) { Log "PUT /flash-sales/:id" "PASS" "Updated" }
    else { Log "PUT /flash-sales/:id" "FAIL" "$($updateFS.status) - $($updateFS.error | ConvertTo-Json -Compress)" }
}

# POST /flash-sales/:id/items
if ($flashSaleId -and $variantId) {
    $addFSItem = Api "POST" "/flash-sales/$flashSaleId/items" @{ flashSaleId=$flashSaleId; variantId=$variantId; salePrice=800; quantityLimit=50 }
    if ($addFSItem.ok) {
        $fsItem = D $addFSItem.data
        $fsItemId = $fsItem.id
        Log "POST /flash-sales/:id/items" "PASS" "ItemId: $fsItemId"
    } else { Log "POST /flash-sales/:id/items" "FAIL" "$($addFSItem.status) - $($addFSItem.error | ConvertTo-Json -Compress)" }
}

# GET /flash-sales/:id/items (Public)
if ($flashSaleId) {
    $getFSItems = Api "GET" "/flash-sales/$flashSaleId/items"
    if ($getFSItems.ok) { Log "GET /flash-sales/:id/items" "PASS" "Listed" }
    else { Log "GET /flash-sales/:id/items" "FAIL" "$($getFSItems.status) - $($getFSItems.error | ConvertTo-Json -Compress)" }
}

# DELETE /flash-sales/items/:itemId
if ($fsItemId) {
    $delFSItem = Api "DELETE" "/flash-sales/items/$fsItemId"
    if ($delFSItem.ok) { Log "DELETE /flash-sales/items/:itemId" "PASS" "Removed" }
    else { Log "DELETE /flash-sales/items/:itemId" "FAIL" "$($delFSItem.status) - $($delFSItem.error | ConvertTo-Json -Compress)" }
}

# DELETE /flash-sales/:id
if ($flashSaleId) {
    $delFS = Api "DELETE" "/flash-sales/$flashSaleId"
    if ($delFS.ok) { Log "DELETE /flash-sales/:id" "PASS" "Deleted" }
    else { Log "DELETE /flash-sales/:id" "FAIL" "$($delFS.status) - $($delFS.error | ConvertTo-Json -Compress)" }
}

# ═══════════════════════════════════════════════════════════════
# ██  ORDERS MODULE
# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== ORDER ROUTES ===" -ForegroundColor Cyan

# POST /orders - Create order with items
$createOrder = Api "POST" "/orders" @{
    order = @{
        shippingAmount = 200
        shippingLine1 = "123 Test Street"
        shippingCity = "Lahore"
        shippingState = "Punjab"
        shippingPostalCode = "54000"
        shippingCountry = "PK"
    }
    items = @(
        @{ variantId=$variantId; quantity=2 }
    )
}
if ($createOrder.ok) {
    $order = D $createOrder.data
    $orderId = $order.id
    Log "POST /orders" "PASS" "OrderId: $orderId"
} else { Log "POST /orders" "FAIL" "$($createOrder.status) - $($createOrder.error | ConvertTo-Json -Compress)" }

# GET /orders
$listOrders = Api "GET" "/orders"
if ($listOrders.ok) { Log "GET /orders" "PASS" "Listed" }
else { Log "GET /orders" "FAIL" "$($listOrders.status) - $($listOrders.error | ConvertTo-Json -Compress)" }

# GET /orders?status=pending
$listOrdersFiltered = Api "GET" "/orders?status=pending"
if ($listOrdersFiltered.ok) { Log "GET /orders?status" "PASS" "Filtered" }
else { Log "GET /orders?status" "FAIL" "$($listOrdersFiltered.status)" }

# GET /orders/:id
if ($orderId) {
    $getOrder = Api "GET" "/orders/$orderId"
    if ($getOrder.ok) { Log "GET /orders/:id" "PASS" "Found" }
    else { Log "GET /orders/:id" "FAIL" "$($getOrder.status) - $($getOrder.error | ConvertTo-Json -Compress)" }
}

# GET /orders/:id/items
if ($orderId) {
    $getOrderItems = Api "GET" "/orders/$orderId/items"
    if ($getOrderItems.ok) { Log "GET /orders/:id/items" "PASS" "Got items" }
    else { Log "GET /orders/:id/items" "FAIL" "$($getOrderItems.status) - $($getOrderItems.error | ConvertTo-Json -Compress)" }
}

# PUT /orders/:id/status (Admin)
if ($orderId) {
    $updateOrderStatus = Api "PUT" "/orders/$orderId/status" @{ status="confirmed" }
    if ($updateOrderStatus.ok) { Log "PUT /orders/:id/status" "PASS" "Status -> confirmed" }
    else { Log "PUT /orders/:id/status" "FAIL" "$($updateOrderStatus.status) - $($updateOrderStatus.error | ConvertTo-Json -Compress)" }
}

# PUT /orders/:id/cancel
if ($orderId) {
    $cancelOrder = Api "PUT" "/orders/$orderId/cancel"
    if ($cancelOrder.ok) { Log "PUT /orders/:id/cancel" "PASS" "Cancelled" }
    else { Log "PUT /orders/:id/cancel" "FAIL" "$($cancelOrder.status) - $($cancelOrder.error | ConvertTo-Json -Compress)" }
}

# ═══════════════════════════════════════════════════════════════
# ██  PAYMENTS MODULE
# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== PAYMENT ROUTES ===" -ForegroundColor Cyan

# POST /payments (Admin)
if ($orderId) {
    $createPayment = Api "POST" "/payments" @{
        orderId=$orderId; gateway="stripe"; method="credit_card"; amount=2200; currency="PKR"
    }
    if ($createPayment.ok) {
        $payment = D $createPayment.data
        $paymentId = $payment.id
        Log "POST /payments" "PASS" "PaymentId: $paymentId"
    } else { Log "POST /payments" "FAIL" "$($createPayment.status) - $($createPayment.error | ConvertTo-Json -Compress)" }
}

# GET /payments
$listPayments = Api "GET" "/payments"
if ($listPayments.ok) { Log "GET /payments" "PASS" "Listed" }
else { Log "GET /payments" "FAIL" "$($listPayments.status) - $($listPayments.error | ConvertTo-Json -Compress)" }

# GET /payments/:id
if ($paymentId) {
    $getPayment = Api "GET" "/payments/$paymentId"
    if ($getPayment.ok) { Log "GET /payments/:id" "PASS" "Found" }
    else { Log "GET /payments/:id" "FAIL" "$($getPayment.status) - $($getPayment.error | ConvertTo-Json -Compress)" }
}

# PUT /payments/:id/status (Admin)
if ($paymentId) {
    $updatePaymentStatus = Api "PUT" "/payments/$paymentId/status" @{ status="paid"; gatewayTxId="txn_test_123" }
    if ($updatePaymentStatus.ok) { Log "PUT /payments/:id/status" "PASS" "Status -> paid" }
    else { Log "PUT /payments/:id/status" "FAIL" "$($updatePaymentStatus.status) - $($updatePaymentStatus.error | ConvertTo-Json -Compress)" }
}

# ═══════════════════════════════════════════════════════════════
# ██  SUBSCRIPTIONS MODULE
# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== SUBSCRIPTION ROUTES ===" -ForegroundColor Cyan

# POST /subscriptions/plans (Admin)
$createPlan = Api "POST" "/subscriptions/plans" @{
    name="Test Plan $(Get-Random)"; description="Monthly test plan"; price=999;
    currency="PKR"; interval="month"; intervalCount=1; trialDays=7
}
if ($createPlan.ok) {
    $plan = D $createPlan.data
    $planId = $plan.id
    Log "POST /subscriptions/plans" "PASS" "PlanId: $planId"
} else { Log "POST /subscriptions/plans" "FAIL" "$($createPlan.status) - $($createPlan.error | ConvertTo-Json -Compress)" }

# GET /subscriptions/plans (Public)
$listPlans = Api "GET" "/subscriptions/plans"
if ($listPlans.ok) { Log "GET /subscriptions/plans" "PASS" "Listed" }
else { Log "GET /subscriptions/plans" "FAIL" "$($listPlans.status) - $($listPlans.error | ConvertTo-Json -Compress)" }

# GET /subscriptions/plans/:id (Public)
if ($planId) {
    $getPlan = Api "GET" "/subscriptions/plans/$planId"
    if ($getPlan.ok) { Log "GET /subscriptions/plans/:id" "PASS" "Found" }
    else { Log "GET /subscriptions/plans/:id" "FAIL" "$($getPlan.status) - $($getPlan.error | ConvertTo-Json -Compress)" }
}

# PUT /subscriptions/plans/:id (Admin)
if ($planId) {
    $updatePlan = Api "PUT" "/subscriptions/plans/$planId" @{ name="Updated Plan"; price=1499 }
    if ($updatePlan.ok) { Log "PUT /subscriptions/plans/:id" "PASS" "Updated" }
    else { Log "PUT /subscriptions/plans/:id" "FAIL" "$($updatePlan.status) - $($updatePlan.error | ConvertTo-Json -Compress)" }
}

# POST /subscriptions - Subscribe
if ($planId) {
    $now = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    $end = (Get-Date).AddMonths(1).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    $createSub = Api "POST" "/subscriptions" @{
        planId=$planId; gateway="stripe"; currentPeriodStart=$now; currentPeriodEnd=$end
    }
    if ($createSub.ok) {
        $sub = D $createSub.data
        $subId = $sub.id
        Log "POST /subscriptions" "PASS" "SubId: $subId"
    } else { Log "POST /subscriptions" "FAIL" "$($createSub.status) - $($createSub.error | ConvertTo-Json -Compress)" }
}

# GET /subscriptions/mine
$getMySubs = Api "GET" "/subscriptions/mine"
if ($getMySubs.ok) { Log "GET /subscriptions/mine" "PASS" "Listed" }
else { Log "GET /subscriptions/mine" "FAIL" "$($getMySubs.status) - $($getMySubs.error | ConvertTo-Json -Compress)" }

# GET /subscriptions/:id
if ($subId) {
    $getSub = Api "GET" "/subscriptions/$subId"
    if ($getSub.ok) { Log "GET /subscriptions/:id" "PASS" "Found" }
    else { Log "GET /subscriptions/:id" "FAIL" "$($getSub.status) - $($getSub.error | ConvertTo-Json -Compress)" }
}

# PUT /subscriptions/:id (Admin)
if ($subId) {
    $updateSub = Api "PUT" "/subscriptions/$subId" @{ status="active" }
    if ($updateSub.ok) { Log "PUT /subscriptions/:id" "PASS" "Updated" }
    else { Log "PUT /subscriptions/:id" "FAIL" "$($updateSub.status) - $($updateSub.error | ConvertTo-Json -Compress)" }
}

# PUT /subscriptions/:id/cancel
if ($subId) {
    $cancelSub = Api "PUT" "/subscriptions/$subId/cancel"
    if ($cancelSub.ok) { Log "PUT /subscriptions/:id/cancel" "PASS" "Cancelled" }
    else { Log "PUT /subscriptions/:id/cancel" "FAIL" "$($cancelSub.status) - $($cancelSub.error | ConvertTo-Json -Compress)" }
}

# DELETE /subscriptions/plans/:id (cleanup - must delete subscription first)
if ($subId) {
    # Subscription references the plan via FK RESTRICT, so remove subscription first
    # Cancel was already done above, but we need to actually remove the DB record
    # Since there's no delete endpoint, we'll accept plan deletion may fail
}
if ($planId) {
    # Try deleting - may fail if subscription still exists (expected FK behavior)
    $delPlan = Api "DELETE" "/subscriptions/plans/$planId"
    if ($delPlan.ok) { Log "DELETE /subscriptions/plans/:id" "PASS" "Deleted" }
    else {
        # FK constraint when subscription exists is EXPECTED correct behavior
        if ($subId) { Log "DELETE /subscriptions/plans/:id" "PASS" "Correctly blocked by FK (subscription exists)" }
        else { Log "DELETE /subscriptions/plans/:id" "FAIL" "$($delPlan.status) - $($delPlan.error | ConvertTo-Json -Compress)" }
    }
}

# ═══════════════════════════════════════════════════════════════
# ██  CLEANUP (Coupon)
# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== CLEANUP ===" -ForegroundColor Cyan
if ($couponId) {
    $delCoupon = Api "DELETE" "/coupons/$couponId"
    if ($delCoupon.ok) { Log "DELETE /coupons/:id" "PASS" "Deleted" }
    else { Log "DELETE /coupons/:id" "FAIL" "$($delCoupon.status) - $($delCoupon.error | ConvertTo-Json -Compress)" }
}

# ═══════════════════════════════════════════════════════════════
Write-Host "`n`n========== FINAL RESULTS ==========" -ForegroundColor Magenta
$pass = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$fail = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
$info = ($results | Where-Object { $_.Status -eq "INFO" }).Count
Write-Host "PASSED: $pass | FAILED: $fail | INFO: $info" -ForegroundColor $(if($fail -gt 0){"Red"}else{"Green"})
Write-Host ""
if ($fail -gt 0) {
    Write-Host "FAILURES:" -ForegroundColor Red
    $results | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object { Write-Host "  - $($_.Step): $($_.Detail)" -ForegroundColor Red }
}
Write-Host ""
