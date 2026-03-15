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

# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== STEP 0: LOGIN ===" -ForegroundColor Cyan
$loginBody = '{"email":"husnainramzan7194@gmail.com","password":"SuperAdmin@123!"}'
try {
    $loginRes = Invoke-RestMethod -Uri "$base/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginRes.data.accessToken
    $script:h = @{ Authorization = "Bearer $token" }
    Log "Login" "PASS" "Got token"
} catch {
    Log "Login" "FAIL" $_.Exception.Message
    exit 1
}

# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== STEP 1: PREREQUISITES (Category, Brand, Store) ===" -ForegroundColor Cyan

# Check/create category
$catRes = Api "GET" "/categories"
if ($catRes.ok -and $catRes.data.data -and $catRes.data.data.Count -gt 0) {
    $categoryId = $catRes.data.data[0].id
    Log "Get Category" "PASS" "Using existing: $categoryId"
} else {
    $newCat = Api "POST" "/categories" @{ name="Test Electronics"; slug="test-electronics-$(Get-Random)"; description="Test category" }
    if ($newCat.ok) { $categoryId = $newCat.data.data.id; if(!$categoryId){$categoryId=$newCat.data.id}; Log "Create Category" "PASS" $categoryId }
    else { Log "Create Category" "FAIL" ($newCat.error | ConvertTo-Json -Compress); $categoryId = $null }
}

# Check/create brand
$brandRes = Api "GET" "/brands"
if ($brandRes.ok -and $brandRes.data.data -and $brandRes.data.data.Count -gt 0) {
    $brandId = $brandRes.data.data[0].id
    Log "Get Brand" "PASS" "Using existing: $brandId"
} else {
    $newBrand = Api "POST" "/brands" @{ name="Test Nike"; slug="test-nike-$(Get-Random)" }
    if ($newBrand.ok) { $brandId = $newBrand.data.data.id; if(!$brandId){$brandId=$newBrand.data.id}; Log "Create Brand" "PASS" $brandId }
    else { Log "Create Brand" "FAIL" ($newBrand.error | ConvertTo-Json -Compress); $brandId = $null }
}

# Get store from existing products
$prodsForStore = Api "GET" "/products?limit=1"
$storeId = $null
if ($prodsForStore.ok -and $prodsForStore.data.data -and $prodsForStore.data.data.Count -gt 0) {
    $storeId = $prodsForStore.data.data[0].storeId
}
if (!$storeId) {
    # Try sellers/stores endpoint
    $storeRes = Api "GET" "/sellers/stores"
    if ($storeRes.ok) {
        $storesData = $storeRes.data
        if ($storesData.data -and $storesData.data.Count -gt 0) { $storeId = $storesData.data[0].id }
        elseif ($storesData -is [array] -and $storesData.Count -gt 0) { $storeId = $storesData[0].id }
    }
}
if ($storeId) {
    Log "Get Store" "PASS" "Using: $storeId"
} else {
    Log "Get Store" "FAIL" "No store found anywhere!"
}

# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== STEP 2: PRODUCT CRUD ===" -ForegroundColor Cyan

# POST /products - Create
$slug = "test-product-$(Get-Random)"
$createProductBody = @{
    storeId = $storeId
    categoryId = $categoryId
    brandId = $brandId
    name = "Test Product Flow"
    slug = $slug
    shortDesc = "Short description for test"
    fullDesc = "Full description for test product"
    basePrice = 5000
    currency = "PKR"
    isActive = $true
    isDigital = $false
    requiresShipping = $true
    taxClass = "standard"
}
$createProduct = Api "POST" "/products" $createProductBody
if ($createProduct.ok) {
    $product = $createProduct.data.data
    if (!$product) { $product = $createProduct.data }
    $productId = $product.id
    Log "POST /products" "PASS" "Created: $productId"
} else {
    Log "POST /products" "FAIL" "$($createProduct.status) - $($createProduct.error | ConvertTo-Json -Compress)"
    # Try without store
    $createProductBody.Remove("storeId")
    $createProduct = Api "POST" "/products" $createProductBody
    if ($createProduct.ok) {
        $product = $createProduct.data.data; if(!$product){$product=$createProduct.data}
        $productId = $product.id
        Log "POST /products (no store)" "PASS" "Created: $productId"
    } else {
        Log "POST /products (retry)" "FAIL" "$($createProduct.status) - $($createProduct.error | ConvertTo-Json -Compress)"
    }
}

# GET /products - List
$listProducts = Api "GET" "/products"
if ($listProducts.ok) { Log "GET /products" "PASS" "Total: $($listProducts.data.total)" }
else { Log "GET /products" "FAIL" $listProducts.msg }

# GET /products?page=1&limit=5&search=Test
$listFiltered = Api "GET" "/products?page=1&limit=5&search=Test"
if ($listFiltered.ok) { Log "GET /products (filtered)" "PASS" "Found: $($listFiltered.data.total)" }
else { Log "GET /products (filtered)" "FAIL" $listFiltered.msg }

# GET /products/:id
if ($productId) {
    $getOne = Api "GET" "/products/$productId"
    if ($getOne.ok) { $pName = if($getOne.data.data){$getOne.data.data.name}else{$getOne.data.name}; Log "GET /products/:id" "PASS" "Got: $pName" }
    else { Log "GET /products/:id" "FAIL" $getOne.msg }
}

# GET /products/slug/:slug
if ($slug) {
    $getSlug = Api "GET" "/products/slug/$slug"
    if ($getSlug.ok) { Log "GET /products/slug/:slug" "PASS" "Got by slug" }
    else { Log "GET /products/slug/:slug" "FAIL" "$($getSlug.status) - $($getSlug.error | ConvertTo-Json -Compress)" }
}

# PUT /products/:id
if ($productId) {
    $updateProduct = Api "PUT" "/products/$productId" @{ name="Test Product Updated"; shortDesc="Updated desc" }
    if ($updateProduct.ok) { Log "PUT /products/:id" "PASS" "Updated" }
    else { Log "PUT /products/:id" "FAIL" "$($updateProduct.status) - $($updateProduct.error | ConvertTo-Json -Compress)" }
}

# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== STEP 3: ATTRIBUTE KEYS ===" -ForegroundColor Cyan

# POST /products/attributes/keys - Create Color
$createColorKey = Api "POST" "/products/attributes/keys" @{ name="Color"; slug="color-$(Get-Random)"; inputType="select" }
if ($createColorKey.ok) {
    $colorKey = $createColorKey.data.data; if(!$colorKey){$colorKey=$createColorKey.data}
    $colorKeyId = $colorKey.id
    Log "POST attributes/keys (Color)" "PASS" $colorKeyId
} else { Log "POST attributes/keys (Color)" "FAIL" "$($createColorKey.status) - $($createColorKey.error | ConvertTo-Json -Compress)" }

# POST /products/attributes/keys - Create Size
$createSizeKey = Api "POST" "/products/attributes/keys" @{ name="Size"; slug="size-$(Get-Random)"; inputType="select" }
if ($createSizeKey.ok) {
    $sizeKey = $createSizeKey.data.data; if(!$sizeKey){$sizeKey=$createSizeKey.data}
    $sizeKeyId = $sizeKey.id
    Log "POST attributes/keys (Size)" "PASS" $sizeKeyId
} else { Log "POST attributes/keys (Size)" "FAIL" "$($createSizeKey.status) - $($createSizeKey.error | ConvertTo-Json -Compress)" }

# GET /products/attributes/keys
$listKeys = Api "GET" "/products/attributes/keys"
if ($listKeys.ok) { Log "GET attributes/keys" "PASS" "Count: $($listKeys.data.Count)" }
else { Log "GET attributes/keys" "FAIL" $listKeys.msg }

# GET /products/attributes/keys/:id
if ($colorKeyId) {
    $getKey = Api "GET" "/products/attributes/keys/$colorKeyId"
    if ($getKey.ok) { Log "GET attributes/keys/:id" "PASS" "Got key" }
    else { Log "GET attributes/keys/:id" "FAIL" $getKey.msg }
}

# PUT /products/attributes/keys/:id
if ($colorKeyId) {
    $updateKey = Api "PUT" "/products/attributes/keys/$colorKeyId" @{ name="Color Updated" }
    if ($updateKey.ok) { Log "PUT attributes/keys/:id" "PASS" "Updated" }
    else { Log "PUT attributes/keys/:id" "FAIL" "$($updateKey.status) - $($updateKey.error | ConvertTo-Json -Compress)" }
}

# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== STEP 4: ATTRIBUTE VALUES ===" -ForegroundColor Cyan

# POST /products/attributes/keys/:keyId/values - Red
if ($colorKeyId) {
    $createRed = Api "POST" "/products/attributes/keys/$colorKeyId/values" @{ value="Red"; displayValue="Red"; sortOrder=1 }
    if ($createRed.ok) {
        $redVal = $createRed.data.data; if(!$redVal){$redVal=$createRed.data}
        $redValueId = $redVal.id
        Log "POST attr values (Red)" "PASS" $redValueId
    } else { Log "POST attr values (Red)" "FAIL" "$($createRed.status) - $($createRed.error | ConvertTo-Json -Compress)" }

    # Blue
    $createBlue = Api "POST" "/products/attributes/keys/$colorKeyId/values" @{ value="Blue"; displayValue="Blue"; sortOrder=2 }
    if ($createBlue.ok) {
        $blueVal = $createBlue.data.data; if(!$blueVal){$blueVal=$createBlue.data}
        $blueValueId = $blueVal.id
        Log "POST attr values (Blue)" "PASS" $blueValueId
    } else { Log "POST attr values (Blue)" "FAIL" "$($createBlue.status) - $($createBlue.error | ConvertTo-Json -Compress)" }
}

if ($sizeKeyId) {
    # Size 40
    $createS40 = Api "POST" "/products/attributes/keys/$sizeKeyId/values" @{ value="40"; displayValue="EU 40"; sortOrder=1 }
    if ($createS40.ok) {
        $s40Val = $createS40.data.data; if(!$s40Val){$s40Val=$createS40.data}
        $size40Id = $s40Val.id
        Log "POST attr values (Size 40)" "PASS" $size40Id
    } else { Log "POST attr values (Size 40)" "FAIL" "$($createS40.status) - $($createS40.error | ConvertTo-Json -Compress)" }

    # Size 41
    $createS41 = Api "POST" "/products/attributes/keys/$sizeKeyId/values" @{ value="41"; displayValue="EU 41"; sortOrder=2 }
    if ($createS41.ok) {
        $s41Val = $createS41.data.data; if(!$s41Val){$s41Val=$createS41.data}
        $size41Id = $s41Val.id
        Log "POST attr values (Size 41)" "PASS" $size41Id
    } else { Log "POST attr values (Size 41)" "FAIL" "$($createS41.status) - $($createS41.error | ConvertTo-Json -Compress)" }
}

# GET /products/attributes/keys/:keyId/values
if ($colorKeyId) {
    $listVals = Api "GET" "/products/attributes/keys/$colorKeyId/values"
    if ($listVals.ok) { Log "GET attr values" "PASS" "Count: $($listVals.data.Count)" }
    else { Log "GET attr values" "FAIL" $listVals.msg }
}

# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== STEP 5: VARIANTS ===" -ForegroundColor Cyan

if ($productId) {
    # POST /products/variants - Variant 1 (Red-40)
    $createV1 = Api "POST" "/products/variants" @{ productId=$productId; sku="TEST-RED-40-$(Get-Random)"; price=5500; weightGrams=300; isActive=$true }
    if ($createV1.ok) {
        $v1 = $createV1.data.data; if(!$v1){$v1=$createV1.data}
        $variant1Id = $v1.id
        Log "POST /products/variants (V1)" "PASS" $variant1Id
    } else { Log "POST /products/variants (V1)" "FAIL" "$($createV1.status) - $($createV1.error | ConvertTo-Json -Compress)" }

    # POST /products/variants - Variant 2 (Blue-41)
    $createV2 = Api "POST" "/products/variants" @{ productId=$productId; sku="TEST-BLU-41-$(Get-Random)"; price=6000; weightGrams=320; isActive=$true }
    if ($createV2.ok) {
        $v2 = $createV2.data.data; if(!$v2){$v2=$createV2.data}
        $variant2Id = $v2.id
        Log "POST /products/variants (V2)" "PASS" $variant2Id
    } else { Log "POST /products/variants (V2)" "FAIL" "$($createV2.status) - $($createV2.error | ConvertTo-Json -Compress)" }

    # GET /products/:productId/variants
    $listVariants = Api "GET" "/products/$productId/variants"
    if ($listVariants.ok) {
        $vData = $listVariants.data.data; if(!$vData){$vData=$listVariants.data}
        Log "GET /products/:id/variants" "PASS" "Count: $($vData.Count)"
    } else { Log "GET /products/:id/variants" "FAIL" $listVariants.msg }

    # PUT /products/variants/:id
    if ($variant1Id) {
        $updateV = Api "PUT" "/products/variants/$variant1Id" @{ price=5999 }
        if ($updateV.ok) { Log "PUT /products/variants/:id" "PASS" "Updated price" }
        else { Log "PUT /products/variants/:id" "FAIL" "$($updateV.status) - $($updateV.error | ConvertTo-Json -Compress)" }
    }
}

# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== STEP 6: VARIANT ATTRIBUTES ===" -ForegroundColor Cyan

# POST /products/variants/:variantId/attributes
if ($variant1Id -and $colorKeyId -and $redValueId) {
    $assignColor1 = Api "POST" "/products/variants/$variant1Id/attributes" @{ attributeKeyId=$colorKeyId; attributeValueId=$redValueId }
    if ($assignColor1.ok) { Log "POST variant attr (V1=Red)" "PASS" "Assigned" }
    else { Log "POST variant attr (V1=Red)" "FAIL" "$($assignColor1.status) - $($assignColor1.error | ConvertTo-Json -Compress)" }
}

if ($variant1Id -and $sizeKeyId -and $size40Id) {
    $assignSize1 = Api "POST" "/products/variants/$variant1Id/attributes" @{ attributeKeyId=$sizeKeyId; attributeValueId=$size40Id }
    if ($assignSize1.ok) { Log "POST variant attr (V1=40)" "PASS" "Assigned" }
    else { Log "POST variant attr (V1=40)" "FAIL" "$($assignSize1.status) - $($assignSize1.error | ConvertTo-Json -Compress)" }
}

if ($variant2Id -and $colorKeyId -and $blueValueId) {
    $assignColor2 = Api "POST" "/products/variants/$variant2Id/attributes" @{ attributeKeyId=$colorKeyId; attributeValueId=$blueValueId }
    if ($assignColor2.ok) { Log "POST variant attr (V2=Blue)" "PASS" "Assigned" }
    else { Log "POST variant attr (V2=Blue)" "FAIL" "$($assignColor2.status) - $($assignColor2.error | ConvertTo-Json -Compress)" }
}

if ($variant2Id -and $sizeKeyId -and $size41Id) {
    $assignSize2 = Api "POST" "/products/variants/$variant2Id/attributes" @{ attributeKeyId=$sizeKeyId; attributeValueId=$size41Id }
    if ($assignSize2.ok) { Log "POST variant attr (V2=41)" "PASS" "Assigned" }
    else { Log "POST variant attr (V2=41)" "FAIL" "$($assignSize2.status) - $($assignSize2.error | ConvertTo-Json -Compress)" }
}

# GET /products/variants/:variantId/attributes
if ($variant1Id) {
    $getVAttrs = Api "GET" "/products/variants/$variant1Id/attributes"
    if ($getVAttrs.ok) {
        $vaData = $getVAttrs.data.data; if(!$vaData){$vaData=$getVAttrs.data}
        Log "GET variant attrs" "PASS" "Count: $($vaData.Count)"
    } else { Log "GET variant attrs" "FAIL" "$($getVAttrs.status) - $($getVAttrs.error | ConvertTo-Json -Compress)" }
}

# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== STEP 7: IMAGES ===" -ForegroundColor Cyan

if ($productId) {
    # POST /products/images - Add image by URL
    $createImg = Api "POST" "/products/images" @{ productId=$productId; url="https://example.com/test-product.jpg"; altText="Test product image"; sortOrder=1; isPrimary=$true }
    if ($createImg.ok) {
        $img = $createImg.data.data; if(!$img){$img=$createImg.data}
        $imageId = $img.id
        Log "POST /products/images" "PASS" $imageId
    } else { Log "POST /products/images" "FAIL" "$($createImg.status) - $($createImg.error | ConvertTo-Json -Compress)" }

    # GET /products/:productId/images
    $listImgs = Api "GET" "/products/$productId/images"
    if ($listImgs.ok) {
        $imgData = $listImgs.data.data; if(!$imgData){$imgData=$listImgs.data}
        Log "GET /products/:id/images" "PASS" "Count: $($imgData.Count)"
    } else { Log "GET /products/:id/images" "FAIL" $listImgs.msg }
}

# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== STEP 8: PRODUCT CATEGORIES ===" -ForegroundColor Cyan

if ($productId -and $categoryId) {
    # Create a second category for multi-category test
    $cat2 = Api "POST" "/categories" @{ name="Test Shoes"; slug="test-shoes-$(Get-Random)"; description="Test shoes" }
    $cat2Id = $null
    if ($cat2.ok) { 
        $c2 = $cat2.data.data; if(!$c2){$c2=$cat2.data}; $cat2Id = $c2.id
        Log "Create 2nd category" "PASS" $cat2Id
    }

    # POST /products/:productId/categories/:categoryId
    if ($cat2Id) {
        $assignCat = Api "POST" "/products/$productId/categories/$cat2Id"
        if ($assignCat.ok) { Log "POST product category" "PASS" "Assigned" }
        else { Log "POST product category" "FAIL" "$($assignCat.status) - $($assignCat.error | ConvertTo-Json -Compress)" }
    }

    # GET /products/:productId/categories
    $listProdCats = Api "GET" "/products/$productId/categories"
    if ($listProdCats.ok) {
        $pcData = $listProdCats.data.data; if(!$pcData){$pcData=$listProdCats.data}
        Log "GET product categories" "PASS" "Count: $($pcData.Count)"
    } else { Log "GET product categories" "FAIL" "$($listProdCats.status) - $($listProdCats.error | ConvertTo-Json -Compress)" }
}

# ═══════════════════════════════════════════════════════════════
Write-Host "`n=== STEP 9: DELETE OPERATIONS (cleanup) ===" -ForegroundColor Cyan

# DELETE /products/variants/:variantId/attributes/:keyId
if ($variant1Id -and $sizeKeyId) {
    $delVA = Api "DELETE" "/products/variants/$variant1Id/attributes/$sizeKeyId"
    if ($delVA.ok) { Log "DELETE variant attr" "PASS" "Removed" }
    else { Log "DELETE variant attr" "FAIL" "$($delVA.status) - $($delVA.error | ConvertTo-Json -Compress)" }
}

# DELETE /products/images/:id
if ($imageId) {
    $delImg = Api "DELETE" "/products/images/$imageId"
    if ($delImg.ok) { Log "DELETE /products/images/:id" "PASS" "Deleted" }
    else { Log "DELETE /products/images/:id" "FAIL" "$($delImg.status) - $($delImg.error | ConvertTo-Json -Compress)" }
}

# DELETE /products/variants/:id
if ($variant2Id) {
    $delV2 = Api "DELETE" "/products/variants/$variant2Id"
    if ($delV2.ok) { Log "DELETE /products/variants/:id" "PASS" "Deleted" }
    else { Log "DELETE /products/variants/:id" "FAIL" "$($delV2.status) - $($delV2.error | ConvertTo-Json -Compress)" }
}

# DELETE /products/:productId/categories/:categoryId
if ($productId -and $cat2Id) {
    $delPC = Api "DELETE" "/products/$productId/categories/$cat2Id"
    if ($delPC.ok) { Log "DELETE product category" "PASS" "Removed" }
    else { Log "DELETE product category" "FAIL" "$($delPC.status) - $($delPC.error | ConvertTo-Json -Compress)" }
}

# DELETE /products/attributes/values/:id
if ($blueValueId) {
    $delAV = Api "DELETE" "/products/attributes/values/$blueValueId"
    if ($delAV.ok) { Log "DELETE attr value" "PASS" "Deleted" }
    else { Log "DELETE attr value" "FAIL" "$($delAV.status) - $($delAV.error | ConvertTo-Json -Compress)" }
}

# DELETE /products/attributes/keys/:id
if ($sizeKeyId) {
    $delAK = Api "DELETE" "/products/attributes/keys/$sizeKeyId"
    if ($delAK.ok) { Log "DELETE attr key" "PASS" "Deleted" }
    else { Log "DELETE attr key" "FAIL" "$($delAK.status) - $($delAK.error | ConvertTo-Json -Compress)" }
}

# DELETE /products/:id (delete the test product last)
if ($productId) {
    $delP = Api "DELETE" "/products/$productId"
    if ($delP.ok) { Log "DELETE /products/:id" "PASS" "Deleted" }
    else { Log "DELETE /products/:id" "FAIL" "$($delP.status) - $($delP.error | ConvertTo-Json -Compress)" }
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
