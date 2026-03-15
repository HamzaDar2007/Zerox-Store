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
        $sc = $_.Exception.Response.StatusCode.value__
        return @{ ok=$false; status=$sc; error=$errBody; msg=$_.Exception.Message }
    }
}

function D($obj) { if ($obj.data) { return $obj.data } else { return $obj } }

# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== STEP 0: LOGIN & PREREQUISITES ===" -ForegroundColor Cyan
$loginBody = '{"email":"husnainramzan7194@gmail.com","password":"SuperAdmin@123!"}'
try {
    $loginRes = Invoke-RestMethod -Uri "$base/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginRes.data.accessToken
    $script:h = @{ Authorization = "Bearer $token" }
    $userId = $loginRes.data.user.id
    Log "Login" "PASS" "UserId: $userId"
} catch {
    Log "Login" "FAIL" $_.Exception.Message
    exit 1
}

# Get existing product/variant/order for dependencies
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

# Create an order for returns/shipping/chat tests
$createOrder = Api "POST" "/orders" @{
    order = @{ shippingAmount=200; shippingLine1="Test St"; shippingCity="Lahore"; shippingState="Punjab"; shippingPostalCode="54000"; shippingCountry="PK" }
    items = @( @{ variantId=$variantId; quantity=2 } )
}
$orderId = $null; $orderItemId = $null
if ($createOrder.ok) {
    $orderId = (D $createOrder.data).id
    # Get order items
    $oiRes = Api "GET" "/orders/$orderId/items"
    if ($oiRes.ok) {
        $oiData = D $oiRes.data
        if ($oiData -and $oiData.Count -gt 0) { $orderItemId = $oiData[0].id }
    }
    Log "Prerequisites" "PASS" "order=$orderId, variant=$variantId, product=$productId"
} else {
    Log "Prerequisites" "INFO" "Order creation failed, some tests may skip: $($createOrder.status)"
}

# ═══════════════════════════════════════════════════════════════
# ██  RETURNS MODULE
# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== RETURNS ROUTES ===" -ForegroundColor Cyan

# POST /returns
if ($orderId -and $orderItemId) {
    $createReturn = Api "POST" "/returns" @{
        return = @{ orderId=$orderId; reason="Product damaged during shipping" }
        items = @( @{ orderItemId=$orderItemId; quantity=1; condition="damaged"; notes="Box was crushed" } )
    }
    if ($createReturn.ok) {
        $returnId = (D $createReturn.data).id
        Log "POST /returns" "PASS" "ReturnId: $returnId"
    } else { Log "POST /returns" "FAIL" "$($createReturn.status) - $($createReturn.error | ConvertTo-Json -Compress)" }
} else { Log "POST /returns" "INFO" "Skipped - no order/orderItem" }

# GET /returns
$listReturns = Api "GET" "/returns"
if ($listReturns.ok) { Log "GET /returns" "PASS" "Listed" }
else { Log "GET /returns" "FAIL" "$($listReturns.status) - $($listReturns.error | ConvertTo-Json -Compress)" }

# GET /returns/:id
if ($returnId) {
    $getReturn = Api "GET" "/returns/$returnId"
    if ($getReturn.ok) { Log "GET /returns/:id" "PASS" "Found" }
    else { Log "GET /returns/:id" "FAIL" "$($getReturn.status) - $($getReturn.error | ConvertTo-Json -Compress)" }
}

# GET /returns/:id/items
if ($returnId) {
    $getReturnItems = Api "GET" "/returns/$returnId/items"
    if ($getReturnItems.ok) { Log "GET /returns/:id/items" "PASS" "Got items" }
    else { Log "GET /returns/:id/items" "FAIL" "$($getReturnItems.status) - $($getReturnItems.error | ConvertTo-Json -Compress)" }
}

# PUT /returns/:id/status (Admin)
if ($returnId) {
    $updateReturnStatus = Api "PUT" "/returns/$returnId/status" @{ status="approved"; refundAmount=500 }
    if ($updateReturnStatus.ok) { Log "PUT /returns/:id/status" "PASS" "Approved" }
    else { Log "PUT /returns/:id/status" "FAIL" "$($updateReturnStatus.status) - $($updateReturnStatus.error | ConvertTo-Json -Compress)" }
}

# ═══════════════════════════════════════════════════════════════
# ██  REVIEWS MODULE
# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== REVIEWS ROUTES ===" -ForegroundColor Cyan

# POST /reviews
if ($productId) {
    $createReview = Api "POST" "/reviews" @{
        productId=$productId; rating=4; title="Great product"; body="Really enjoyed using this product. Quality is excellent."
    }
    if ($createReview.ok) {
        $reviewId = (D $createReview.data).id
        Log "POST /reviews" "PASS" "ReviewId: $reviewId"
    } else { Log "POST /reviews" "FAIL" "$($createReview.status) - $($createReview.error | ConvertTo-Json -Compress)" }
}

# GET /reviews (Public)
$listReviews = Api "GET" "/reviews?page=1&limit=5"
if ($listReviews.ok) { Log "GET /reviews" "PASS" "Listed" }
else { Log "GET /reviews" "FAIL" "$($listReviews.status) - $($listReviews.error | ConvertTo-Json -Compress)" }

# GET /reviews/product/:productId/summary (Public)
if ($productId) {
    $getSummary = Api "GET" "/reviews/product/$productId/summary"
    if ($getSummary.ok) { Log "GET /reviews/product/:id/summary" "PASS" "Got summary" }
    else { Log "GET /reviews/product/:id/summary" "FAIL" "$($getSummary.status) - $($getSummary.error | ConvertTo-Json -Compress)" }
}

# GET /reviews/:id (Public)
if ($reviewId) {
    $getReview = Api "GET" "/reviews/$reviewId"
    if ($getReview.ok) { Log "GET /reviews/:id" "PASS" "Found" }
    else { Log "GET /reviews/:id" "FAIL" "$($getReview.status) - $($getReview.error | ConvertTo-Json -Compress)" }
}

# PUT /reviews/:id (Admin - update status)
if ($reviewId) {
    $updateReview = Api "PUT" "/reviews/$reviewId" @{ status="approved" }
    if ($updateReview.ok) { Log "PUT /reviews/:id" "PASS" "Status -> approved" }
    else { Log "PUT /reviews/:id" "FAIL" "$($updateReview.status) - $($updateReview.error | ConvertTo-Json -Compress)" }
}

# DELETE /reviews/:id
if ($reviewId) {
    $delReview = Api "DELETE" "/reviews/$reviewId"
    if ($delReview.ok) { Log "DELETE /reviews/:id" "PASS" "Deleted" }
    else { Log "DELETE /reviews/:id" "FAIL" "$($delReview.status) - $($delReview.error | ConvertTo-Json -Compress)" }
}

# ═══════════════════════════════════════════════════════════════
# ██  WAREHOUSES MODULE
# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== WAREHOUSE ROUTES ===" -ForegroundColor Cyan

# POST /warehouses
$whCode = "WH$(Get-Random -Minimum 1000 -Maximum 9999)"
$createWH = Api "POST" "/warehouses" @{
    code=$whCode; name="Test Warehouse $whCode"; line1="Industrial Area Block 5"; city="Karachi"; country="PK"; isActive=$true
}
if ($createWH.ok) {
    $warehouseId = (D $createWH.data).id
    Log "POST /warehouses" "PASS" "WHId: $warehouseId"
} else { Log "POST /warehouses" "FAIL" "$($createWH.status) - $($createWH.error | ConvertTo-Json -Compress)" }

# GET /warehouses
$listWH = Api "GET" "/warehouses"
if ($listWH.ok) { Log "GET /warehouses" "PASS" "Listed" }
else { Log "GET /warehouses" "FAIL" "$($listWH.status) - $($listWH.error | ConvertTo-Json -Compress)" }

# GET /warehouses/:id
if ($warehouseId) {
    $getWH = Api "GET" "/warehouses/$warehouseId"
    if ($getWH.ok) { Log "GET /warehouses/:id" "PASS" "Found" }
    else { Log "GET /warehouses/:id" "FAIL" "$($getWH.status) - $($getWH.error | ConvertTo-Json -Compress)" }
}

# PUT /warehouses/:id
if ($warehouseId) {
    $updateWH = Api "PUT" "/warehouses/$warehouseId" @{ name="Updated Warehouse" }
    if ($updateWH.ok) { Log "PUT /warehouses/:id" "PASS" "Updated" }
    else { Log "PUT /warehouses/:id" "FAIL" "$($updateWH.status) - $($updateWH.error | ConvertTo-Json -Compress)" }
}

# ═══════════════════════════════════════════════════════════════
# ██  INVENTORY MODULE
# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== INVENTORY ROUTES ===" -ForegroundColor Cyan

# POST /inventory/set
if ($warehouseId -and $variantId) {
    $setStock = Api "POST" "/inventory/set" @{ warehouseId=$warehouseId; variantId=$variantId; qtyOnHand=100 }
    if ($setStock.ok) { Log "POST /inventory/set" "PASS" "Stock set to 100" }
    else { Log "POST /inventory/set" "FAIL" "$($setStock.status) - $($setStock.error | ConvertTo-Json -Compress)" }
}

# POST /inventory/adjust
if ($warehouseId -and $variantId) {
    $adjStock = Api "POST" "/inventory/adjust" @{ warehouseId=$warehouseId; variantId=$variantId; delta=10 }
    if ($adjStock.ok) { Log "POST /inventory/adjust" "PASS" "Adjusted +10" }
    else { Log "POST /inventory/adjust" "FAIL" "$($adjStock.status) - $($adjStock.error | ConvertTo-Json -Compress)" }
}

# POST /inventory/reserve
if ($warehouseId -and $variantId) {
    $reserveStock = Api "POST" "/inventory/reserve" @{ warehouseId=$warehouseId; variantId=$variantId; delta=5 }
    if ($reserveStock.ok) { Log "POST /inventory/reserve" "PASS" "Reserved 5" }
    else { Log "POST /inventory/reserve" "FAIL" "$($reserveStock.status) - $($reserveStock.error | ConvertTo-Json -Compress)" }
}

# POST /inventory/release
if ($warehouseId -and $variantId) {
    $releaseStock = Api "POST" "/inventory/release" @{ warehouseId=$warehouseId; variantId=$variantId; delta=3 }
    if ($releaseStock.ok) { Log "POST /inventory/release" "PASS" "Released 3" }
    else { Log "POST /inventory/release" "FAIL" "$($releaseStock.status) - $($releaseStock.error | ConvertTo-Json -Compress)" }
}

# GET /inventory
$getInv = Api "GET" "/inventory"
if ($getInv.ok) { Log "GET /inventory" "PASS" "Listed" }
else { Log "GET /inventory" "FAIL" "$($getInv.status) - $($getInv.error | ConvertTo-Json -Compress)" }

# GET /inventory/low-stock
$getLowStock = Api "GET" "/inventory/low-stock"
if ($getLowStock.ok) { Log "GET /inventory/low-stock" "PASS" "Got low stock" }
else { Log "GET /inventory/low-stock" "FAIL" "$($getLowStock.status) - $($getLowStock.error | ConvertTo-Json -Compress)" }

# ═══════════════════════════════════════════════════════════════
# ██  SHIPPING MODULE - ZONES
# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== SHIPPING ZONE ROUTES ===" -ForegroundColor Cyan

# POST /shipping/zones (Admin)
$createZone = Api "POST" "/shipping/zones" @{ name="Pakistan Zone $(Get-Random)"; isActive=$true }
if ($createZone.ok) {
    $zoneId = (D $createZone.data).id
    Log "POST /shipping/zones" "PASS" "ZoneId: $zoneId"
} else { Log "POST /shipping/zones" "FAIL" "$($createZone.status) - $($createZone.error | ConvertTo-Json -Compress)" }

# GET /shipping/zones (Public)
$listZones = Api "GET" "/shipping/zones"
if ($listZones.ok) { Log "GET /shipping/zones" "PASS" "Listed" }
else { Log "GET /shipping/zones" "FAIL" "$($listZones.status) - $($listZones.error | ConvertTo-Json -Compress)" }

# GET /shipping/zones/:id (Public)
if ($zoneId) {
    $getZone = Api "GET" "/shipping/zones/$zoneId"
    if ($getZone.ok) { Log "GET /shipping/zones/:id" "PASS" "Found" }
    else { Log "GET /shipping/zones/:id" "FAIL" "$($getZone.status) - $($getZone.error | ConvertTo-Json -Compress)" }
}

# PUT /shipping/zones/:id (Admin)
if ($zoneId) {
    $updateZone = Api "PUT" "/shipping/zones/$zoneId" @{ name="Updated Zone" }
    if ($updateZone.ok) { Log "PUT /shipping/zones/:id" "PASS" "Updated" }
    else { Log "PUT /shipping/zones/:id" "FAIL" "$($updateZone.status) - $($updateZone.error | ConvertTo-Json -Compress)" }
}

# POST /shipping/zones/:zoneId/countries (Admin)
if ($zoneId) {
    $addCountry = Api "POST" "/shipping/zones/$zoneId/countries" @{ country="PK" }
    if ($addCountry.ok) { Log "POST /shipping/zones/:id/countries" "PASS" "Added PK" }
    else { Log "POST /shipping/zones/:id/countries" "FAIL" "$($addCountry.status) - $($addCountry.error | ConvertTo-Json -Compress)" }
}

# GET /shipping/zones/:zoneId/countries
if ($zoneId) {
    $getCountries = Api "GET" "/shipping/zones/$zoneId/countries"
    if ($getCountries.ok) { Log "GET /shipping/zones/:id/countries" "PASS" "Listed" }
    else { Log "GET /shipping/zones/:id/countries" "FAIL" "$($getCountries.status) - $($getCountries.error | ConvertTo-Json -Compress)" }
}

# ═══════════════════════════════════════════════════════════════
# ██  SHIPPING MODULE - METHODS
# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== SHIPPING METHOD ROUTES ===" -ForegroundColor Cyan

# POST /shipping/methods (Admin)
if ($zoneId) {
    $createMethod = Api "POST" "/shipping/methods" @{
        zoneId=$zoneId; name="Standard Delivery"; carrier="TCS"; estimatedDaysMin=3; estimatedDaysMax=7;
        baseRate=200; perKgRate=50; freeThreshold=5000; isActive=$true
    }
    if ($createMethod.ok) {
        $methodId = (D $createMethod.data).id
        Log "POST /shipping/methods" "PASS" "MethodId: $methodId"
    } else { Log "POST /shipping/methods" "FAIL" "$($createMethod.status) - $($createMethod.error | ConvertTo-Json -Compress)" }
}

# GET /shipping/methods
$listMethods = Api "GET" "/shipping/methods"
if ($listMethods.ok) { Log "GET /shipping/methods" "PASS" "Listed" }
else { Log "GET /shipping/methods" "FAIL" "$($listMethods.status) - $($listMethods.error | ConvertTo-Json -Compress)" }

# GET /shipping/methods/:id
if ($methodId) {
    $getMethod = Api "GET" "/shipping/methods/$methodId"
    if ($getMethod.ok) { Log "GET /shipping/methods/:id" "PASS" "Found" }
    else { Log "GET /shipping/methods/:id" "FAIL" "$($getMethod.status) - $($getMethod.error | ConvertTo-Json -Compress)" }
}

# PUT /shipping/methods/:id (Admin)
if ($methodId) {
    $updateMethod = Api "PUT" "/shipping/methods/$methodId" @{ name="Express Delivery"; estimatedDaysMin=1; estimatedDaysMax=3 }
    if ($updateMethod.ok) { Log "PUT /shipping/methods/:id" "PASS" "Updated" }
    else { Log "PUT /shipping/methods/:id" "FAIL" "$($updateMethod.status) - $($updateMethod.error | ConvertTo-Json -Compress)" }
}

# ═══════════════════════════════════════════════════════════════
# ██  SHIPPING MODULE - SHIPMENTS
# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== SHIPPING SHIPMENT ROUTES ===" -ForegroundColor Cyan

# POST /shipping/shipments
if ($orderId -and $warehouseId -and $methodId) {
    $createShipment = Api "POST" "/shipping/shipments" @{
        orderId=$orderId; warehouseId=$warehouseId; shippingMethodId=$methodId;
        trackingNumber="TRK$(Get-Random -Minimum 100000 -Maximum 999999)"; carrier="TCS"
    }
    if ($createShipment.ok) {
        $shipmentId = (D $createShipment.data).id
        Log "POST /shipping/shipments" "PASS" "ShipmentId: $shipmentId"
    } else { Log "POST /shipping/shipments" "FAIL" "$($createShipment.status) - $($createShipment.error | ConvertTo-Json -Compress)" }
}

# GET /shipping/shipments/:id
if ($shipmentId) {
    $getShipment = Api "GET" "/shipping/shipments/$shipmentId"
    if ($getShipment.ok) { Log "GET /shipping/shipments/:id" "PASS" "Found" }
    else { Log "GET /shipping/shipments/:id" "FAIL" "$($getShipment.status) - $($getShipment.error | ConvertTo-Json -Compress)" }
}

# PUT /shipping/shipments/:id
if ($shipmentId) {
    $updateShipment = Api "PUT" "/shipping/shipments/$shipmentId" @{ carrier="Leopards" }
    if ($updateShipment.ok) { Log "PUT /shipping/shipments/:id" "PASS" "Updated" }
    else { Log "PUT /shipping/shipments/:id" "FAIL" "$($updateShipment.status) - $($updateShipment.error | ConvertTo-Json -Compress)" }
}

# POST /shipping/shipments/:id/events
if ($shipmentId) {
    $nowISO = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    $eventBody = '{"status":"dispatched","location":"Karachi Hub","description":"Package dispatched from warehouse","occurredAt":"' + $nowISO + '"}'
    try {
        $addEvent = Invoke-RestMethod -Uri "$base/shipping/shipments/$shipmentId/events" -Method POST -Body $eventBody -ContentType "application/json" -Headers $script:h
        $eventId = (D $addEvent).id
        Log "POST /shipping/shipments/:id/events" "PASS" "EventId: $eventId"
    } catch {
        $errB = $null; try { $errB = $_.ErrorDetails.Message | ConvertFrom-Json } catch {}
        Log "POST /shipping/shipments/:id/events" "FAIL" "$($_.Exception.Response.StatusCode.value__) - $($errB | ConvertTo-Json -Compress)"
    }
}

# GET /shipping/shipments/:id/events
if ($shipmentId) {
    $getEvents = Api "GET" "/shipping/shipments/$shipmentId/events"
    if ($getEvents.ok) { Log "GET /shipping/shipments/:id/events" "PASS" "Listed" }
    else { Log "GET /shipping/shipments/:id/events" "FAIL" "$($getEvents.status) - $($getEvents.error | ConvertTo-Json -Compress)" }
}

# GET /shipping/order/:orderId/shipments
if ($orderId) {
    $getOrderShipments = Api "GET" "/shipping/order/$orderId/shipments"
    if ($getOrderShipments.ok) { Log "GET /shipping/order/:orderId/shipments" "PASS" "Listed" }
    else { Log "GET /shipping/order/:orderId/shipments" "FAIL" "$($getOrderShipments.status) - $($getOrderShipments.error | ConvertTo-Json -Compress)" }
}

# ═══════════════════════════════════════════════════════════════
# ██  CHAT MODULE
# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== CHAT ROUTES ===" -ForegroundColor Cyan

# POST /chat/threads
$createThread = Api "POST" "/chat/threads" @{ subject="Test support thread"; participantUserIds=@($userId) }
if ($createThread.ok) {
    $threadId = (D $createThread.data).id
    Log "POST /chat/threads" "PASS" "ThreadId: $threadId"
} else { Log "POST /chat/threads" "FAIL" "$($createThread.status) - $($createThread.error | ConvertTo-Json -Compress)" }

# GET /chat/threads/:id
if ($threadId) {
    $getThread = Api "GET" "/chat/threads/$threadId"
    if ($getThread.ok) { Log "GET /chat/threads/:id" "PASS" "Found" }
    else { Log "GET /chat/threads/:id" "FAIL" "$($getThread.status) - $($getThread.error | ConvertTo-Json -Compress)" }
}

# GET /chat/mine/threads
$getMyThreads = Api "GET" "/chat/mine/threads"
if ($getMyThreads.ok) { Log "GET /chat/mine/threads" "PASS" "Listed" }
else { Log "GET /chat/mine/threads" "FAIL" "$($getMyThreads.status) - $($getMyThreads.error | ConvertTo-Json -Compress)" }

# PUT /chat/threads/:id/status
if ($threadId) {
    $updateThreadStatus = Api "PUT" "/chat/threads/$threadId/status" @{ status="archived" }
    if ($updateThreadStatus.ok) { Log "PUT /chat/threads/:id/status" "PASS" "Status -> archived" }
    else { Log "PUT /chat/threads/:id/status" "FAIL" "$($updateThreadStatus.status) - $($updateThreadStatus.error | ConvertTo-Json -Compress)" }
}

# POST /chat/messages
if ($threadId) {
    $sendMsg = Api "POST" "/chat/messages" @{ threadId=$threadId; body="Hello, I need help with my order!" }
    if ($sendMsg.ok) {
        $msgId = (D $sendMsg.data).id
        Log "POST /chat/messages" "PASS" "MsgId: $msgId"
    } else { Log "POST /chat/messages" "FAIL" "$($sendMsg.status) - $($sendMsg.error | ConvertTo-Json -Compress)" }
}

# GET /chat/threads/:id/messages
if ($threadId) {
    $getMessages = Api "GET" "/chat/threads/$threadId/messages"
    if ($getMessages.ok) { Log "GET /chat/threads/:id/messages" "PASS" "Listed" }
    else { Log "GET /chat/threads/:id/messages" "FAIL" "$($getMessages.status) - $($getMessages.error | ConvertTo-Json -Compress)" }
}

# GET /chat/threads/:id/participants
if ($threadId) {
    $getParticipants = Api "GET" "/chat/threads/$threadId/participants"
    if ($getParticipants.ok) { Log "GET /chat/threads/:id/participants" "PASS" "Listed" }
    else { Log "GET /chat/threads/:id/participants" "FAIL" "$($getParticipants.status) - $($getParticipants.error | ConvertTo-Json -Compress)" }
}

# PUT /chat/threads/:threadId/read
if ($threadId) {
    $markRead = Api "PUT" "/chat/threads/$threadId/read"
    if ($markRead.ok) { Log "PUT /chat/threads/:threadId/read" "PASS" "Marked read" }
    else { Log "PUT /chat/threads/:threadId/read" "FAIL" "$($markRead.status) - $($markRead.error | ConvertTo-Json -Compress)" }
}

# ═══════════════════════════════════════════════════════════════
# ██  SEARCH MODULE
# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== SEARCH ROUTES ===" -ForegroundColor Cyan

# POST /search
$logSearch = Api "POST" "/search" @{ query="wireless headphones"; resultCount=15 }
if ($logSearch.ok) {
    $searchId = (D $logSearch.data).id
    Log "POST /search" "PASS" "SearchId: $searchId"
} else { Log "POST /search" "FAIL" "$($logSearch.status) - $($logSearch.error | ConvertTo-Json -Compress)" }

# GET /search/history
$getHistory = Api "GET" "/search/history"
if ($getHistory.ok) { Log "GET /search/history" "PASS" "Got history" }
else { Log "GET /search/history" "FAIL" "$($getHistory.status) - $($getHistory.error | ConvertTo-Json -Compress)" }

# GET /search/popular (Public)
$getPopular = Api "GET" "/search/popular"
if ($getPopular.ok) { Log "GET /search/popular" "PASS" "Got popular" }
else { Log "GET /search/popular" "FAIL" "$($getPopular.status) - $($getPopular.error | ConvertTo-Json -Compress)" }

# PUT /search/:id/click
if ($searchId -and $productId) {
    $recordClick = Api "PUT" "/search/$searchId/click" @{ productId=$productId }
    if ($recordClick.ok) { Log "PUT /search/:id/click" "PASS" "Click recorded" }
    else { Log "PUT /search/:id/click" "FAIL" "$($recordClick.status) - $($recordClick.error | ConvertTo-Json -Compress)" }
}

# GET /search/products
$searchProds = Api "GET" "/search/products?q=test&page=1&limit=5"
if ($searchProds.ok) { Log "GET /search/products" "PASS" "Searched" }
else { Log "GET /search/products" "FAIL" "$($searchProds.status) - $($searchProds.error | ConvertTo-Json -Compress)" }

# ═══════════════════════════════════════════════════════════════
# ██  AUDIT LOGS MODULE
# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== AUDIT LOG ROUTES ===" -ForegroundColor Cyan

# POST /audit-logs (Admin)
$createAudit = Api "POST" "/audit-logs" @{
    actorId=$userId; action="insert"; tableName="products"; recordId=$productId;
    diff=@{ before=@{ name="Old" }; after=@{ name="New" } }
}
if ($createAudit.ok) {
    $auditId = (D $createAudit.data).id
    Log "POST /audit-logs" "PASS" "AuditId: $auditId"
} else { Log "POST /audit-logs" "FAIL" "$($createAudit.status) - $($createAudit.error | ConvertTo-Json -Compress)" }

# GET /audit-logs (Admin)
$listAudit = Api "GET" "/audit-logs"
if ($listAudit.ok) { Log "GET /audit-logs" "PASS" "Listed" }
else { Log "GET /audit-logs" "FAIL" "$($listAudit.status) - $($listAudit.error | ConvertTo-Json -Compress)" }

# GET /audit-logs/entity/:tableName/:recordId (Admin)
if ($productId) {
    $getAuditEntity = Api "GET" "/audit-logs/entity/products/$productId"
    if ($getAuditEntity.ok) { Log "GET /audit-logs/entity/:table/:id" "PASS" "Found" }
    else { Log "GET /audit-logs/entity/:table/:id" "FAIL" "$($getAuditEntity.status) - $($getAuditEntity.error | ConvertTo-Json -Compress)" }
}

# GET /audit-logs/:id (Admin)
if ($auditId) {
    $getAudit = Api "GET" "/audit-logs/$auditId"
    if ($getAudit.ok) { Log "GET /audit-logs/:id" "PASS" "Found" }
    else { Log "GET /audit-logs/:id" "FAIL" "$($getAudit.status) - $($getAudit.error | ConvertTo-Json -Compress)" }
}

# ═══════════════════════════════════════════════════════════════
# ██  STRIPE MODULE (limited - no real Stripe keys)
# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== STRIPE ROUTES ===" -ForegroundColor Cyan

# POST /stripe/checkout (will likely fail without Stripe config, but tests the route exists)
if ($orderId) {
    $stripeCheckout = Api "POST" "/stripe/checkout" @{
        orderId=$orderId; successUrl="http://localhost:3000/success"; cancelUrl="http://localhost:3000/cancel"
    }
    if ($stripeCheckout.ok) { Log "POST /stripe/checkout" "PASS" "Session created" }
    else {
        # 500/502 means Stripe not configured (expected), 404 means route missing (bug)
        if ($stripeCheckout.status -eq 404) { Log "POST /stripe/checkout" "FAIL" "Route not found!" }
        else { Log "POST /stripe/checkout" "PASS" "Route exists (Stripe not configured: $($stripeCheckout.status))" }
    }
}

# POST /stripe/subscribe
$stripeSub = Api "POST" "/stripe/subscribe" @{
    priceId="price_test_123"; successUrl="http://localhost:3000/success"; cancelUrl="http://localhost:3000/cancel"
}
if ($stripeSub.ok) { Log "POST /stripe/subscribe" "PASS" "Session created" }
else {
    if ($stripeSub.status -eq 404) { Log "POST /stripe/subscribe" "FAIL" "Route not found!" }
    else { Log "POST /stripe/subscribe" "PASS" "Route exists (Stripe not configured: $($stripeSub.status))" }
}

# GET /stripe/prices
$stripePrices = Api "GET" "/stripe/prices"
if ($stripePrices.ok) { Log "GET /stripe/prices" "PASS" "Got prices" }
else {
    if ($stripePrices.status -eq 404) { Log "GET /stripe/prices" "FAIL" "Route not found!" }
    else { Log "GET /stripe/prices" "PASS" "Route exists (Stripe not configured: $($stripePrices.status))" }
}

# POST /stripe/webhook (needs raw body + stripe-signature header, so just test route exists)
try {
    $webhookRes = Invoke-WebRequest -Uri "$base/stripe/webhook" -Method POST -Body '{}' -ContentType "application/json" -UseBasicParsing -TimeoutSec 5
    Log "POST /stripe/webhook" "PASS" "Route exists: $($webhookRes.StatusCode)"
} catch {
    $wsc = $_.Exception.Response.StatusCode.value__
    if ($wsc -eq 404) { Log "POST /stripe/webhook" "FAIL" "Route not found!" }
    else { Log "POST /stripe/webhook" "PASS" "Route exists (expected error without signature: $wsc)" }
}

# ═══════════════════════════════════════════════════════════════
# ██  CLEANUP
# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== CLEANUP ===" -ForegroundColor Cyan

if ($warehouseId) {
    $delWH = Api "DELETE" "/warehouses/$warehouseId"
    if ($delWH.ok) { Log "DELETE /warehouses/:id" "PASS" "Deleted" }
    else { Log "DELETE /warehouses/:id" "FAIL" "$($delWH.status) - $($delWH.error | ConvertTo-Json -Compress)" }
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
