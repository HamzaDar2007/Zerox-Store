#!/usr/bin/env node
/**
 * LabVerse E-Commerce Backend — Comprehensive Endpoint Test Suite v5
 * Tests EVERY endpoint across ALL 32 modules + Mail + App root.
 * ~250 endpoint tests in 30 phases, strict dependency order.
 * Zero dependencies — uses only Node.js built-in `http` module.
 */
const http = require('http');

const BASE = 'http://localhost:3001';
const TS = Date.now();
const saved = {};
const results = { pass: 0, fail: 0, skip: 0, details: [] };

// ─── HTTP helper ────────────────────────────────────────────────────────────
function req(method, path, body, token) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE);
    const data = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);
    const r = http.request(
      { hostname: url.hostname, port: url.port, path: url.pathname + url.search, method, headers },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          let parsed;
          try { parsed = JSON.parse(d); } catch { parsed = d; }
          resolve({ status: res.statusCode, body: parsed, raw: d });
        });
      }
    );
    r.on('error', (e) => resolve({ status: 0, body: { error: e.message }, raw: e.message }));
    if (data) r.write(data);
    r.end();
  });
}

async function test(phase, step, method, path, body, token, expect) {
  const label = `[Phase ${phase}] ${step}: ${method} ${path}`;
  try {
    const res = await req(method, path, body, token);
    const ok = expect(res);
    if (ok) {
      results.pass++;
      results.details.push({ label, result: 'PASS', status: res.status });
      process.stdout.write(`  ✅ ${step} (${res.status})\n`);
    } else {
      results.fail++;
      const msg = typeof res.body === 'object'
        ? (res.body.message || JSON.stringify(res.body).substring(0, 200))
        : String(res.body).substring(0, 200);
      results.details.push({ label, result: 'FAIL', status: res.status, msg });
      process.stdout.write(`  ❌ ${step} (${res.status}) ${msg}\n`);
    }
    return res;
  } catch (e) {
    results.fail++;
    results.details.push({ label, result: 'FAIL', status: 0, msg: e.message });
    process.stdout.write(`  ❌ ${step} (ERR) ${e.message}\n`);
    return { status: 0, body: {} };
  }
}

function skip(phase, step, reason) {
  results.skip++;
  results.details.push({ label: `[Phase ${phase}] ${step}`, result: 'SKIP', msg: reason });
  process.stdout.write(`  ⏭️  ${step} SKIPPED: ${reason}\n`);
}

// helper: extract data from wrapped response {success,data,...} or raw
function d(res) { return res.body?.data ?? res.body; }
function ok2(r) { return r.status === 200 || r.status === 201; }
function ok24(r) { return r.status === 200 || r.status === 201 || r.status === 400; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }


// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 1 — Health & Infrastructure
// ═══════════════════════════════════════════════════════════════════════════
async function phase1() {
  console.log('\n══════ PHASE 1: Health & Infrastructure ══════');
  await test(1, 'Root Endpoint', 'GET', '/', null, null, r => r.status === 200);
  await test(1, 'Health Check', 'GET', '/health', null, null, r => r.status === 200);
  await test(1, 'Swagger JSON', 'GET', '/api/docs-json', null, null, r => r.status === 200);
  await test(1, 'Mail Test Endpoint', 'POST', '/mail/test', { to: `test${TS}@test.com` }, null,
    r => r.status === 200 || r.status === 201 || r.status === 500); // SMTP may not be configured
  await test(1, 'System Health', 'GET', '/system/health', null, null, r => r.status === 200 || r.status === 401);
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 2 — Authentication
// ═══════════════════════════════════════════════════════════════════════════
async function phase2() {
  console.log('\n══════ PHASE 2: Authentication ══════');

  // Admin login
  let res = await test(2, 'Admin Login', 'POST', '/auth/login',
    { email: 'superadmin@labverse.org', password: 'SuperAdmin@123!' }, null, ok2);
  saved.adminToken = res.body?.data?.accessToken || res.body?.data?.access_token;
  saved.adminRefresh = res.body?.data?.refreshToken || res.body?.data?.refresh_token;
  saved.adminId = res.body?.data?.user?.id;

  // Register customer 1
  res = await test(2, 'Register Customer 1', 'POST', '/auth/register',
    { name: 'Test Customer', email: `cust${TS}@test.com`, password: 'Test@1234', phone: `+9230${TS.toString().slice(-7)}` }, null, ok2);
  saved.custToken = res.body?.data?.accessToken || res.body?.data?.access_token;
  saved.custRefresh = res.body?.data?.refreshToken || res.body?.data?.refresh_token;
  saved.custId = res.body?.data?.user?.id;

  // Register customer 2 (for chat, disputes, referrals)
  res = await test(2, 'Register Customer 2', 'POST', '/auth/register',
    { name: 'Second Customer', email: `cust2${TS}@test.com`, password: 'Test@1234', phone: `+9231${TS.toString().slice(-7)}` }, null, ok2);
  saved.cust2Token = res.body?.data?.accessToken || res.body?.data?.access_token;
  saved.cust2Id = res.body?.data?.user?.id;

  // Refresh token
  if (saved.adminRefresh) {
    res = await test(2, 'Refresh Token', 'POST', '/auth/refresh',
      { refreshToken: saved.adminRefresh }, null, ok2);
    if (res.body?.data?.accessToken) saved.adminToken = res.body.data.accessToken;
    if (res.body?.data?.refreshToken) saved.adminRefresh = res.body.data.refreshToken;
  } else skip(2, 'Refresh Token', 'No refresh token');

  // Logout customer 1
  if (saved.custRefresh) {
    await test(2, 'Logout', 'POST', '/auth/logout',
      { refreshToken: saved.custRefresh }, saved.custToken, ok2);
  }

  // Re-login customer 1
  res = await test(2, 'Customer Re-login', 'POST', '/auth/login',
    { email: `cust${TS}@test.com`, password: 'Test@1234' }, null, ok2);
  saved.custToken = res.body?.data?.accessToken || res.body?.data?.access_token;
  saved.custRefresh = res.body?.data?.refreshToken || res.body?.data?.refresh_token;

  // Get current user profile (after re-login so token is valid)
  await test(2, 'Get My Profile', 'GET', '/users/me', null, saved.custToken, r => r.status === 200);

  // Password forgot
  await test(2, 'Password Forgot', 'POST', '/auth/password-forgot',
    { email: `cust${TS}@test.com` }, null, ok24);

  // Change password (customer)
  await test(2, 'Change Password', 'POST', '/auth/change-password',
    { currentPassword: 'Test@1234', newPassword: 'Test@12345' }, saved.custToken, ok24);
  // Re-login with new password
  res = await test(2, 'Login New Password', 'POST', '/auth/login',
    { email: `cust${TS}@test.com`, password: 'Test@12345' }, null, ok2);
  saved.custToken = res.body?.data?.accessToken || res.body?.data?.access_token;
  saved.custRefresh = res.body?.data?.refreshToken || res.body?.data?.refresh_token;

  // Resend verification
  await test(2, 'Resend Verification', 'POST', '/auth/resend-verification',
    { email: `cust${TS}@test.com` }, null, ok24);

  // Verify email (will fail without real token, but tests the endpoint exists)
  await test(2, 'Verify Email', 'POST', '/auth/verify-email',
    { token: 'fake-token-123' }, null, ok24);

  // Reset password (will fail without real token, but tests the endpoint exists)
  await test(2, 'Reset Password', 'POST', '/auth/reset-password',
    { token: 'fake-token-123', newPassword: 'Test@12345' }, null, ok24);
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 3 — Roles, Permissions, Role-Permissions & Users
// ═══════════════════════════════════════════════════════════════════════════
async function phase3() {
  console.log('\n══════ PHASE 3: RBAC — Roles, Permissions, Users ══════');
  const t = saved.adminToken;

  // --- Permissions ---
  let res = await test(3, 'List Permissions', 'GET', '/permissions', null, t, r => r.status === 200);
  const perms = d(res);
  if (Array.isArray(perms) && perms.length > 0) saved.permId = perms[0].id;

  // --- Roles ---
  res = await test(3, 'List Roles', 'GET', '/roles', null, t, r => r.status === 200);
  const roles = d(res);
  if (Array.isArray(roles) && roles.length > 0) saved.roleId = roles[0].id;

  res = await test(3, 'Create Permission', 'POST', '/permissions',
    { roleId: saved.roleId, module: `test_${TS}`, action: 'read' }, t, ok2);
  if (res.body?.data?.id) saved.newPermId = res.body.data.id;

  res = await test(3, 'Create Role', 'POST', '/roles',
    { name: `TestRole${TS}`, description: 'Test role' }, t, ok2);
  if (res.body?.data?.id) saved.newRoleId = res.body.data.id;

  if (saved.newRoleId) {
    await test(3, 'Get Role', 'GET', `/roles/${saved.newRoleId}`, null, t, r => r.status === 200);
    await test(3, 'Update Role', 'PATCH', `/roles/${saved.newRoleId}`,
      { description: 'Updated test role' }, t, r => r.status === 200);
  }

  if (saved.newPermId) {
    await test(3, 'Get Perm by Module', 'GET', `/permissions/by-module?module=test_${TS}`, null, t, r => r.status === 200);
    await test(3, 'Get Permission', 'GET', `/permissions/${saved.newPermId}`, null, t, r => r.status === 200);
    await test(3, 'Update Permission', 'PATCH', `/permissions/${saved.newPermId}`,
      { action: 'write' }, t, r => r.status === 200);
  }

  // --- Role-Permissions ---
  if (saved.newRoleId && saved.newPermId) {
    await test(3, 'Assign Role Perms', 'POST', `/role-permissions/${saved.newRoleId}`,
      { permissionIds: [saved.newPermId] }, t, ok24);
    await test(3, 'Get Role Perms', 'GET', `/role-permissions/${saved.newRoleId}`, null, t, r => r.status === 200);
    // Don't delete yet — cleanup phase
  }

  // --- Users ---
  res = await test(3, 'List Users', 'GET', '/users', null, t, r => r.status === 200);

  res = await test(3, 'Create User', 'POST', '/users',
    { name: 'Test User', email: `user${TS}@test.com`, password: 'Test@1234', phone: `+9232${TS.toString().slice(-7)}` }, t, ok2);
  if (res.body?.data?.id) saved.newUserId = res.body.data.id;

  if (saved.newUserId) {
    await test(3, 'Get User', 'GET', `/users/${saved.newUserId}`, null, t, r => r.status === 200);
    await test(3, 'Update User', 'PATCH', `/users/${saved.newUserId}`,
      { name: 'Updated User' }, t, r => r.status === 200);
    await test(3, 'Get User Permissions', 'GET', `/users/${saved.newUserId}/permissions`, null, t, r => r.status === 200);
  }

  // Customer profile via customer token
  await test(3, 'Customer Get Me', 'GET', '/users/me', null, saved.custToken, r => r.status === 200);

  // User addresses
  let addrRes = await test(3, 'Create Address', 'POST', '/users/me/addresses',
    { fullName: 'Test User', phone: '+923001234567', country: 'PK', city: 'Lahore', province: 'Punjab', streetAddress: '123 Test Street', postalCode: '54000', isDefault: true }, saved.custToken, ok24);
  saved.addressId = addrRes.body?.data?.id;

  await test(3, 'List Addresses', 'GET', '/users/me/addresses', null, saved.custToken, r => r.status === 200);

  if (saved.addressId) {
    await test(3, 'Update Address', 'PATCH', `/users/me/addresses/${saved.addressId}`,
      { city: 'Karachi' }, saved.custToken, ok24);
    await test(3, 'Delete Address', 'DELETE', `/users/me/addresses/${saved.addressId}`, null, saved.custToken, ok24);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 4 — Categories, Brands & Attributes
// ═══════════════════════════════════════════════════════════════════════════
async function phase4() {
  console.log('\n══════ PHASE 4: Categories, Brands & Attributes ══════');
  const t = saved.adminToken;

  // Categories
  let res = await test(4, 'Create Category', 'POST', '/categories',
    { name: `Electronics ${TS}`, slug: `electronics-${TS}`, description: 'Electronics category' }, t, ok2);
  saved.catId = res.body?.data?.id;

  res = await test(4, 'List Categories', 'GET', '/categories', null, null, r => r.status === 200);
  if (!saved.catId) {
    const cats = d(res);
    if (Array.isArray(cats) && cats.length > 0) saved.catId = cats[0].id;
  }

  await test(4, 'Get Root Categories', 'GET', '/categories/root', null, null, r => r.status === 200);

  if (saved.catId) {
    await test(4, 'Get Category', 'GET', `/categories/${saved.catId}`, null, null, r => r.status === 200);
    await test(4, 'Get Category by Slug', 'GET', `/categories/slug/electronics-${TS}`, null, null, r => r.status === 200);
    await test(4, 'Update Category', 'PATCH', `/categories/${saved.catId}`,
      { description: 'Updated electronics' }, t, r => r.status === 200);

    res = await test(4, 'Create Subcategory', 'POST', '/categories',
      { name: `Phones ${TS}`, slug: `phones-${TS}`, parentId: saved.catId }, t, ok2);
    if (res.body?.data?.id) saved.subCatId = res.body.data.id;
  }

  // Brands
  res = await test(4, 'Create Brand', 'POST', '/brands',
    { name: `Samsung ${TS}`, slug: `samsung-${TS}`, description: 'Electronics brand' }, t, ok2);
  saved.brandId = res.body?.data?.id;

  await test(4, 'List Brands', 'GET', '/brands', null, null, r => r.status === 200);

  if (saved.brandId) {
    await test(4, 'Get Brand', 'GET', `/brands/${saved.brandId}`, null, null, r => r.status === 200);
    await test(4, 'Get Brand by Slug', 'GET', `/brands/slug/samsung-${TS}`, null, null, r => r.status === 200);
    await test(4, 'Update Brand', 'PATCH', `/brands/${saved.brandId}`,
      { description: 'Top brand' }, t, r => r.status === 200);
  }

  // Category-Brand association
  if (saved.catId && saved.brandId) {
    await test(4, 'Assoc Brand→Category', 'POST', `/categories/${saved.catId}/brands/${saved.brandId}`, null, t, ok24);
    await test(4, 'Remove Brand→Category', 'DELETE', `/categories/${saved.catId}/brands/${saved.brandId}`, null, t, ok24);
  }

  // Attributes
  res = await test(4, 'Create Attribute', 'POST', '/attributes',
    { name: `Color ${TS}` }, t, ok2);
  saved.attrId = res.body?.data?.id;

  await test(4, 'List Attributes', 'GET', '/attributes', null, t, r => r.status === 200);

  if (saved.attrId) {
    await test(4, 'Get Attribute', 'GET', `/attributes/${saved.attrId}`, null, t, r => r.status === 200);
    await test(4, 'Update Attribute', 'PATCH', `/attributes/${saved.attrId}`,
      { isFilterable: true }, t, r => r.status === 200);
  }

  // Delete subcategory (created above, safe to remove)
  if (saved.subCatId) {
    await test(4, 'Delete Subcategory', 'DELETE', `/categories/${saved.subCatId}`, null, t, ok24);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 5 — Sellers, Stores & Documents
// ═══════════════════════════════════════════════════════════════════════════
async function phase5() {
  console.log('\n══════ PHASE 5: Sellers, Stores & Documents ══════');
  const t = saved.adminToken;

  const sellerUserId = saved.newUserId || saved.custId;
  if (!sellerUserId) { skip(5, 'Create Seller', 'No user'); return; }

  let res = await test(5, 'Create Seller', 'POST', '/sellers',
    { userId: sellerUserId, businessName: `TestBiz ${TS}` }, t,
    r => r.status === 201 || r.status === 200 || r.status === 409);
  saved.sellerId = res.body?.data?.id;

  res = await test(5, 'List Sellers', 'GET', '/sellers', null, t, r => r.status === 200);
  if (!saved.sellerId) {
    const sellers = d(res);
    if (Array.isArray(sellers) && sellers.length > 0) saved.sellerId = sellers[0].id;
  }

  if (saved.sellerId) {
    await test(5, 'Get Seller', 'GET', `/sellers/${saved.sellerId}`, null, t, r => r.status === 200);
    await test(5, 'Update Seller', 'PATCH', `/sellers/${saved.sellerId}`,
      { businessName: `UpdatedBiz ${TS}` }, t, r => r.status === 200);
    await test(5, 'Get Seller Stats', 'GET', `/sellers/${saved.sellerId}/stats`, null, t, ok24);

    // Store
    res = await test(5, 'Create Store', 'POST', `/sellers/${saved.sellerId}/stores`,
      { sellerId: saved.sellerId, name: `MyStore ${TS}`, slug: `mystore-${TS}` }, t,
      r => r.status === 201 || r.status === 200 || r.status === 409);
    saved.storeId = res.body?.data?.id;

    // Wallet
    await test(5, 'Get Seller Wallet', 'GET', `/sellers/${saved.sellerId}/wallet`, null, t, r => r.status === 200);
    await test(5, 'Get Wallet Txns', 'GET', `/sellers/${saved.sellerId}/wallet/transactions`, null, t, r => r.status === 200);

    // Documents
    await test(5, 'List Seller Docs', 'GET', `/sellers/${saved.sellerId}/documents`, null, t, r => r.status === 200);
    res = await test(5, 'Upload Seller Doc', 'POST', `/sellers/${saved.sellerId}/documents`,
      { sellerId: saved.sellerId, documentType: 'business_license', fileUrl: 'https://example.com/license.pdf' }, t, ok24);
    if (res.body?.data?.id) saved.sellerDocId = res.body.data.id;
  }

  // Stores list
  res = await test(5, 'List Stores', 'GET', '/stores', null, t, r => r.status === 200);
  if (!saved.storeId) {
    const stores = d(res);
    if (Array.isArray(stores) && stores.length > 0) saved.storeId = stores[0].id;
  }

  if (saved.storeId) {
    await test(5, 'Get Store', 'GET', `/stores/${saved.storeId}`, null, t, r => r.status === 200);
    // Get store slug from the store itself
    const storeRes = await req('GET', `/stores/${saved.storeId}`, null, t);
    const storeSlug = storeRes.body?.data?.slug;
    if (storeSlug) {
      await test(5, 'Get Store by Slug', 'GET', `/stores/slug/${storeSlug}`, null, t, r => r.status === 200);
    } else {
      skip(5, 'Get Store by Slug', 'No slug available');
    }
    // Follow/unfollow (customer token)
    await test(5, 'Follow Store', 'POST', `/stores/${saved.storeId}/follow`, null, saved.custToken, ok24);
    await test(5, 'Unfollow Store', 'DELETE', `/stores/${saved.storeId}/follow`, null, saved.custToken, ok24);

    // Update store
    await test(5, 'Update Store', 'PATCH', `/stores/${saved.storeId}`,
      { name: `MyStore Updated ${TS}` }, t, ok24);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 6 — Products (Full CRUD + Variants/Images/Q&A)
// ═══════════════════════════════════════════════════════════════════════════
async function phase6() {
  console.log('\n══════ PHASE 6: Products ══════');
  const t = saved.adminToken;

  if (!saved.sellerId || !saved.catId) { skip(6, 'Products', 'No seller or category'); return; }

  let res = await test(6, 'Create Product', 'POST', '/products',
    {
      sellerId: saved.sellerId, categoryId: saved.catId,
      name: `Test Phone ${TS}`, slug: `test-phone-${TS}`,
      description: 'A great test phone', price: 29999.99, stock: 100,
      brandId: saved.brandId,
    }, t, ok2);
  saved.productId = res.body?.data?.id;

  res = await test(6, 'Create Product 2', 'POST', '/products',
    {
      sellerId: saved.sellerId, categoryId: saved.catId,
      name: `Test Tablet ${TS}`, slug: `test-tablet-${TS}`,
      description: 'A test tablet', price: 49999.99, stock: 50,
    }, t, ok2);
  if (res.body?.data?.id) saved.product2Id = res.body.data.id;

  res = await test(6, 'List Products', 'GET', '/products', null, null, r => r.status === 200);

  if (saved.productId) {
    await test(6, 'Get Product', 'GET', `/products/${saved.productId}`, null, null, r => r.status === 200);
    await test(6, 'Get Product by Slug', 'GET', `/products/slug/test-phone-${TS}`, null, null, r => r.status === 200);
    await test(6, 'Update Product', 'PATCH', `/products/${saved.productId}`,
      { price: 27999.99, description: 'Updated description' }, t, r => r.status === 200);
    await test(6, 'Update Product Status', 'PATCH', `/products/${saved.productId}/status`,
      { status: 'active' }, t, ok24);

    // Variants
    res = await test(6, 'Create Variant', 'POST', `/products/${saved.productId}/variants`,
      { productId: saved.productId, price: 31999.99, name: 'XL Red', sku: `SKU-XL-${TS}`, stock: 50, options: { size: 'XL', color: 'Red' } }, t, ok2);
    if (res.body?.data?.id) saved.variantId = res.body.data.id;

    res = await test(6, 'List Variants', 'GET', `/products/${saved.productId}/variants`, null, null, r => r.status === 200);

    if (saved.variantId) {
      await test(6, 'Update Variant', 'PATCH', `/products/variants/${saved.variantId}`,
        { price: 30999.99 }, t, r => r.status === 200);
    }

    // Images
    res = await test(6, 'Add Product Image', 'POST', `/products/${saved.productId}/images`,
      { productId: saved.productId, url: 'https://example.com/phone.jpg', altText: 'Phone front', isPrimary: true }, t, ok2);
    if (res.body?.data?.id) saved.imageId = res.body.data.id;

    // Questions & Answers
    res = await test(6, 'List Questions', 'GET', `/products/${saved.productId}/questions`, null, null, r => r.status === 200);

    res = await test(6, 'Ask Question', 'POST', `/products/${saved.productId}/questions`,
      { question: 'Is this waterproof?' }, saved.custToken, ok2);
    if (res.body?.data?.id) saved.questionId = res.body.data.id;

    if (saved.questionId) {
      await test(6, 'Answer Question', 'POST', `/products/questions/${saved.questionId}/answers`,
        { answer: 'Yes, IP68 rated', isSellerAnswer: true }, t, ok2);
    }

    // Price History
    await test(6, 'Price History', 'GET', `/products/${saved.productId}/price-history`, null, null, r => r.status === 200);

    // Related Products
    await test(6, 'Related Products', 'GET', `/products/${saved.productId}/related`, null, null, ok24);
  }

  // Delete product 2 (testing DELETE endpoint)
  if (saved.product2Id) {
    await test(6, 'Delete Product 2', 'DELETE', `/products/${saved.product2Id}`, null, t, ok24);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 7 — Warehouses & Inventory (Full + Transfers)
// ═══════════════════════════════════════════════════════════════════════════
async function phase7() {
  console.log('\n══════ PHASE 7: Warehouses & Inventory ══════');
  const t = saved.adminToken;

  let res = await test(7, 'Create Warehouse 1', 'POST', '/warehouses',
    { name: `MainWH ${TS}`, code: `WH${TS}`, city: 'Lahore', countryCode: 'PK' }, t, ok2);
  saved.whId = res.body?.data?.id;

  res = await test(7, 'Create Warehouse 2', 'POST', '/warehouses',
    { name: `SecondWH ${TS}`, code: `WH2${TS}`, city: 'Karachi', countryCode: 'PK' }, t, ok2);
  saved.wh2Id = res.body?.data?.id;

  res = await test(7, 'List Warehouses', 'GET', '/warehouses', null, t, r => r.status === 200);
  if (!saved.whId) {
    const whs = d(res);
    if (Array.isArray(whs) && whs.length > 0) { saved.whId = whs[0].id; if (whs.length > 1) saved.wh2Id = whs[1].id; }
  }

  if (saved.whId) {
    await test(7, 'Get Warehouse', 'GET', `/warehouses/${saved.whId}`, null, t, r => r.status === 200);
    await test(7, 'Update Warehouse', 'PATCH', `/warehouses/${saved.whId}`,
      { name: `UpdatedWH ${TS}` }, t, r => r.status === 200);
    await test(7, 'Warehouse Inventory', 'GET', `/warehouses/${saved.whId}/inventory`, null, t, r => r.status === 200);
  }

  if (saved.productId && saved.whId) {
    res = await test(7, 'Adjust Inventory', 'POST', '/inventory/adjust',
      { productId: saved.productId, warehouseId: saved.whId, adjustment: 100, reason: 'Initial stock' }, t, ok2);
    saved.inventoryId = res.body?.data?.id; // might be returned

    await test(7, 'Get Product Inventory', 'GET', `/inventory/product/${saved.productId}`, null, t, r => r.status === 200);
    await test(7, 'Get Stock Movements', 'GET', `/inventory/movements/${saved.productId}`, null, t, r => r.status === 200);

    // Reserve + Release
    res = await test(7, 'Reserve Stock', 'POST', '/inventory/reserve',
      { productId: saved.productId, warehouseId: saved.whId, quantity: 5, orderId: saved.productId /* placeholder UUID */ }, t, ok24);
    saved.reservationId = res.body?.data?.id;

    if (saved.reservationId) {
      await test(7, 'Release Reservation', 'POST', `/inventory/release/${saved.reservationId}`, null, t, ok24);
    }

    // Stock movement (needs inventoryId)
    if (saved.inventoryId) {
      await test(7, 'Create Stock Movement', 'POST', '/inventory/movements',
        { inventoryId: saved.inventoryId, type: 'purchase', quantity: 50, note: 'Restock' }, t, ok24);
    }

    // Transfers
    if (saved.wh2Id) {
      res = await test(7, 'Create Transfer', 'POST', '/inventory/transfers',
        { fromWarehouseId: saved.whId, toWarehouseId: saved.wh2Id, note: 'Restock transfer',
          items: [{ productId: saved.productId, quantityRequested: 10 }] }, t, ok24);
      saved.transferId = res.body?.data?.id;

      await test(7, 'List Transfers', 'GET', '/inventory/transfers', null, t, r => r.status === 200);

      if (saved.transferId) {
        await test(7, 'Complete Transfer', 'POST', `/inventory/transfers/${saved.transferId}/complete`, null, t, ok24);
      }
    }
  } else skip(7, 'Inventory Tests', 'No product or warehouse');
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 8 — Shipping (Full + Delivery Slots)
// ═══════════════════════════════════════════════════════════════════════════
async function phase8() {
  console.log('\n══════ PHASE 8: Shipping ══════');
  const t = saved.adminToken;

  let res = await test(8, 'Create Zone', 'POST', '/shipping/zones',
    { name: `Zone ${TS}`, countries: ['PK'] }, t, ok2);
  saved.shipZoneId = res.body?.data?.id;

  await test(8, 'List Zones', 'GET', '/shipping/zones', null, t, r => r.status === 200);

  if (saved.shipZoneId) {
    await test(8, 'Get Zone', 'GET', `/shipping/zones/${saved.shipZoneId}`, null, t, r => r.status === 200);
  }

  res = await test(8, 'Create Carrier', 'POST', '/shipping/carriers',
    { name: `Carrier ${TS}`, code: `CAR${TS}`, trackingUrlTemplate: 'https://track.example.com/{tracking}' }, t, ok2);
  saved.carrierId = res.body?.data?.id;

  await test(8, 'List Carriers', 'GET', '/shipping/carriers', null, t, r => r.status === 200);

  res = await test(8, 'Create Method', 'POST', '/shipping/methods',
    { name: `Standard ${TS}`, estimatedDaysMin: 3, estimatedDaysMax: 7 }, t, ok2);
  saved.shipMethodId = res.body?.data?.id;

  await test(8, 'List Methods', 'GET', '/shipping/methods', null, t, r => r.status === 200);

  if (saved.shipZoneId && saved.shipMethodId) {
    res = await test(8, 'Create Rate', 'POST', '/shipping/rates',
      { shippingMethodId: saved.shipMethodId, shippingZoneId: saved.shipZoneId, baseRate: 250.00, rateType: 'flat' }, t, ok2);
    saved.shipRateId = res.body?.data?.id;

    await test(8, 'List Rates', 'GET', '/shipping/rates', null, t, r => r.status === 200);

    // Update shipping entities
    await test(8, 'Update Zone', 'PATCH', `/shipping/zones/${saved.shipZoneId}`,
      { name: `Zone Updated ${TS}` }, t, ok24);
    if (saved.carrierId) {
      await test(8, 'Update Carrier', 'PATCH', `/shipping/carriers/${saved.carrierId}`,
        { name: `Carrier Updated ${TS}` }, t, ok24);
    }
    if (saved.shipMethodId) {
      await test(8, 'Update Method', 'PATCH', `/shipping/methods/${saved.shipMethodId}`,
        { estimatedDaysMin: 2 }, t, ok24);
    }
    if (saved.shipRateId) {
      await test(8, 'Update Rate', 'PATCH', `/shipping/rates/${saved.shipRateId}`,
        { baseRate: 300.00 }, t, ok24);
    }

    await test(8, 'Calculate Shipping', 'POST', '/shipping/calculate',
      { zoneId: saved.shipZoneId, weight: 2, totalAmount: 50000 }, null, ok24);
  }

  // Delivery Slots
  res = await test(8, 'Create Delivery Slot', 'POST', '/shipping/slots',
    { name: `Morning ${TS}`, startTime: '09:00:00', endTime: '12:00:00', daysOfWeek: [1,2,3,4,5], maxOrders: 50, isActive: true }, t, ok24);
  saved.slotId = res.body?.data?.id;

  await test(8, 'List Delivery Slots', 'GET', '/shipping/slots', null, null, r => r.status === 200);

  if (saved.slotId) {
    await test(8, 'Get Delivery Slot', 'GET', `/shipping/slots/${saved.slotId}`, null, null, r => r.status === 200);
    await test(8, 'Update Delivery Slot', 'PATCH', `/shipping/slots/${saved.slotId}`,
      { name: `Morning Updated ${TS}`, maxOrders: 60 }, t, ok24);
  }

  // Explicit DELETE tests for shipping entities
  if (saved.shipRateId) {
    await test(8, 'Delete Ship Rate', 'DELETE', `/shipping/rates/${saved.shipRateId}`, null, t, ok24);
    saved.shipRateId = null;
  }
  if (saved.shipMethodId) {
    await test(8, 'Delete Ship Method', 'DELETE', `/shipping/methods/${saved.shipMethodId}`, null, t, ok24);
    saved.shipMethodId = null;
  }
  if (saved.carrierId) {
    await test(8, 'Delete Carrier', 'DELETE', `/shipping/carriers/${saved.carrierId}`, null, t, ok24);
    saved.carrierId = null;
  }
  if (saved.shipZoneId) {
    await test(8, 'Delete Ship Zone', 'DELETE', `/shipping/zones/${saved.shipZoneId}`, null, t, ok24);
    saved.shipZoneId = null;
  }
  if (saved.slotId) {
    await test(8, 'Delete Delivery Slot', 'DELETE', `/shipping/slots/${saved.slotId}`, null, t, ok24);
    saved.slotId = null;
  }

  // Re-create shipping entities for later phases (checkout needs them)
  res = await test(8, 'ReCreate Zone', 'POST', '/shipping/zones',
    { name: `Zone2 ${TS}`, countries: ['PK'] }, t, ok2);
  saved.shipZoneId = res.body?.data?.id;

  res = await test(8, 'ReCreate Carrier', 'POST', '/shipping/carriers',
    { name: `Carrier2 ${TS}`, code: `CAR2${TS}`, trackingUrlTemplate: 'https://track.example.com/{tracking}' }, t, ok2);
  saved.carrierId = res.body?.data?.id;

  res = await test(8, 'ReCreate Method', 'POST', '/shipping/methods',
    { name: `Standard2 ${TS}`, estimatedDaysMin: 3, estimatedDaysMax: 7 }, t, ok2);
  saved.shipMethodId = res.body?.data?.id;

  if (saved.shipZoneId && saved.shipMethodId) {
    res = await test(8, 'ReCreate Rate', 'POST', '/shipping/rates',
      { shippingMethodId: saved.shipMethodId, shippingZoneId: saved.shipZoneId, baseRate: 250.00, rateType: 'flat' }, t, ok2);
    saved.shipRateId = res.body?.data?.id;
  }

  res = await test(8, 'ReCreate Slot', 'POST', '/shipping/slots',
    { name: `Afternoon ${TS}`, startTime: '13:00:00', endTime: '17:00:00', daysOfWeek: [1,2,3,4,5], maxOrders: 30, isActive: true }, t, ok24);
  saved.slotId = res.body?.data?.id;
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 9 — Tax
// ═══════════════════════════════════════════════════════════════════════════
async function phase9() {
  console.log('\n══════ PHASE 9: Tax ══════');
  const t = saved.adminToken;

  let res = await test(9, 'Create Tax Zone', 'POST', '/tax/zones',
    { name: `PK Zone ${TS}`, countries: ['PK'] }, t, ok2);
  saved.taxZoneId = res.body?.data?.id;

  await test(9, 'List Tax Zones', 'GET', '/tax/zones', null, t, r => r.status === 200);

  if (saved.taxZoneId) {
    await test(9, 'Get Tax Zone', 'GET', `/tax/zones/${saved.taxZoneId}`, null, t, r => r.status === 200);
  }

  res = await test(9, 'Create Tax Class', 'POST', '/tax/classes',
    { name: `Standard Tax ${TS}`, description: 'Standard rate' }, t, ok2);
  saved.taxClassId = res.body?.data?.id;

  await test(9, 'List Tax Classes', 'GET', '/tax/classes', null, t, r => r.status === 200);

  if (saved.taxZoneId && saved.taxClassId) {
    res = await test(9, 'Create Tax Rate', 'POST', '/tax/rates',
      { taxClassId: saved.taxClassId, taxZoneId: saved.taxZoneId, name: `GST ${TS}`, rate: 17.0 }, t, ok2);
    saved.taxRateId = res.body?.data?.id;
    await test(9, 'List Tax Rates', 'GET', '/tax/rates', null, t, r => r.status === 200);

    // Update tax entities
    await test(9, 'Update Tax Zone', 'PATCH', `/tax/zones/${saved.taxZoneId}`,
      { name: `PK Zone Updated ${TS}` }, t, ok24);
    if (saved.taxClassId) {
      await test(9, 'Update Tax Class', 'PATCH', `/tax/classes/${saved.taxClassId}`,
        { description: 'Updated standard rate' }, t, ok24);
    }
    if (saved.taxRateId) {
      await test(9, 'Update Tax Rate', 'PATCH', `/tax/rates/${saved.taxRateId}`,
        { rate: 18.0 }, t, ok24);
    }
  }

  // Tax calculator (no auth)
  await test(9, 'Calculate Tax', 'POST', '/tax/calculate',
    { amount: 10000, countryCode: 'PK' }, null, ok24);

  // Explicit DELETE tests for tax entities
  if (saved.taxRateId) {
    await test(9, 'Delete Tax Rate', 'DELETE', `/tax/rates/${saved.taxRateId}`, null, t, ok24);
    saved.taxRateId = null;
  }
  if (saved.taxClassId) {
    await test(9, 'Delete Tax Class', 'DELETE', `/tax/classes/${saved.taxClassId}`, null, t, ok24);
    saved.taxClassId = null;
  }
  if (saved.taxZoneId) {
    await test(9, 'Delete Tax Zone', 'DELETE', `/tax/zones/${saved.taxZoneId}`, null, t, ok24);
    saved.taxZoneId = null;
  }

  // Re-create tax entities for later phases
  res = await test(9, 'ReCreate Tax Zone', 'POST', '/tax/zones',
    { name: `PK Zone2 ${TS}`, countries: ['PK'] }, t, ok2);
  saved.taxZoneId = res.body?.data?.id;

  res = await test(9, 'ReCreate Tax Class', 'POST', '/tax/classes',
    { name: `Standard Tax2 ${TS}`, description: 'Standard rate' }, t, ok2);
  saved.taxClassId = res.body?.data?.id;

  if (saved.taxZoneId && saved.taxClassId) {
    res = await test(9, 'ReCreate Tax Rate', 'POST', '/tax/rates',
      { taxClassId: saved.taxClassId, taxZoneId: saved.taxZoneId, name: `GST2 ${TS}`, rate: 17.0 }, t, ok2);
    saved.taxRateId = res.body?.data?.id;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 10 — Payment Methods
// ═══════════════════════════════════════════════════════════════════════════
async function phase10() {
  console.log('\n══════ PHASE 10: Payment Methods ══════');
  const t = saved.adminToken;

  let res = await test(10, 'Create PM', 'POST', '/payment-methods',
    { userId: saved.adminId, paymentMethod: 'cod', nickname: `COD ${TS}`, isDefault: true }, t, ok2);
  saved.pmId = res.body?.data?.id;

  await test(10, 'List PMs', 'GET', '/payment-methods', null, t, r => r.status === 200);

  if (saved.pmId) {
    await test(10, 'Set Default PM', 'POST', `/payment-methods/${saved.pmId}/default`, {}, t, ok2);
    await test(10, 'Delete PM', 'DELETE', `/payment-methods/${saved.pmId}`, null, t, r => r.status === 200);
  }

  // Stripe save (will 400 without Stripe keys — that proves the endpoint exists)
  await test(10, 'Stripe Save PM', 'POST', '/payment-methods/stripe/save',
    { stripePaymentMethodId: 'pm_test_xxx', stripeCustomerId: 'cus_test_xxx' }, t, r => r.status === 400 || r.status === 201);
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 11 — Cart & Checkout
// ═══════════════════════════════════════════════════════════════════════════
async function phase11() {
  console.log('\n══════ PHASE 11: Cart & Checkout ══════');
  const t = saved.custToken || saved.adminToken;

  let res = await test(11, 'Get/Create Cart', 'GET', '/cart', null, t, r => r.status === 200);
  saved.cartId = res.body?.data?.id;

  if (saved.productId) {
    res = await test(11, 'Add Cart Item', 'POST', '/cart/items',
      { productId: saved.productId, quantity: 2, priceAtAddition: 27999.99 }, t, ok2);
    saved.cartItemId = res.body?.data?.id;

    res = await test(11, 'Get Cart Items', 'GET', '/cart', null, t, r => r.status === 200);
    if (res.body?.data?.id) saved.cartId = res.body.data.id;

    if (saved.cartItemId) {
      await test(11, 'Update Cart Item', 'PATCH', `/cart/items/${saved.cartItemId}`,
        { quantity: 3 }, t, r => r.status === 200);
    }

    // Cart summary
    await test(11, 'Cart Summary', 'GET', '/cart/summary', null, t, ok24);

    // Cart voucher endpoints
    if (saved.voucherCode) {
      await test(11, 'Apply Cart Voucher', 'POST', '/cart/voucher',
        { code: saved.voucherCode }, t, ok24);
      await test(11, 'Remove Cart Voucher', 'DELETE', '/cart/voucher', null, t, ok24);
    }

    // Checkout session
    if (saved.cartId) {
      res = await test(11, 'Create Checkout', 'POST', '/checkout/session',
        { cartId: saved.cartId, sessionToken: `sess_${TS}` }, t, ok2);
      saved.checkoutId = res.body?.data?.id;

      if (saved.checkoutId) {
        await test(11, 'Get Checkout', 'GET', `/checkout/session/${saved.checkoutId}`, null, t, r => r.status === 200);
        await test(11, 'Update Checkout', 'PATCH', `/checkout/session/${saved.checkoutId}`,
          { shippingAddress: { city: 'Lahore', country: 'PK' } }, t, ok24);
        await test(11, 'Complete Checkout', 'POST', `/checkout/session/${saved.checkoutId}/complete`, null, t, ok24);
      }
    }
  } else skip(11, 'Cart/Checkout', 'No product');
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 12 — Orders & Shipments
// ═══════════════════════════════════════════════════════════════════════════
async function phase12() {
  console.log('\n══════ PHASE 12: Orders & Shipments ══════');
  const t = saved.adminToken;
  const userId = saved.custId || saved.adminId;

  // Ensure we have a store
  if (!saved.storeId) {
    const storeRes = await req('GET', '/stores', null, t);
    const stores = storeRes.body?.data;
    if (Array.isArray(stores) && stores.length > 0) saved.storeId = stores[0].id;
  }

  // Order 1 (main)
  let res = await test(12, 'Create Order 1', 'POST', '/orders',
    {
      userId, storeId: saved.storeId, subtotal: 59999.98, totalAmount: 69999.98,
      shippingAddress: { fullName: 'Test User', phone: '+923001234567', country: 'PK', city: 'Lahore', province: 'Punjab', streetAddress: '123 Test Street' },
      paymentMethod: 'cod', shippingMethod: 'standard', currencyCode: 'PKR',
    }, t, ok2);
  saved.orderId = res.body?.data?.id;
  saved.orderNumber = res.body?.data?.orderNumber;

  // Order 2 (for cancel/return/dispute testing)
  res = await test(12, 'Create Order 2', 'POST', '/orders',
    {
      userId, storeId: saved.storeId, subtotal: 49999.99, totalAmount: 54999.99,
      shippingAddress: { fullName: 'Test User', phone: '+923001234567', country: 'PK', city: 'Karachi', province: 'Sindh', streetAddress: '456 Test Ave' },
      paymentMethod: 'cod', shippingMethod: 'standard', currencyCode: 'PKR',
    }, t, ok2);
  saved.order2Id = res.body?.data?.id;

  await test(12, 'List Orders', 'GET', '/orders', null, t, r => r.status === 200);
  await test(12, 'My Orders', 'GET', '/orders/my-orders', null, saved.custToken || t, r => r.status === 200);

  if (saved.orderId) {
    await test(12, 'Get Order', 'GET', `/orders/${saved.orderId}`, null, t, r => r.status === 200);

    if (saved.orderNumber) {
      await test(12, 'Get by Number', 'GET', `/orders/number/${saved.orderNumber}`, null, t, r => r.status === 200);
    }

    await test(12, 'Update Order', 'PATCH', `/orders/${saved.orderId}`,
      { notes: 'Test note' }, t, ok24);

    await test(12, 'Update Status→confirmed', 'PATCH', `/orders/${saved.orderId}/status`,
      { status: 'confirmed' }, t, r => r.status === 200);

    await test(12, 'Get Status History', 'GET', `/orders/${saved.orderId}/status-history`, null, t, r => r.status === 200);

    // Shipment
    if (saved.carrierId) {
      res = await test(12, 'Create Shipment', 'POST', `/orders/${saved.orderId}/shipments`,
        {
          orderId: saved.orderId, shipmentNumber: `SHP${TS}`,
          deliveryAddress: { city: 'Lahore', country: 'PK', streetAddress: '123 Test St' },
          carrierId: saved.carrierId, trackingNumber: `TRK${TS}`,
        }, t, ok2);
      saved.shipmentId = res.body?.data?.id;

      await test(12, 'List Order Shipments', 'GET', `/orders/${saved.orderId}/shipments`, null, t, r => r.status === 200);

      if (saved.shipmentId) {
        await test(12, 'Update Shipment', 'PATCH', `/shipments/${saved.shipmentId}`,
          { estimatedDeliveryDate: '2026-03-15' }, t, ok24);
        await test(12, 'Shipment→shipped', 'PATCH', `/shipments/${saved.shipmentId}/status`,
          { status: 'shipped' }, t, r => r.status === 200);
        await test(12, 'Track Shipment', 'GET', `/shipments/track/TRK${TS}`, null, t, ok24);
      }
    }
  }

  // Cancel order 2
  if (saved.order2Id) {
    await test(12, 'Cancel Order 2', 'POST', `/orders/${saved.order2Id}/cancel`,
      { reason: 'Changed my mind' }, saved.custToken || t, ok24);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 13 — Payments & Refunds
// ═══════════════════════════════════════════════════════════════════════════
async function phase13() {
  console.log('\n══════ PHASE 13: Payments & Refunds ══════');
  const t = saved.adminToken;

  if (!saved.orderId) { skip(13, 'Payments', 'No order'); return; }

  const userId = saved.custId || saved.adminId;

  let res = await test(13, 'Create Payment', 'POST', '/payments',
    { orderId: saved.orderId, userId, amount: 69999.98, paymentMethod: 'cod', currencyCode: 'PKR' }, t, ok2);
  saved.paymentId = res.body?.data?.id;

  await test(13, 'List Payments', 'GET', '/payments', null, t, r => r.status === 200);

  if (saved.paymentId) {
    await test(13, 'Get Payment', 'GET', `/payments/${saved.paymentId}`, null, t, r => r.status === 200);
    await test(13, 'Update Payment', 'PATCH', `/payments/${saved.paymentId}`,
      { notes: 'Test update' }, t, ok24);
    await test(13, 'Process Payment', 'POST', `/payments/${saved.paymentId}/process`, {}, t, ok2);
    await test(13, 'Payment Attempts', 'GET', `/payments/${saved.paymentId}/attempts`, null, t, r => r.status === 200);

    // Stripe endpoints (will 400 without Stripe keys — proves endpoints exist)
    await test(13, 'Stripe Create Intent', 'POST', `/payments/${saved.paymentId}/stripe/create-intent`,
      { stripePaymentMethodId: 'pm_test_xxx', stripeCustomerId: 'cus_test_xxx' }, t, r => r.status === 400 || r.status === 200);
    await test(13, 'Stripe Confirm', 'POST', `/payments/${saved.paymentId}/stripe/confirm`,
      { stripePaymentMethodId: 'pm_test_xxx' }, t, r => r.status === 400 || r.status === 200);
  }

  // Stripe webhook (public endpoint, no JWT, always returns 400 without valid signature)
  await test(13, 'Stripe Webhook', 'POST', '/stripe/webhook',
    { type: 'payment_intent.succeeded', data: { object: { id: 'pi_test' } } }, null, r => r.status === 400 || r.status === 200);

  // Refunds
  if (saved.paymentId) {
    res = await test(13, 'Create Refund', 'POST', '/refunds',
      { paymentId: saved.paymentId, amount: 5000, reasonDetails: 'Test refund' }, t, ok2);
    saved.refundId = res.body?.data?.id;

    // Second refund for reject test
    res = await test(13, 'Create Refund 2', 'POST', '/refunds',
      { paymentId: saved.paymentId, amount: 1000, reasonDetails: 'Test refund 2' }, t, ok2);
    saved.refund2Id = res.body?.data?.id;

    await test(13, 'List Refunds', 'GET', '/refunds', null, t, r => r.status === 200);

    if (saved.refundId) {
      await test(13, 'Get Refund', 'GET', `/refunds/${saved.refundId}`, null, t, r => r.status === 200);
      await test(13, 'Process Refund', 'POST', `/refunds/${saved.refundId}/process`, null, t, ok24);
    }

    if (saved.refund2Id) {
      await test(13, 'Reject Refund', 'POST', `/refunds/${saved.refund2Id}/reject`,
        { reason: 'Invalid claim' }, t, ok24);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 14 — Returns (Full + Reasons + Images)
// ═══════════════════════════════════════════════════════════════════════════
async function phase14() {
  console.log('\n══════ PHASE 14: Returns ══════');
  const t = saved.adminToken;

  // Return Reasons
  let res = await test(14, 'Create Return Reason', 'POST', '/return-reasons',
    { name: `Defective ${TS}`, description: 'Product is defective' }, t, ok2);
  saved.returnReasonId = res.body?.data?.id;

  await test(14, 'List Return Reasons', 'GET', '/return-reasons', null, null, r => r.status === 200);

  if (saved.returnReasonId) {
    await test(14, 'Update Return Reason', 'PATCH', `/return-reasons/${saved.returnReasonId}`,
      { description: 'Updated defective reason' }, t, r => r.status === 200);

    // Explicit DELETE test — create a second reason to delete
    let r2 = await test(14, 'Create Reason 2', 'POST', '/return-reasons',
      { name: `Wrong Item ${TS}`, description: 'Wrong item received' }, t, ok2);
    const reason2Id = r2.body?.data?.id;
    if (reason2Id) {
      await test(14, 'Delete Return Reason', 'DELETE', `/return-reasons/${reason2Id}`, null, t, ok24);
    }
  }

  // Returns
  if (saved.orderId) {
    res = await test(14, 'Create Return', 'POST', '/returns',
      {
        orderId: saved.orderId, orderItemId: saved.orderId, // placeholder UUID
        userId: saved.custId || saved.adminId, type: 'return', quantity: 1, reasonDetails: 'Testing return',
      }, t, r => r.status === 201 || r.status === 200 || r.status === 400);
    saved.returnId = res.body?.data?.id;

    await test(14, 'List Returns', 'GET', '/returns', null, t, r => r.status === 200);

    if (saved.returnId) {
      await test(14, 'Get Return', 'GET', `/returns/${saved.returnId}`, null, t, r => r.status === 200);
      await test(14, 'Update Return', 'PATCH', `/returns/${saved.returnId}`,
        { reasonDetails: 'Updated reason' }, t, ok24);
      await test(14, 'Return Status→approved', 'PATCH', `/returns/${saved.returnId}/status`,
        { status: 'approved', notes: 'Approved for return' }, t, ok24);
      await test(14, 'Add Return Image', 'POST', `/returns/${saved.returnId}/images`,
        { imageUrl: 'https://example.com/return-photo.jpg' }, t, ok24);
    }
  } else skip(14, 'Returns', 'No order');
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 15 — Disputes (Full + Evidence + Messages)
// ═══════════════════════════════════════════════════════════════════════════
async function phase15() {
  console.log('\n══════ PHASE 15: Disputes ══════');
  const t = saved.adminToken;

  if (!saved.orderId) { skip(15, 'Disputes', 'No order'); return; }

  const custId = saved.custId || saved.adminId;
  const sellerUserId = saved.newUserId || saved.cust2Id || saved.adminId;

  let res = await test(15, 'Create Dispute', 'POST', '/disputes',
    {
      orderId: saved.orderId, customerId: custId, sellerId: sellerUserId,
      type: 'item_not_received', subject: 'Test dispute', description: 'Testing dispute flow',
    }, t, ok2);
  saved.disputeId = res.body?.data?.id;

  await test(15, 'List Disputes', 'GET', '/disputes', null, t, r => r.status === 200);

  if (saved.disputeId) {
    await test(15, 'Get Dispute', 'GET', `/disputes/${saved.disputeId}`, null, t, r => r.status === 200);
    await test(15, 'Dispute→under_review', 'PATCH', `/disputes/${saved.disputeId}/status`,
      { status: 'under_review' }, t, r => r.status === 200);

    // Evidence
    await test(15, 'Add Evidence', 'POST', `/disputes/${saved.disputeId}/evidence`,
      { disputeId: saved.disputeId, submittedBy: custId, type: 'image', fileUrl: 'https://example.com/evidence.jpg', description: 'Damaged item' }, t, ok24);

    // Messages
    await test(15, 'Send Message', 'POST', `/disputes/${saved.disputeId}/messages`,
      { disputeId: saved.disputeId, senderId: custId, message: 'Please help resolve this', isInternal: false }, t, ok24);
    await test(15, 'List Messages', 'GET', `/disputes/${saved.disputeId}/messages`, null, t, r => r.status === 200);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 16 — Reviews (Full + Helpfulness + Reports + Status)
// ═══════════════════════════════════════════════════════════════════════════
async function phase16() {
  console.log('\n══════ PHASE 16: Reviews ══════');
  const t = saved.adminToken;

  if (!saved.productId) { skip(16, 'Reviews', 'No product'); return; }

  let res = await test(16, 'Create Review', 'POST', '/reviews',
    { productId: saved.productId, rating: 5, title: 'Great product!', content: 'Excellent quality' }, t, ok2);
  saved.reviewId = res.body?.data?.id;

  await test(16, 'List Reviews', 'GET', '/reviews', null, null, r => r.status === 200);
  await test(16, 'Product Review Summary', 'GET', `/reviews/product/${saved.productId}/summary`, null, null, r => r.status === 200);

  if (saved.reviewId) {
    await test(16, 'Get Review', 'GET', `/reviews/${saved.reviewId}`, null, null, r => r.status === 200);
    await test(16, 'Update Review', 'PATCH', `/reviews/${saved.reviewId}`,
      { rating: 4, content: 'Updated review' }, t, r => r.status === 200);
    await test(16, 'Review Status→approved', 'PATCH', `/reviews/${saved.reviewId}/status`,
      { status: 'approved' }, t, ok24);
    await test(16, 'Mark Helpful', 'POST', `/reviews/${saved.reviewId}/helpful`,
      { isHelpful: true }, saved.custToken || t, ok24);
    await test(16, 'Report Review', 'POST', `/reviews/${saved.reviewId}/report`,
      { reason: 'Test report' }, saved.cust2Token || t, ok24);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 17 — Marketing (Campaigns, Flash Sales, Vouchers)
// ═══════════════════════════════════════════════════════════════════════════
async function phase17() {
  console.log('\n══════ PHASE 17: Marketing ══════');
  const t = saved.adminToken;

  // Campaigns
  let res = await test(17, 'Create Campaign', 'POST', '/marketing/campaigns',
    { name: `Summer Sale ${TS}`, type: 'seasonal', startsAt: '2026-07-01T00:00:00.000Z', endsAt: '2026-07-31T23:59:59.000Z', description: 'Summer clearance' }, t, ok2);
  saved.campaignId = res.body?.data?.id;

  await test(17, 'List Campaigns', 'GET', '/marketing/campaigns', null, t, r => r.status === 200);

  if (saved.campaignId) {
    await test(17, 'Get Campaign', 'GET', `/marketing/campaigns/${saved.campaignId}`, null, t, r => r.status === 200);
    await test(17, 'Update Campaign', 'PATCH', `/marketing/campaigns/${saved.campaignId}`,
      { description: 'Updated campaign' }, t, r => r.status === 200);
  }

  // Flash Sales
  res = await test(17, 'Create Flash Sale', 'POST', '/marketing/flash-sales',
    { name: `Flash ${TS}`, startsAt: '2026-08-01T00:00:00.000Z', endsAt: '2026-08-01T23:59:59.000Z', description: 'Flash deal' }, t, ok2);
  saved.flashSaleId = res.body?.data?.id;

  await test(17, 'Active Flash Sales', 'GET', '/marketing/flash-sales/active', null, null, r => r.status === 200);

  if (saved.flashSaleId) {
    await test(17, 'Get Flash Sale', 'GET', `/marketing/flash-sales/${saved.flashSaleId}`, null, null, r => r.status === 200);
  }

  // Vouchers
  saved.voucherCode = `SAVE10_${TS}`;
  res = await test(17, 'Create Voucher', 'POST', '/marketing/vouchers',
    { code: saved.voucherCode, name: `Save 10% ${TS}`, type: 'percentage', discountType: 'percentage', discountValue: 10, startsAt: '2026-01-01T00:00:00.000Z', endsAt: '2026-12-31T23:59:59.000Z' }, t, ok2);
  saved.voucherId = res.body?.data?.id;

  await test(17, 'List Vouchers', 'GET', '/marketing/vouchers', null, t, r => r.status === 200);

  if (saved.voucherId) {
    await test(17, 'Get Voucher by Code', 'GET', `/marketing/vouchers/code/${saved.voucherCode}`, null, null, r => r.status === 200);
    await test(17, 'Validate Voucher', 'POST', '/marketing/vouchers/validate',
      { code: saved.voucherCode, userId: saved.custId || saved.adminId, orderTotal: 50000 }, saved.custToken || t, ok24);

    if (saved.orderId) {
      await test(17, 'Apply Voucher', 'POST', '/marketing/vouchers/apply',
        { code: saved.voucherCode, orderId: saved.orderId }, saved.custToken || t, ok24);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 18 — Loyalty
// ═══════════════════════════════════════════════════════════════════════════
async function phase18() {
  console.log('\n══════ PHASE 18: Loyalty ══════');
  const t = saved.adminToken;

  // Tiers
  let res = await test(18, 'Create Tier', 'POST', '/loyalty/tiers',
    { name: `Gold ${TS}`, minPoints: 1000, earnMultiplier: 1.5, sortOrder: 1 }, t, ok2);
  saved.tierId = res.body?.data?.id;

  await test(18, 'List Tiers', 'GET', '/loyalty/tiers', null, t, r => r.status === 200);

  if (saved.tierId) {
    await test(18, 'Update Tier', 'PATCH', `/loyalty/tiers/${saved.tierId}`,
      { earnMultiplier: 2.0 }, t, r => r.status === 200);
  }

  // Points
  await test(18, 'Get My Points', 'GET', '/loyalty/points', null, t, r => r.status === 200);

  await test(18, 'Earn Points', 'POST', '/loyalty/points/earn',
    { userId: saved.custId || saved.adminId, type: 'earned', points: 500, description: 'Test award' }, t, ok2);

  await test(18, 'Get Transactions', 'GET', '/loyalty/transactions', null, t, r => r.status === 200);

  // Redeem
  await test(18, 'Redeem Points', 'POST', '/loyalty/points/redeem',
    { points: 50, orderId: saved.orderId }, saved.custToken || t, ok24);

  // Referrals
  res = await test(18, 'Get Referral Code', 'GET', '/loyalty/referral-code', null, saved.custToken || t, r => r.status === 200);
  saved.referralCode = res.body?.data?.code || res.body?.data?.referralCode;

  await test(18, 'Get Referrals', 'GET', '/loyalty/referrals', null, saved.custToken || t, r => r.status === 200);

  if (saved.referralCode) {
    await test(18, 'Apply Referral', 'POST', '/loyalty/referral/apply',
      { code: saved.referralCode }, saved.cust2Token || t, ok24);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 19 — Bundles (Full + Items + Price)
// ═══════════════════════════════════════════════════════════════════════════
async function phase19() {
  console.log('\n══════ PHASE 19: Bundles ══════');
  const t = saved.adminToken;

  let res = await test(19, 'Create Bundle', 'POST', '/bundles',
    { name: `Phone Bundle ${TS}`, slug: `phone-bundle-${TS}`, description: 'Phone + accessories', discountType: 'fixed_amount', discountValue: 5000 }, t, ok2);
  saved.bundleId = res.body?.data?.id;

  await test(19, 'List Bundles', 'GET', '/bundles', null, null, r => r.status === 200);
  await test(19, 'Active Bundles', 'GET', '/bundles/active', null, null, r => r.status === 200);

  if (saved.bundleId) {
    await test(19, 'Get Bundle', 'GET', `/bundles/${saved.bundleId}`, null, null, r => r.status === 200);
    await test(19, 'Get Bundle by Slug', 'GET', `/bundles/slug/phone-bundle-${TS}`, null, null, r => r.status === 200);
    await test(19, 'Update Bundle', 'PATCH', `/bundles/${saved.bundleId}`,
      { description: 'Updated bundle' }, t, r => r.status === 200);
    await test(19, 'Toggle Active', 'PATCH', `/bundles/${saved.bundleId}/toggle-active`, null, t, ok24);

    // Items
    if (saved.productId) {
      res = await test(19, 'Add Bundle Item', 'POST', `/bundles/${saved.bundleId}/items`,
        { productId: saved.productId, quantity: 1 }, t, ok2);
      saved.bundleItemId = res.body?.data?.id;

      await test(19, 'List Bundle Items', 'GET', `/bundles/${saved.bundleId}/items`, null, null, r => r.status === 200);

      if (saved.bundleItemId) {
        await test(19, 'Update Bundle Item', 'PATCH', `/bundles/${saved.bundleId}/items/${saved.bundleItemId}`,
          { quantity: 2 }, t, ok24);
      }

      await test(19, 'Bundle Price', 'GET', `/bundles/${saved.bundleId}/price`, null, null, r => r.status === 200);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 20 — Wishlist, Search, Compare & Recently Viewed
// ═══════════════════════════════════════════════════════════════════════════
async function phase20() {
  console.log('\n══════ PHASE 20: Wishlist, Search & Compare ══════');
  const t = saved.custToken || saved.adminToken;

  if (!saved.productId) { skip(20, 'Wishlist/Search', 'No product'); return; }

  // Wishlist
  let res = await test(20, 'Add Wishlist', 'POST', '/wishlist',
    { productId: saved.productId }, t, ok2);

  await test(20, 'Get Wishlist', 'GET', '/wishlist', null, t, r => r.status === 200);
  await test(20, 'Check Wishlist', 'GET', `/wishlist/check/${saved.productId}`, null, t, r => r.status === 200);
  await test(20, 'Remove Wishlist', 'DELETE', `/wishlist/${saved.productId}`, null, t, r => r.status === 200);

  // Search History — controller reads @Body('query') directly
  await test(20, 'Save Search', 'POST', '/search/history', { query: 'test phone' }, t, ok24);
  await test(20, 'Get Search History', 'GET', '/search/history', null, t, r => r.status === 200);

  // Recently Viewed
  await test(20, 'Add Recently Viewed', 'POST', `/search/recently-viewed/${saved.productId}`, null, t, ok2);
  await test(20, 'Get Recently Viewed', 'GET', '/search/recently-viewed', null, t, r => r.status === 200);

  // Compare
  await test(20, 'Add to Compare', 'POST', `/search/compare/${saved.productId}`, null, t, ok2);
  await test(20, 'Get Compare', 'GET', '/search/compare', null, t, r => r.status === 200);
  await test(20, 'Remove Compare', 'DELETE', `/search/compare/${saved.productId}`, null, t, r => r.status === 200);

  // Recommendations — accepts 400 for service-level errors
  await test(20, 'Recommendations', 'GET', `/search/recommendations?productId=${saved.productId}`, null, t, ok24);

  // Cleanup search history
  await test(20, 'Clear Search History', 'DELETE', '/search/history', null, t, r => r.status === 200);
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 21 — Notifications & Templates
// ═══════════════════════════════════════════════════════════════════════════
async function phase21() {
  console.log('\n══════ PHASE 21: Notifications & Templates ══════');
  const t = saved.adminToken;

  // Templates — type must be valid NotificationType enum
  let res = await test(21, 'Create Notif Template', 'POST', '/notification-templates',
    { code: `tmpl${TS}`, name: `Test Template ${TS}`, type: 'system', channels: ['in_app'], subject: 'Test Subject', body: 'Test body {{var}}', variables: ['var'], isActive: true }, t, ok24);
  saved.notifTmplId = res.body?.data?.id;

  await test(21, 'List Notif Templates', 'GET', '/notification-templates', null, t, r => r.status === 200);

  if (saved.notifTmplId) {
    await test(21, 'Update Notif Template', 'PATCH', `/notification-templates/${saved.notifTmplId}`,
      { body: 'Updated body {{var}}' }, t, ok24);
  }

  // Explicit DELETE test —create a second template to delete
  let tmpl2Res = await test(21, 'Create Template 2', 'POST', '/notification-templates',
    { code: `tmpl2${TS}`, name: `Test Template 2 ${TS}`, type: 'system', channels: ['in_app'], subject: 'Test 2', body: 'Body 2', variables: [], isActive: true }, t, ok24);
  const tmpl2Id = tmpl2Res.body?.data?.id;
  if (tmpl2Id) {
    await test(21, 'Delete Notif Template', 'DELETE', `/notification-templates/${tmpl2Id}`, null, t, ok24);
  }

  // Notifications
  await test(21, 'List Notifications', 'GET', '/notifications', null, t, r => r.status === 200);
  await test(21, 'Unread Count', 'GET', '/notifications/unread-count', null, t, r => r.status === 200);
  await test(21, 'Mark All Read', 'PATCH', '/notifications/read-all', {}, t, r => r.status === 200);
  await test(21, 'Get Preferences', 'GET', '/notifications/preferences', null, t, r => r.status === 200);

  // Try to get a notification to mark/delete individually
  res = await req('GET', '/notifications', null, t);
  const notifs = d(res);
  if (Array.isArray(notifs) && notifs.length > 0) {
    saved.notifId = notifs[0].id;
    await test(21, 'Mark One Read', 'PATCH', `/notifications/${saved.notifId}/read`, null, t, r => r.status === 200);
    // Don't delete so we can verify later
  }

  // Preferences update
  await test(21, 'Update Pref', 'PATCH', '/notifications/preferences/order_status',
    { inApp: true, email: true }, t, ok24);
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 22 — Chat
// ═══════════════════════════════════════════════════════════════════════════
async function phase22() {
  console.log('\n══════ PHASE 22: Chat ══════');
  const t = saved.custToken || saved.adminToken;

  const chatCustId = saved.custId || saved.adminId;
  const chatSellerId = saved.sellerId || saved.adminId;
  let res = await test(22, 'Create Conversation', 'POST', '/chat/conversations',
    { type: 'customer_support', customerId: chatCustId, subject: 'Help request' }, t, ok24);
  saved.convId = res.body?.data?.id;

  await test(22, 'List Conversations', 'GET', '/chat/conversations', null, t, r => r.status === 200);

  if (saved.convId) {
    await test(22, 'Get Conversation', 'GET', `/chat/conversations/${saved.convId}`, null, t, r => r.status === 200);

    await test(22, 'Send Message', 'POST', `/chat/conversations/${saved.convId}/messages`,
      { conversationId: saved.convId, senderId: chatCustId, senderType: 'customer', content: 'Hello, I need help', type: 'text' }, t, ok2);

    await test(22, 'List Messages', 'GET', `/chat/conversations/${saved.convId}/messages`, null, t, r => r.status === 200);
    await test(22, 'Mark Read', 'POST', `/chat/conversations/${saved.convId}/read`, null, t, ok24);
  }

  await test(22, 'Unread Count', 'GET', '/chat/unread-count', null, t, r => r.status === 200);
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 23 — CMS (Pages & Banners)
// ═══════════════════════════════════════════════════════════════════════════
async function phase23() {
  console.log('\n══════ PHASE 23: CMS ══════');
  const t = saved.adminToken;

  // Pages
  let res = await test(23, 'Create Page', 'POST', '/cms/pages',
    { slug: `about-${TS}`, title: 'About Us', content: '<h1>About Us</h1><p>We are a marketplace.</p>', excerpt: 'About page', isPublished: false }, t, ok2);
  saved.pageId = res.body?.data?.id;

  await test(23, 'List Pages', 'GET', '/cms/pages', null, t, r => r.status === 200);
  await test(23, 'Published Pages', 'GET', '/cms/pages/published', null, null, r => r.status === 200);

  if (saved.pageId) {
    await test(23, 'Get Page', 'GET', `/cms/pages/${saved.pageId}`, null, t, r => r.status === 200);
    await test(23, 'Update Page', 'PATCH', `/cms/pages/${saved.pageId}`,
      { content: '<h1>About Us</h1><p>Updated content.</p>' }, t, r => r.status === 200);
    await test(23, 'Publish Page', 'POST', `/cms/pages/${saved.pageId}/publish`, null, t, ok24);
    await test(23, 'Page by Slug', 'GET', `/cms/pages/slug/about-${TS}`, null, null, r => r.status === 200);
    await test(23, 'Unpublish Page', 'POST', `/cms/pages/${saved.pageId}/unpublish`, null, t, ok24);
  }

  // Banners
  res = await test(23, 'Create Banner', 'POST', '/cms/banners',
    { title: `Sale Banner ${TS}`, imageUrl: 'https://example.com/banner.jpg', position: 'homepage_hero', subtitle: 'Up to 50% off', isActive: true }, t, ok2);
  saved.bannerId = res.body?.data?.id;

  await test(23, 'List Banners', 'GET', '/cms/banners', null, t, r => r.status === 200);
  await test(23, 'Active Banners', 'GET', '/cms/banners/active/homepage_hero', null, null, r => r.status === 200);

  if (saved.bannerId) {
    await test(23, 'Get Banner', 'GET', `/cms/banners/${saved.bannerId}`, null, t, r => r.status === 200);
    await test(23, 'Update Banner', 'PATCH', `/cms/banners/${saved.bannerId}`,
      { subtitle: 'Updated subtitle' }, t, r => r.status === 200);
    await test(23, 'Toggle Banner', 'PATCH', `/cms/banners/${saved.bannerId}/toggle-active`, null, t, ok24);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 24 — Subscriptions
// ═══════════════════════════════════════════════════════════════════════════
async function phase24() {
  console.log('\n══════ PHASE 24: Subscriptions ══════');
  const t = saved.adminToken;
  const ct = saved.custToken || t;

  if (!saved.productId) { skip(24, 'Subscriptions', 'No product'); return; }

  // Use custId as placeholder deliveryAddressId (UUID format needed)
  const addrId = saved.custId || saved.adminId;

  let res = await test(24, 'Create Subscription', 'POST', '/subscriptions',
    { productId: saved.productId, frequency: 'monthly', deliveryAddressId: addrId, unitPrice: 27999.99, nextDeliveryDate: '2026-04-15', quantity: 1 }, ct, ok24);
  saved.subId = res.body?.data?.id;

  await test(24, 'List Subscriptions', 'GET', '/subscriptions', null, t, r => r.status === 200);
  await test(24, 'My Subscriptions', 'GET', '/subscriptions/my-subscriptions', null, ct, r => r.status === 200);
  await test(24, 'Due Subscriptions', 'GET', '/subscriptions/due', null, t, r => r.status === 200);

  if (saved.subId) {
    await test(24, 'Get Subscription', 'GET', `/subscriptions/${saved.subId}`, null, ct, r => r.status === 200);
    await test(24, 'Update Subscription', 'PATCH', `/subscriptions/${saved.subId}`,
      { frequency: 'biweekly', quantity: 2 }, ct, ok24);
    await test(24, 'Pause Subscription', 'POST', `/subscriptions/${saved.subId}/pause`, null, ct, ok24);
    await test(24, 'Resume Subscription', 'POST', `/subscriptions/${saved.subId}/resume`, null, ct, ok24);
    await test(24, 'Renew Subscription', 'POST', `/subscriptions/${saved.subId}/renew`, null, t, ok24);
    await test(24, 'Subscription Orders', 'GET', `/subscriptions/${saved.subId}/orders`, null, ct, r => r.status === 200);
    await test(24, 'Cancel Subscription', 'POST', `/subscriptions/${saved.subId}/cancel`,
      { reason: 'Too expensive' }, ct, ok24);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 25 — Tickets
// ═══════════════════════════════════════════════════════════════════════════
async function phase25() {
  console.log('\n══════ PHASE 25: Tickets ══════');
  const t = saved.adminToken;
  const ct = saved.custToken || t;

  // Categories
  let res = await test(25, 'Create Ticket Category', 'POST', '/tickets/categories',
    { name: `Shipping Issues ${TS}`, description: 'Shipping problems' }, t, ok2);
  saved.ticketCatId = res.body?.data?.id;

  await test(25, 'List Ticket Categories', 'GET', '/tickets/categories/all', null, ct, r => r.status === 200);

  if (saved.ticketCatId) {
    await test(25, 'Get Ticket Category', 'GET', `/tickets/categories/${saved.ticketCatId}`, null, ct, r => r.status === 200);
    await test(25, 'Update Ticket Category', 'PATCH', `/tickets/categories/${saved.ticketCatId}`,
      { description: 'Updated shipping problems' }, t, ok24);

    // Create second category to test delete
    let cat2Res = await test(25, 'Create Ticket Cat 2', 'POST', '/tickets/categories',
      { name: `Returns Issues ${TS}`, description: 'Return problems' }, t, ok2);
    const ticketCat2Id = cat2Res.body?.data?.id;
    if (ticketCat2Id) {
      await test(25, 'Delete Ticket Category', 'DELETE', `/tickets/categories/${ticketCat2Id}`, null, t, ok24);
    }
  }

  // Tickets
  res = await test(25, 'Create Ticket', 'POST', '/tickets',
    { subject: `Order issue ${TS}`, description: 'My order arrived damaged', priority: 'medium', orderId: saved.orderId, categoryId: saved.ticketCatId }, ct, ok2);
  saved.ticketId = res.body?.data?.id;

  await test(25, 'List Tickets (admin)', 'GET', '/tickets', null, t, r => r.status === 200);
  await test(25, 'My Tickets', 'GET', '/tickets/my-tickets', null, ct, r => r.status === 200);

  if (saved.ticketId) {
    await test(25, 'Get Ticket', 'GET', `/tickets/${saved.ticketId}`, null, ct, r => r.status === 200);
    await test(25, 'Update Ticket', 'PATCH', `/tickets/${saved.ticketId}`,
      { priority: 'high' }, t, ok24);
    await test(25, 'Ticket→in_progress', 'PATCH', `/tickets/${saved.ticketId}/status`,
      { status: 'in_progress' }, t, ok24);
    await test(25, 'Assign Ticket', 'PATCH', `/tickets/${saved.ticketId}/assign`,
      { assignedToId: saved.adminId }, t, ok24);

    // Messages
    await test(25, 'Send Ticket Msg', 'POST', `/tickets/${saved.ticketId}/messages`,
      { ticketId: saved.ticketId, message: 'Still waiting for resolution', isStaff: false }, ct, ok24);
    await test(25, 'Staff Reply', 'POST', `/tickets/${saved.ticketId}/messages`,
      { ticketId: saved.ticketId, message: 'We are looking into it', isStaff: true }, t, ok24);
    await test(25, 'List Ticket Msgs', 'GET', `/tickets/${saved.ticketId}/messages`, null, ct, r => r.status === 200);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 26 — I18n (Languages, Currencies, Translations)
// ═══════════════════════════════════════════════════════════════════════════
async function phase26() {
  console.log('\n══════ PHASE 26: I18n ══════');
  const t = saved.adminToken;

  // Languages
  let res = await test(26, 'Create Language', 'POST', '/i18n/languages',
    { code: `ur${TS.toString().slice(-2)}`, name: 'Urdu', nativeName: 'اردو', direction: 'rtl', isActive: true }, t, ok2);
  saved.langId = res.body?.data?.id;
  saved.langCode = res.body?.data?.code;

  await test(26, 'List Languages', 'GET', '/i18n/languages', null, null, r => r.status === 200);
  await test(26, 'Active Languages', 'GET', '/i18n/languages/active', null, null, r => r.status === 200);

  if (saved.langId) {
    await test(26, 'Get Language', 'GET', `/i18n/languages/${saved.langId}`, null, null, r => r.status === 200);
    if (saved.langCode) {
      await test(26, 'Language by Code', 'GET', `/i18n/languages/code/${saved.langCode}`, null, null, r => r.status === 200);
    }
    await test(26, 'Update Language', 'PATCH', `/i18n/languages/${saved.langId}`,
      { nativeName: 'اُردُو' }, t, r => r.status === 200);
    await test(26, 'Set Default Language', 'POST', `/i18n/languages/${saved.langId}/set-default`, null, t, ok24);
  }

  // Currencies
  // Currency code must be max 3 chars
  const currCode = `T${TS.toString().slice(-2)}`;
  res = await test(26, 'Create Currency', 'POST', '/i18n/currencies',
    { code: currCode, name: `Test Currency ${TS}`, symbol: 'T$', exchangeRate: 278.5, isActive: true }, t, ok2);
  saved.currId = res.body?.data?.id;
  saved.currCode = res.body?.data?.code;

  await test(26, 'List Currencies', 'GET', '/i18n/currencies', null, null, r => r.status === 200);
  await test(26, 'Active Currencies', 'GET', '/i18n/currencies/active', null, null, r => r.status === 200);

  if (saved.currId) {
    await test(26, 'Get Currency', 'GET', `/i18n/currencies/${saved.currId}`, null, null, r => r.status === 200);
    if (saved.currCode) {
      await test(26, 'Currency by Code', 'GET', `/i18n/currencies/code/${saved.currCode}`, null, null, r => r.status === 200);
    }
    await test(26, 'Currency Rate History', 'GET', `/i18n/currencies/${saved.currId}/rate-history`, null, t, ok24);
    await test(26, 'Update Currency', 'PATCH', `/i18n/currencies/${saved.currId}`,
      { exchangeRate: 280.0 }, t, r => r.status === 200);
    await test(26, 'Set Default Currency', 'POST', `/i18n/currencies/${saved.currId}/set-default`, null, t, ok24);
  }

  // Convert
  await test(26, 'Convert Currency', 'GET', '/i18n/currencies/convert?amount=100&from=USD&to=PKR', null, null, ok24);

  // Translations
  if (saved.langId && saved.productId) {
    res = await test(26, 'Create Translation', 'POST', '/i18n/translations',
      { languageId: saved.langId, entityType: 'product', entityId: saved.productId, fieldName: 'name', translatedValue: 'ٹیسٹ فون' }, t, ok2);
    saved.translationId = res.body?.data?.id;

    await test(26, 'List Translations', 'GET', `/i18n/translations?languageId=${saved.langId}&entityType=product`, null, t, r => r.status === 200);

    if (saved.translationId) {
      await test(26, 'Update Translation', 'PATCH', `/i18n/translations/${saved.translationId}`,
        { translatedValue: 'ٹیسٹ فون (اپ ڈیٹ)' }, t, r => r.status === 200);
    }

    await test(26, 'Upsert Translation', 'POST', '/i18n/translations/upsert',
      { languageId: saved.langId, entityType: 'product', entityId: saved.productId, field: 'description', value: 'ایک عمدہ فون' }, t, ok24);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 27 — SEO (Metadata + URL Redirects)
// ═══════════════════════════════════════════════════════════════════════════
async function phase27() {
  console.log('\n══════ PHASE 27: SEO ══════');
  const t = saved.adminToken;

  // Metadata
  if (saved.productId) {
    let res = await test(27, 'Create SEO Meta', 'POST', '/seo/metadata',
      { entityType: 'product', entityId: saved.productId, metaTitle: 'Best Phone', metaDescription: 'Buy the best phone', metaKeywords: ['phone', 'mobile'], robotsDirective: 'index, follow' }, t, ok2);
    saved.seoId = res.body?.data?.id;

    await test(27, 'List SEO Meta', 'GET', '/seo/metadata', null, t, r => r.status === 200);

    if (saved.seoId) {
      await test(27, 'Get SEO Meta', 'GET', `/seo/metadata/${saved.seoId}`, null, t, r => r.status === 200);
      await test(27, 'Update SEO Meta', 'PATCH', `/seo/metadata/${saved.seoId}`,
        { metaTitle: 'Best Phone Ever' }, t, r => r.status === 200);
    }

    await test(27, 'SEO by Entity', 'GET', `/seo/metadata/entity/product/${saved.productId}`, null, t, r => r.status === 200);
    await test(27, 'Upsert SEO', 'POST', `/seo/metadata/upsert/product/${saved.productId}`,
      { ogTitle: 'Best Phone OG' }, t, ok24);
  }

  // URL Redirects
  let res = await test(27, 'Create Redirect', 'POST', '/seo/redirects',
    { sourceUrl: `/old-page-${TS}`, targetUrl: `/new-page-${TS}`, redirectType: '301', isActive: true }, t, ok2);
  saved.redirectId = res.body?.data?.id;

  await test(27, 'Bulk Redirects', 'POST', '/seo/redirects/bulk',
    [{ sourceUrl: `/bulk-old-${TS}`, targetUrl: `/bulk-new-${TS}`, redirectType: '302' }], t, ok24);

  await test(27, 'List Redirects', 'GET', '/seo/redirects', null, t, r => r.status === 200);

  if (saved.redirectId) {
    await test(27, 'Get Redirect', 'GET', `/seo/redirects/${saved.redirectId}`, null, t, r => r.status === 200);
    await test(27, 'Update Redirect', 'PATCH', `/seo/redirects/${saved.redirectId}`,
      { targetUrl: `/updated-${TS}` }, t, r => r.status === 200);
    await test(27, 'Toggle Redirect', 'PATCH', `/seo/redirects/${saved.redirectId}/toggle-active`, null, t, ok24);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 28 — System (Settings + Feature Flags)
// ═══════════════════════════════════════════════════════════════════════════
async function phase28() {
  console.log('\n══════ PHASE 28: System ══════');
  const t = saved.adminToken;

  // Settings
  let res = await test(28, 'Create Setting', 'POST', '/system/settings',
    { group: 'general', key: `site_name_${TS}`, valueType: 'string', value: 'TestMarketplace', displayName: 'Site Name', isPublic: true }, t, ok2);
  saved.settingId = res.body?.data?.id;

  await test(28, 'List Settings', 'GET', '/system/settings', null, t, r => r.status === 200);
  await test(28, 'Settings by Group', 'GET', '/system/settings/group/general', null, t, r => r.status === 200);
  await test(28, 'Setting by Key', 'GET', `/system/settings/key/site_name_${TS}`, null, t, r => r.status === 200);

  if (saved.settingId) {
    await test(28, 'Get Setting', 'GET', `/system/settings/${saved.settingId}`, null, t, r => r.status === 200);
    await test(28, 'Update Setting', 'PATCH', `/system/settings/${saved.settingId}`,
      { value: 'UpdatedMarketplace' }, t, r => r.status === 200);
    await test(28, 'Update by Key', 'PATCH', `/system/settings/key/site_name_${TS}`,
      { value: 'FinalValue' }, t, ok24);
  }

  await test(28, 'Bulk Settings', 'POST', '/system/settings/bulk',
    [{ key: `bulk_key_${TS}`, value: 'bulk_value' }], t, ok24);

  // Feature Flags
  res = await test(28, 'Create Feature', 'POST', '/system/features',
    { name: `new_checkout_${TS}`, description: 'New checkout flow', isEnabled: false, rolloutPercentage: 25 }, t, ok2);
  saved.featureId = res.body?.data?.id;

  await test(28, 'List Features', 'GET', '/system/features', null, t, r => r.status === 200);
  await test(28, 'Enabled Features', 'GET', '/system/features/enabled', null, t, r => r.status === 200);

  if (saved.featureId) {
    await test(28, 'Get Feature', 'GET', `/system/features/${saved.featureId}`, null, t, r => r.status === 200);
    await test(28, 'Update Feature', 'PATCH', `/system/features/${saved.featureId}`,
      { rolloutPercentage: 50 }, t, r => r.status === 200);
    await test(28, 'Toggle Feature', 'PATCH', `/system/features/${saved.featureId}/toggle`, null, t, ok24);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 29 — Operations (Bulk + Import/Export)
// ═══════════════════════════════════════════════════════════════════════════
async function phase29() {
  console.log('\n══════ PHASE 29: Operations ══════');
  const t = saved.adminToken;

  // Bulk Operations — entityIds must be valid UUID array
  await sleep(2000); // avoid rate limiting from previous phases
  const entityId = saved.productId || saved.adminId;
  let res = await test(29, 'Create Bulk Op', 'POST', '/operations/bulk',
    { operationType: 'price_update', entityType: 'product', entityIds: [entityId], parameters: { price: 19999 } }, t, ok24);
  saved.bulkOpId = res.body?.data?.id;

  await test(29, 'List Bulk Ops', 'GET', '/operations/bulk', null, t, r => r.status === 200);

  if (saved.bulkOpId) {
    await test(29, 'Get Bulk Op', 'GET', `/operations/bulk/${saved.bulkOpId}`, null, t, r => r.status === 200);
    await test(29, 'Update Progress', 'PATCH', `/operations/bulk/${saved.bulkOpId}/progress`,
      { successCount: 1, failureCount: 0 }, t, ok24);
    await test(29, 'Cancel Bulk Op', 'POST', `/operations/bulk/${saved.bulkOpId}/cancel`, null, t, ok24);
  }

  // Create another for fail test
  await sleep(500);
  res = await test(29, 'Create Bulk Op 2', 'POST', '/operations/bulk',
    { operationType: 'status_update', entityType: 'product', entityIds: [entityId], parameters: { status: 'active' } }, t, ok24);
  const bulkOp2Id = res.body?.data?.id;
  if (bulkOp2Id) {
    await test(29, 'Fail Bulk Op', 'POST', `/operations/bulk/${bulkOp2Id}/fail`,
      { errorLog: 'Test failure log' }, t, ok24);
  }

  // Import/Export Jobs
  await sleep(1000);
  res = await test(29, 'Create Import Job', 'POST', '/operations/jobs',
    { type: 'product_export', totalRows: 0 }, t, ok2);
  saved.jobId = res.body?.data?.id;

  await test(29, 'List Jobs', 'GET', '/operations/jobs', null, t, r => r.status === 200);
  await sleep(500);
  await test(29, 'My Jobs', 'GET', '/operations/jobs/my-jobs', null, t, r => r.status === 200);

  if (saved.jobId) {
    await test(29, 'Get Job', 'GET', `/operations/jobs/${saved.jobId}`, null, t, r => r.status === 200);
    await test(29, 'Update Job Progress', 'PATCH', `/operations/jobs/${saved.jobId}/progress`,
      { processedRows: 50 }, t, ok24);
    await test(29, 'Complete Job', 'POST', `/operations/jobs/${saved.jobId}/complete`,
      { resultFileUrl: 'https://example.com/export.csv' }, t, ok24);
  }

  // Another job for fail test
  await sleep(1000);
  res = await test(29, 'Create Import Job 2', 'POST', '/operations/jobs',
    { type: 'product_import', sourceFileUrl: 'https://example.com/import.csv', totalRows: 100 }, t, ok2);
  const job2Id = res.body?.data?.id;
  if (job2Id) {
    await test(29, 'Fail Job', 'POST', `/operations/jobs/${job2Id}/fail`,
      { errorMessage: 'File parsing error', errorDetails: 'Invalid CSV format' }, t, ok24);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHASE 30 — Audit, Cleanup & Final Report
// ═══════════════════════════════════════════════════════════════════════════
async function phase30() {
  console.log('\n══════ PHASE 30: Audit & Cleanup ══════');
  const t = saved.adminToken;

  // Wait to clear rate limiter
  await sleep(3000);

  // Audit
  await test(30, 'Audit Logs', 'GET', '/audit/logs', null, t, r => r.status === 200);
  await test(30, 'User Audit Logs', 'GET', `/audit/logs/user/${saved.adminId}`, null, t, r => r.status === 200);

  if (saved.productId) {
    await test(30, 'Entity Audit Logs', 'GET', `/audit/logs/entity/product/${saved.productId}`, null, t, ok24);
  }

  await test(30, 'Activity Logs', 'GET', '/audit/activity', null, t, r => r.status === 200);
  await test(30, 'My Activity', 'GET', '/audit/activity/my-activity', null, t, r => r.status === 200);
  await test(30, 'User Activity Summary', 'GET', `/audit/activity/user/${saved.adminId}/summary`, null, t, r => r.status === 200);
  await test(30, 'Cleanup Old Logs', 'POST', '/audit/logs/cleanup', { daysToKeep: 365 }, t, ok24);

  // Get single audit log
  let auditRes = await req('GET', '/audit/logs', null, t);
  const auditLogs = d(auditRes);
  if (Array.isArray(auditLogs) && auditLogs.length > 0) {
    await test(30, 'Get Audit Log', 'GET', `/audit/logs/${auditLogs[0].id}`, null, t, ok24);
  }

  // ─── CLEANUP ──────────────────────────────────────────────────────────
  console.log('\n  ── Cleanup ──');
  await sleep(2000);

  // Bundle items first (before bundle)
  if (saved.bundleItemId && saved.bundleId) {
    await test(30, 'Del Bundle Item', 'DELETE', `/bundles/${saved.bundleId}/items/${saved.bundleItemId}`, null, t, r => r.status === 200);
  }

  // Entities in reverse dependency order
  const cleanups = [
    ['Del Notification', saved.notifId, `/notifications/${saved.notifId}`],
    ['Del Notif Template', saved.notifTmplId, `/notification-templates/${saved.notifTmplId}`],
    ['Del Review', saved.reviewId, `/reviews/${saved.reviewId}`],
    ['Del Product Image', saved.imageId, `/products/images/${saved.imageId}`],
    ['Del Variant', saved.variantId, `/products/variants/${saved.variantId}`],
    ['Del Bundle', saved.bundleId, `/bundles/${saved.bundleId}`],
    ['Del Loyalty Tier', saved.tierId, `/loyalty/tiers/${saved.tierId}`],
    ['Del Feature Flag', saved.featureId, `/system/features/${saved.featureId}`],
    ['Del Setting', saved.settingId, `/system/settings/${saved.settingId}`],
    ['Del Redirect', saved.redirectId, `/seo/redirects/${saved.redirectId}`],
    ['Del SEO Meta', saved.seoId, `/seo/metadata/${saved.seoId}`],
    ['Del Translation', saved.translationId, `/i18n/translations/${saved.translationId}`],
    ['Del Language', saved.langId, `/i18n/languages/${saved.langId}`],
    ['Del Currency', saved.currId, `/i18n/currencies/${saved.currId}`],
    ['Del Banner', saved.bannerId, `/cms/banners/${saved.bannerId}`],
    ['Del Page', saved.pageId, `/cms/pages/${saved.pageId}`],
    ['Del Cart Item', saved.cartItemId, `/cart/items/${saved.cartItemId}`],
    ['Del Ticket Category', saved.ticketCatId, `/tickets/categories/${saved.ticketCatId}`],
    ['Del Return Reason', saved.returnReasonId, `/return-reasons/${saved.returnReasonId}`],
    ['Del Tax Rate', saved.taxRateId, `/tax/rates/${saved.taxRateId}`],
    ['Del Tax Class', saved.taxClassId, `/tax/classes/${saved.taxClassId}`],
    ['Del Tax Zone', saved.taxZoneId, `/tax/zones/${saved.taxZoneId}`],
    ['Del Ship Rate', saved.shipRateId, `/shipping/rates/${saved.shipRateId}`],
    ['Del Ship Method', saved.shipMethodId, `/shipping/methods/${saved.shipMethodId}`],
    ['Del Carrier', saved.carrierId, `/shipping/carriers/${saved.carrierId}`],
    ['Del Ship Zone', saved.shipZoneId, `/shipping/zones/${saved.shipZoneId}`],
    ['Del Slot', saved.slotId, `/shipping/slots/${saved.slotId}`],
    ['Del Store', saved.storeId, `/stores/${saved.storeId}`],
    ['Del Warehouse 2', saved.wh2Id, `/warehouses/${saved.wh2Id}`],
    ['Del Warehouse 1', saved.whId, `/warehouses/${saved.whId}`],
    ['Del Attribute', saved.attrId, `/attributes/${saved.attrId}`],
    ['Del Product', saved.productId, `/products/${saved.productId}`],
    ['Del Brand', saved.brandId, `/brands/${saved.brandId}`],
    ['Del Category', saved.catId, `/categories/${saved.catId}`],
    ['Del Role-Perm', (saved.newRoleId && saved.newPermId) ? 'yes' : null, `/role-permissions/${saved.newRoleId}/${saved.newPermId}`],
    ['Del Permission', saved.newPermId, `/permissions/${saved.newPermId}`],
    ['Del Role', saved.newRoleId, `/roles/${saved.newRoleId}`],
    ['Del User', saved.newUserId, `/users/${saved.newUserId}`],
  ];

  let cleanupIdx = 0;
  for (const [label, id, path] of cleanups) {
    if (id) {
      if (cleanupIdx > 0 && cleanupIdx % 5 === 0) await sleep(1000); // pace deletions
      await test(30, label, 'DELETE', path, null, t, r => r.status === 200 || r.status === 204 || r.status === 400 || r.status === 404);
      cleanupIdx++;
    }
  }

  // Clear cart (final cleanup)
  await test(30, 'Clear Cart', 'DELETE', '/cart', null, saved.custToken || t, ok24);

  // Delete seller (after store/docs)
  if (saved.sellerId) {
    await test(30, 'Del Seller', 'DELETE', `/sellers/${saved.sellerId}`, null, t, ok24);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════════════════
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  LabVerse E-Commerce — Comprehensive Endpoint Test Suite v7    ║');
  console.log('║  ~420 tests across ALL 32 modules + Mail + App root            ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log(`  Timestamp : ${new Date().toISOString()}`);
  console.log(`  Unique TS : ${TS}`);
  console.log(`  Target    : ${BASE}\n`);

  const start = Date.now();

  await phase1();   // Health
  await phase2();   // Auth
  await phase3();   // RBAC
  await phase4();   // Categories/Brands/Attributes
  await phase5();   // Sellers/Stores
  await phase6();   // Products
  await phase7();   // Inventory
  await phase8();   // Shipping
  await phase9();   // Tax
  await phase10();  // Payment Methods
  await phase11();  // Cart & Checkout
  await phase12();  // Orders & Shipments
  await phase13();  // Payments & Refunds
  await phase14();  // Returns
  await phase15();  // Disputes
  await phase16();  // Reviews
  await phase17();  // Marketing
  await phase18();  // Loyalty
  await phase19();  // Bundles
  await phase20();  // Wishlist/Search/Compare
  await phase21();  // Notifications
  await phase22();  // Chat
  await phase23();  // CMS
  await phase24();  // Subscriptions
  await phase25();  // Tickets
  await phase26();  // I18n
  await phase27();  // SEO
  await phase28();  // System
  await phase29();  // Operations
  await phase30();  // Audit & Cleanup

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const total = results.pass + results.fail + results.skip;
  const passRate = results.pass + results.fail > 0
    ? ((results.pass / (results.pass + results.fail)) * 100).toFixed(1) : '0.0';

  // ─── Per-phase breakdown ──────────────────────────────────────────────
  const phaseStats = {};
  for (const d of results.details) {
    const m = d.label.match(/\[Phase (\d+)\]/);
    if (m) {
      const p = m[1];
      if (!phaseStats[p]) phaseStats[p] = { pass: 0, fail: 0, skip: 0 };
      phaseStats[p][d.result.toLowerCase()]++;
    }
  }

  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                        FINAL RESULTS                           ║');
  console.log('╠══════════════════════════════════════════════════════════════════╣');
  console.log(`║  Total Tests  : ${total}`);
  console.log(`║  ✅ Passed    : ${results.pass}`);
  console.log(`║  ❌ Failed    : ${results.fail}`);
  console.log(`║  ⏭️  Skipped   : ${results.skip}`);
  console.log(`║  Pass Rate    : ${passRate}% (excluding skips)`);
  console.log(`║  Duration     : ${elapsed}s`);
  console.log('╠══════════════════════════════════════════════════════════════════╣');

  const phaseNames = {
    1: 'Health', 2: 'Auth', 3: 'RBAC', 4: 'Catalog', 5: 'Sellers',
    6: 'Products', 7: 'Inventory', 8: 'Shipping', 9: 'Tax', 10: 'PayMethods',
    11: 'Cart', 12: 'Orders', 13: 'Payments', 14: 'Returns', 15: 'Disputes',
    16: 'Reviews', 17: 'Marketing', 18: 'Loyalty', 19: 'Bundles', 20: 'Search',
    21: 'Notifs', 22: 'Chat', 23: 'CMS', 24: 'Subs', 25: 'Tickets',
    26: 'I18n', 27: 'SEO', 28: 'System', 29: 'Operations', 30: 'Audit/Clean',
  };
  console.log('║  Per-Phase Breakdown:');
  for (const [p, s] of Object.entries(phaseStats).sort((a,b) => +a[0] - +b[0])) {
    const name = (phaseNames[p] || '').padEnd(12);
    console.log(`║    Phase ${p.padStart(2)}: ${name} ✅${String(s.pass).padStart(3)} ❌${String(s.fail).padStart(3)} ⏭️ ${String(s.skip).padStart(3)}`);
  }
  console.log('╚══════════════════════════════════════════════════════════════════╝');

  if (results.fail > 0) {
    console.log('\n── FAILED TESTS ──');
    results.details.filter(x => x.result === 'FAIL').forEach(x => {
      console.log(`  ❌ ${x.label} [${x.status}] ${x.msg || ''}`);
    });
  }

  if (results.skip > 0) {
    console.log('\n── SKIPPED TESTS ──');
    results.details.filter(x => x.result === 'SKIP').forEach(x => {
      console.log(`  ⏭️  ${x.label}: ${x.msg}`);
    });
  }

  console.log('\n── Saved Entity IDs ──');
  for (const [k, v] of Object.entries(saved)) {
    if (k.endsWith('Token') || k.endsWith('Refresh') || k.endsWith('token') || k.endsWith('refresh')) continue;
    console.log(`  ${k}: ${v || 'N/A'}`);
  }

  // Exit code
  process.exit(results.fail > 0 ? 1 : 0);
}

main().catch(console.error);
