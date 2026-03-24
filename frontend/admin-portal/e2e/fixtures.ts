import { test as base, type Page } from '@playwright/test'

/* ── Mock Data ── */
export const mockUser = {
  id: 'e2e-user', email: 'admin@test.com', firstName: 'Admin', lastName: 'User',
  role: 'super_admin', isActive: true, isEmailVerified: true,
  createdAt: '2024-01-01', updatedAt: '2024-01-01',
}

export const mockSellerUser = {
  id: 'seller-user', email: 'seller@test.com', firstName: 'Seller', lastName: 'One',
  role: 'seller', isActive: true, isEmailVerified: true,
  createdAt: '2024-01-02', updatedAt: '2024-01-02',
}

export const mockUsers = [
  mockUser, mockSellerUser,
  { id: 'u3', email: 'manager@test.com', firstName: 'Manager', lastName: 'Two', role: 'admin', isActive: false, isEmailVerified: true, createdAt: '2024-01-03', updatedAt: '2024-01-03' },
]

export const mockRoles = [
  { id: 'r1', name: 'super_admin', description: 'Full access', isSystem: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r2', name: 'admin', description: 'Admin access', isSystem: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'r3', name: 'seller', description: 'Seller access', isSystem: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
]

export const mockPermissions = [
  { id: 'p1', code: 'users:read', module: 'users', description: 'Read users', createdAt: '2024-01-01' },
  { id: 'p2', code: 'users:write', module: 'users', description: 'Write users', createdAt: '2024-01-01' },
  { id: 'p3', code: 'orders:read', module: 'orders', description: 'Read orders', createdAt: '2024-01-01' },
]

export const mockCategories = [
  { id: 'c1', name: 'Electronics', slug: 'electronics', sortOrder: 1, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'c2', name: 'Clothing', slug: 'clothing', sortOrder: 2, isActive: true, createdAt: '2024-01-02', updatedAt: '2024-01-02' },
  { id: 'c3', name: 'Books', slug: 'books', sortOrder: 3, isActive: false, createdAt: '2024-01-03', updatedAt: '2024-01-03' },
]

export const mockBrands = [
  { id: 'b1', name: 'TestBrand', slug: 'testbrand', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'b2', name: 'AnotherBrand', slug: 'anotherbrand', isActive: false, createdAt: '2024-01-02', updatedAt: '2024-01-02' },
]

export const mockSellers = [
  { id: 's1', userId: 'seller-user', displayName: 'SellerOne', legalName: 'Seller One LLC', commissionRate: 10, status: 'approved', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 's2', userId: 'u3', displayName: 'PendingSeller', legalName: 'Pending Inc', commissionRate: 15, status: 'pending', createdAt: '2024-01-02', updatedAt: '2024-01-02' },
]

export const mockStores = [
  { id: 'st1', sellerId: 's1', name: 'TestStore', slug: 'teststore', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'st2', sellerId: 's1', name: 'SecondStore', slug: 'secondstore', isActive: false, createdAt: '2024-01-02', updatedAt: '2024-01-02' },
]

export const mockProducts = [
  { id: 'pr1', storeId: 'st1', name: 'TestProduct', slug: 'test-product', basePrice: 29.99, status: 'active', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'pr2', storeId: 'st1', name: 'DraftProduct', slug: 'draft-product', basePrice: 49.99, status: 'draft', isActive: false, createdAt: '2024-01-02', updatedAt: '2024-01-02' },
  { id: 'pr3', storeId: 'st2', name: 'ArchivedProduct', slug: 'archived-product', basePrice: 9.99, status: 'archived', isActive: false, createdAt: '2024-01-03', updatedAt: '2024-01-03' },
]

export const mockVariants = [
  { id: 'v1', productId: 'pr1', sku: 'SKU-001', price: 29.99, weightGrams: 500, isActive: true, createdAt: '2024-01-01' },
  { id: 'v2', productId: 'pr1', sku: 'SKU-002', price: 34.99, weightGrams: 600, isActive: true, createdAt: '2024-01-02' },
]

export const mockProductImages = [
  { id: 'img1', productId: 'pr1', url: 'https://example.com/img1.jpg', sortOrder: 1, createdAt: '2024-01-01' },
]

export const mockOrders = [
  { id: 'o1', userId: 'e2e-user', status: 'pending', subtotal: 100, discountAmount: 0, shippingAmount: 5, taxAmount: 8, total: 113, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'o2', userId: 'seller-user', status: 'shipped', subtotal: 200, discountAmount: 10, shippingAmount: 10, taxAmount: 16, total: 216, createdAt: '2024-01-02', updatedAt: '2024-01-02' },
  { id: 'o3', userId: 'e2e-user', status: 'delivered', subtotal: 50, discountAmount: 0, shippingAmount: 5, taxAmount: 4, total: 59, createdAt: '2024-01-03', updatedAt: '2024-01-03' },
]

export const mockOrderItems = [
  { id: 'oi1', orderId: 'o1', variantId: 'v1', productName: 'TestProduct', quantity: 2, unitPrice: 29.99, total: 59.98 },
  { id: 'oi2', orderId: 'o1', variantId: 'v2', productName: 'TestProduct', quantity: 1, unitPrice: 34.99, total: 34.99 },
]

export const mockPayments = [
  { id: 'pay1', orderId: 'o1', userId: 'e2e-user', gateway: 'stripe', method: 'card', amount: 113, currency: 'USD', status: 'completed', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'pay2', orderId: 'o2', userId: 'seller-user', gateway: 'paypal', method: 'paypal', amount: 216, currency: 'USD', status: 'pending', createdAt: '2024-01-02', updatedAt: '2024-01-02' },
]

export const mockCoupons = [
  { id: 'cp1', code: 'SAVE10', discountType: 'percentage', discountValue: 10, usedCount: 5, isActive: true, startsAt: '2024-01-01', expiresAt: '2025-12-31', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'cp2', code: 'FLAT20', discountType: 'fixed', discountValue: 20, usedCount: 0, isActive: false, startsAt: '2024-06-01', expiresAt: '2024-12-31', createdAt: '2024-01-02', updatedAt: '2024-01-02' },
]

export const mockCouponScopes = [
  { id: 'cs1', couponId: 'cp1', scopeType: 'product', scopeId: 'pr1' },
]

export const mockFlashSales = [
  { id: 'fs1', name: 'Summer Sale', isActive: true, startsAt: '2024-06-01', endsAt: '2024-06-30', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'fs2', name: 'Winter Clearance', isActive: false, startsAt: '2025-01-01', endsAt: '2025-01-31', createdAt: '2024-01-02', updatedAt: '2024-01-02' },
]

export const mockFlashSaleItems = [
  { id: 'fsi1', flashSaleId: 'fs1', variantId: 'v1', salePrice: 19.99, qtyLimit: 100, qtySold: 25 },
]

export const mockWarehouses = [
  { id: 'w1', code: 'WH-01', name: 'Main Warehouse', line1: '123 Main St', city: 'New York', country: 'US', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'w2', code: 'WH-02', name: 'West Warehouse', line1: '456 West Ave', city: 'Los Angeles', country: 'US', isActive: true, createdAt: '2024-01-02', updatedAt: '2024-01-02' },
]

export const mockInventory = [
  { id: 'inv1', warehouseId: 'w1', variantId: 'v1', qtyOnHand: 100, qtyReserved: 10, qtyAvailable: 90, lowStockThreshold: 20 },
  { id: 'inv2', warehouseId: 'w1', variantId: 'v2', qtyOnHand: 5, qtyReserved: 2, qtyAvailable: 3, lowStockThreshold: 10 },
]

export const mockZones = [
  { id: 'z1', name: 'Domestic', isActive: true, createdAt: '2024-01-01' },
  { id: 'z2', name: 'International', isActive: false, createdAt: '2024-01-02' },
]

export const mockMethods = [
  { id: 'm1', zoneId: 'z1', name: 'Standard', baseRate: 5.99, perKgRate: 1.00, carrier: 'USPS', estimatedDaysMin: 3, estimatedDaysMax: 7, isActive: true, createdAt: '2024-01-01' },
  { id: 'm2', zoneId: 'z1', name: 'Express', baseRate: 12.99, perKgRate: 2.00, carrier: 'UPS', estimatedDaysMin: 1, estimatedDaysMax: 3, isActive: true, createdAt: '2024-01-02' },
]

export const mockShipments = [
  { id: 'sh1', orderId: 'o1', warehouseId: 'w1', shippingMethodId: 'm1', status: 'shipped', trackingNumber: 'TRK123', carrier: 'USPS', createdAt: '2024-01-01' },
]

export const mockShipmentEvents = [
  { id: 'se1', shipmentId: 'sh1', status: 'picked_up', location: 'New York, NY', description: 'Package picked up', createdAt: '2024-01-01' },
  { id: 'se2', shipmentId: 'sh1', status: 'in_transit', location: 'Chicago, IL', description: 'Package in transit', createdAt: '2024-01-02' },
]

export const mockPlans = [
  { id: 'pl1', name: 'Pro', description: 'Professional plan', price: 29.99, currency: 'USD', interval: 'month', intervalCount: 1, trialDays: 14, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'pl2', name: 'Enterprise', description: 'Enterprise plan', price: 99.99, currency: 'USD', interval: 'year', intervalCount: 1, trialDays: 30, isActive: true, createdAt: '2024-01-02', updatedAt: '2024-01-02' },
]

export const mockSubscriptions = [
  { id: 'sub1', userId: 'e2e-user', planId: 'pl1', status: 'active', gateway: 'stripe', periodStart: '2024-01-01', periodEnd: '2024-02-01', createdAt: '2024-01-01' },
]

export const mockReturns = [
  { id: 'ret1', orderId: 'o1', userId: 'e2e-user', reason: 'Defective', status: 'pending', refundAmount: 59.98, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'ret2', orderId: 'o2', userId: 'seller-user', reason: 'Wrong item', status: 'approved', refundAmount: 100, createdAt: '2024-01-02', updatedAt: '2024-01-02' },
]

export const mockReturnItems = [
  { id: 'ri1', returnId: 'ret1', variantId: 'v1', quantity: 2, reason: 'Defective product' },
]

export const mockReviews = [
  { id: 'rev1', productId: 'pr1', userId: 'e2e-user', rating: 5, title: 'Great!', body: 'Love this product', isVerified: true, status: 'approved', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'rev2', productId: 'pr2', userId: 'seller-user', rating: 2, title: 'Not good', body: 'Disappointing quality', isVerified: false, status: 'pending', createdAt: '2024-01-02', updatedAt: '2024-01-02' },
]

export const mockNotifications = [
  { id: 'n1', userId: 'e2e-user', channel: 'in_app', type: 'order', title: 'New Order', body: 'You have a new order', isRead: false, sentAt: '2024-01-01', createdAt: '2024-01-01' },
  { id: 'n2', userId: 'e2e-user', channel: 'email', type: 'info', title: 'Welcome', body: 'Welcome to the platform', isRead: true, sentAt: '2024-01-02', createdAt: '2024-01-02' },
  { id: 'n3', userId: 'e2e-user', channel: 'in_app', type: 'warning', title: 'Low Stock', body: 'Some items are running low', isRead: false, sentAt: '2024-01-03', createdAt: '2024-01-03' },
]

export const mockAuditLogs = [
  { id: 'al1', action: 'CREATE', tableName: 'users', recordId: 'u2', actorId: 'e2e-user', ip: '127.0.0.1', oldData: null, newData: { email: 'seller@test.com' }, occurredAt: '2024-01-01', createdAt: '2024-01-01' },
  { id: 'al2', action: 'UPDATE', tableName: 'orders', recordId: 'o1', actorId: 'e2e-user', ip: '127.0.0.1', oldData: { status: 'pending' }, newData: { status: 'confirmed' }, occurredAt: '2024-01-02', createdAt: '2024-01-02' },
]

export const mockChatThreads = [
  { id: 'th1', status: 'open', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'th2', status: 'resolved', createdAt: '2024-01-02', updatedAt: '2024-01-02' },
]

export const mockChatMessages = [
  { id: 'msg1', threadId: 'th1', senderId: 'e2e-user', body: 'Hello, I need help', sentAt: '2024-01-01' },
  { id: 'msg2', threadId: 'th1', senderId: 'seller-user', body: 'Sure, how can I assist?', sentAt: '2024-01-01' },
]

export const mockChatParticipants = [
  { id: 'cp1', threadId: 'th1', userId: 'e2e-user', joinedAt: '2024-01-01' },
  { id: 'cp2', threadId: 'th1', userId: 'seller-user', joinedAt: '2024-01-01' },
]

export const mockUserRoles = [
  { id: 'ur1', userId: 'e2e-user', roleId: 'r1', role: { id: 'r1', name: 'super_admin' }, createdAt: '2024-01-01' },
]

export const mockUserAddresses = [
  { id: 'addr1', userId: 'e2e-user', label: 'Home', line1: '123 Main St', line2: '', city: 'New York', state: 'NY', postalCode: '10001', country: 'US', createdAt: '2024-01-01' },
]

export const mockZoneCountries = [
  { id: 'zc1', zoneId: 'z1', countryCode: 'US' },
  { id: 'zc2', zoneId: 'z1', countryCode: 'CA' },
]

/* ── Response Wrappers ── */
export function wrap(data: unknown, total?: number) {
  const arr = Array.isArray(data) ? data : [data]
  return { success: true, data, total: total ?? arr.length, page: 1, limit: 20, totalPages: 1, timestamp: new Date().toISOString() }
}

export function wrapSingle(data: unknown) {
  return { success: true, data, timestamp: new Date().toISOString() }
}

function json(data: unknown, status = 200) {
  return { status, contentType: 'application/json', body: JSON.stringify(data) }
}

/* ── API Router ── */
async function mockApi(page: Page) {
  await page.route('**/localhost:3001/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()

    // Auth endpoints
    if (url.includes('/auth/login')) return route.fulfill(json(wrapSingle({ accessToken: 'e2e-access-token', refreshToken: 'e2e-refresh-token', user: mockUser })))
    if (url.includes('/auth/refresh') || url.includes('/auth/logout')) return route.fulfill(json(wrapSingle({ accessToken: 'e2e-access-token', refreshToken: 'e2e-refresh-token' })))
    if (url.includes('/auth/forgot-password') || url.includes('/auth/reset-password') || url.includes('/auth/change-password')) return route.fulfill(json(wrapSingle({})))

    if (method === 'GET') {
      // User sub-resources (before /users)
      if (url.match(/\/users\/[^/]+\/roles/)) return route.fulfill(json(wrap(mockUserRoles)))
      if (url.match(/\/users\/[^/]+\/addresses/)) return route.fulfill(json(wrap(mockUserAddresses)))
      if (url.includes('/users')) return route.fulfill(json(wrap(mockUsers, 3)))

      if (url.includes('/role-permissions')) return route.fulfill(json(wrap(mockPermissions.map(p => p.id))))
      if (url.includes('/roles')) return route.fulfill(json(wrap(mockRoles)))
      if (url.includes('/permissions')) return route.fulfill(json(wrap(mockPermissions)))

      if (url.includes('/categories')) return route.fulfill(json(wrap(mockCategories, 3)))
      if (url.includes('/brands')) return route.fulfill(json(wrap(mockBrands, 2)))
      if (url.includes('/sellers')) return route.fulfill(json(wrap(mockSellers, 2)))
      if (url.includes('/stores')) return route.fulfill(json(wrap(mockStores, 2)))

      // Products sub-resources (before /products)
      if (url.match(/\/products\/[^/]+\/variants/)) return route.fulfill(json(wrap(mockVariants)))
      if (url.match(/\/products\/[^/]+\/images/)) return route.fulfill(json(wrap(mockProductImages)))
      if (url.includes('/products/attributes') && url.includes('/values')) return route.fulfill(json(wrap([])))
      if (url.includes('/products/attributes')) return route.fulfill(json(wrap([])))
      if (url.includes('/products')) return route.fulfill(json(wrap(mockProducts, 3)))

      // Orders sub-resources
      if (url.match(/\/orders\/[^/]+\/items/)) return route.fulfill(json(wrap(mockOrderItems)))
      if (url.includes('/orders')) return route.fulfill(json(wrap(mockOrders, 3)))

      if (url.includes('/payments')) return route.fulfill(json(wrap(mockPayments, 2)))

      // Coupons sub-resources
      if (url.match(/\/coupons\/[^/]+\/scopes/)) return route.fulfill(json(wrap(mockCouponScopes)))
      if (url.includes('/coupons')) return route.fulfill(json(wrap(mockCoupons, 2)))

      // Flash sale sub-resources
      if (url.match(/\/flash-sales\/[^/]+\/items/)) return route.fulfill(json(wrap(mockFlashSaleItems)))
      if (url.includes('/flash-sales')) return route.fulfill(json(wrap(mockFlashSales, 2)))

      if (url.includes('/warehouses')) return route.fulfill(json(wrap(mockWarehouses, 2)))
      if (url.includes('/inventory/low-stock')) return route.fulfill(json(wrap(mockInventory.filter(i => i.qtyAvailable <= i.lowStockThreshold))))
      if (url.includes('/inventory')) return route.fulfill(json(wrap(mockInventory, 2)))

      // Shipping sub-resources
      if (url.match(/\/shipping\/zones\/[^/]+\/countries/)) return route.fulfill(json(wrap(mockZoneCountries)))
      if (url.includes('/shipping/zones')) return route.fulfill(json(wrap(mockZones, 2)))
      if (url.includes('/shipping/methods')) return route.fulfill(json(wrap(mockMethods, 2)))
      if (url.match(/\/shipping\/order\/[^/]+\/shipments/)) return route.fulfill(json(wrap(mockShipments)))
      if (url.match(/\/shipping\/shipments\/[^/]+\/events/)) return route.fulfill(json(wrap(mockShipmentEvents)))
      if (url.includes('/shipping/order')) return route.fulfill(json(wrap([])))

      if (url.includes('/subscriptions/plans')) return route.fulfill(json(wrap(mockPlans, 2)))
      if (url.match(/\/subscriptions\/[^/]+$/) && !url.includes('/mine')) return route.fulfill(json(wrapSingle(mockSubscriptions[0])))
      if (url.includes('/subscriptions/mine') || url.includes('/subscriptions?')) return route.fulfill(json(wrap(mockSubscriptions, 1)))

      // Returns sub-resources
      if (url.match(/\/returns\/[^/]+\/items/)) return route.fulfill(json(wrap(mockReturnItems)))
      if (url.includes('/returns')) return route.fulfill(json(wrap(mockReturns, 2)))

      if (url.includes('/reviews')) return route.fulfill(json(wrap(mockReviews, 2)))

      if (url.includes('/notifications/mine/unread-count')) return route.fulfill(json(wrapSingle({ count: 2 })))
      if (url.includes('/notifications')) return route.fulfill(json(wrap(mockNotifications, 3)))

      if (url.includes('/audit-logs')) return route.fulfill(json(wrap(mockAuditLogs, 2)))

      if (url.includes('/chat/mine/threads')) return route.fulfill(json(wrap(mockChatThreads, 2)))
      if (url.match(/\/chat\/threads\/[^/]+\/participants/)) return route.fulfill(json(wrap(mockChatParticipants)))
      if (url.match(/\/chat\/threads\/[^/]+\/messages/)) return route.fulfill(json(wrap(mockChatMessages, 2)))

      if (url.includes('/search/popular')) return route.fulfill(json(wrapSingle([{ query: 'laptop', count: 42 }, { query: 'phone', count: 28 }, { query: 'tablet', count: 15 }])))
      if (url.includes('/search/history')) return route.fulfill(json(wrapSingle([{ id: 'sq1', query: 'laptop', resultCount: 15, clicked: true, searchedAt: '2024-01-01' }, { id: 'sq2', query: 'phone case', resultCount: 8, clicked: false, searchedAt: '2024-01-02' }])))

      // Fallback GET
      return route.fulfill(json(wrap([])))
    }

    // POST/PUT/PATCH/DELETE
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      try {
        const body = route.request().postDataJSON()
        const merged = { id: 'new-' + Date.now(), createdAt: '2024-01-15', updatedAt: '2024-01-15', ...body }
        return route.fulfill(json(wrapSingle(merged)))
      } catch {
        return route.fulfill(json(wrapSingle({ id: 'new-item', success: true })))
      }
    }
    if (method === 'DELETE') {
      return route.fulfill(json(wrapSingle({ deleted: true })))
    }

    return route.fulfill(json(wrapSingle({})))
  })

  await page.route('**/api/**', async (route) => {
    return route.fulfill(json(wrapSingle({})))
  })
}

/* ── Empty-state API mock ── */
async function mockEmptyApi(page: Page) {
  await page.route('**/localhost:3001/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()
    if (url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/logout'))
      return route.fulfill(json(wrapSingle({ accessToken: 'e2e-access', refreshToken: 'e2e-refresh', user: mockUser })))
    if (url.includes('/auth/')) return route.fulfill(json(wrapSingle({})))
    if (method === 'GET') {
      if (url.includes('/notifications/mine/unread-count')) return route.fulfill(json(wrapSingle({ count: 0 })))
      if (url.includes('/search/popular')) return route.fulfill(json(wrapSingle([])))
      if (url.includes('/search/history')) return route.fulfill(json(wrapSingle([])))
      return route.fulfill(json(wrap([], 0)))
    }
    return route.fulfill(json(wrapSingle({})))
  })
  await page.route('**/api/**', async (route) => route.fulfill(json(wrapSingle({}))))
}

/* ── Error-state API mock ── */
async function mockErrorApi(page: Page) {
  await page.route('**/localhost:3001/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()
    if (url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/logout'))
      return route.fulfill(json(wrapSingle({ accessToken: 'e2e-access', refreshToken: 'e2e-refresh', user: mockUser })))
    if (url.includes('/auth/')) return route.fulfill(json(wrapSingle({})))
    if (url.includes('/notifications/mine/unread-count')) return route.fulfill(json(wrapSingle({ count: 0 })))
    if (method === 'GET') return route.fulfill(json({ success: false, message: 'Internal server error' }, 500))
    return route.fulfill(json({ success: false, message: 'Internal server error' }, 500))
  })
  await page.route('**/api/**', async (route) => route.fulfill(json({ success: false }, 500)))
}

/* ── Auth state helpers ── */
function authState(user: typeof mockUser) {
  return {
    state: { user, accessToken: 'e2e-access-token', refreshToken: 'e2e-refresh-token', isAuthenticated: true },
    version: 0,
  }
}

async function seedAuth(page: Page, user = mockUser) {
  await mockApi(page)
  await page.goto('/')
  await page.evaluate((s) => localStorage.setItem('admin-auth', JSON.stringify(s)), authState(user))
  await page.goto('/')
  await page.waitForURL('**/')
}

/* ── Fixtures ── */
export const test = base.extend<{
  authedPage: Page
  sellerPage: Page
  emptyPage: Page
  errorPage: Page
}>({
  authedPage: async ({ page }, use) => {
    await seedAuth(page, mockUser)
    await use(page)
  },
  sellerPage: async ({ page }, use) => {
    await mockApi(page)
    await page.goto('/')
    await page.evaluate((s) => localStorage.setItem('admin-auth', JSON.stringify(s)), authState(mockSellerUser))
    await page.goto('/')
    await page.waitForURL('**/')
    await use(page)
  },
  emptyPage: async ({ page }, use) => {
    await mockEmptyApi(page)
    await page.goto('/')
    await page.evaluate((s) => localStorage.setItem('admin-auth', JSON.stringify(s)), authState(mockUser))
    await page.goto('/')
    await page.waitForURL('**/')
    await use(page)
  },
  errorPage: async ({ page }, use) => {
    await mockErrorApi(page)
    await page.goto('/')
    await page.evaluate((s) => localStorage.setItem('admin-auth', JSON.stringify(s)), authState(mockUser))
    await page.goto('/')
    await page.waitForURL('**/')
    await use(page)
  },
})

export { expect } from '@playwright/test'
