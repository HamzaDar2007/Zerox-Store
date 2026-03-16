import { test as base, type Page } from '@playwright/test'

/* ── Mock Data ── */
const mockUser = { id: 'e2e-user', email: 'admin@test.com', firstName: 'Admin', lastName: 'User', role: 'super_admin', isActive: true, isEmailVerified: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
const mockUsers = [mockUser, { id: 'u2', email: 'seller@test.com', firstName: 'Seller', lastName: 'One', role: 'seller', isActive: true, isEmailVerified: true, createdAt: '2024-01-02', updatedAt: '2024-01-02' }]
const mockRoles = [{ id: 'r1', name: 'super_admin', description: 'Full access', isSystem: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' }, { id: 'r2', name: 'admin', description: 'Admin access', isSystem: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' }, { id: 'r3', name: 'seller', description: 'Seller access', isSystem: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' }]
const mockPermissions = [{ id: 'p1', code: 'users:read', module: 'users', description: 'Read users', createdAt: '2024-01-01' }, { id: 'p2', code: 'users:write', module: 'users', description: 'Write users', createdAt: '2024-01-01' }]
const mockCategories = [{ id: 'c1', name: 'Electronics', slug: 'electronics', sortOrder: 1, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' }]
const mockBrands = [{ id: 'b1', name: 'TestBrand', slug: 'testbrand', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' }]
const mockSellers = [{ id: 's1', userId: 'u2', displayName: 'SellerOne', status: 'approved', createdAt: '2024-01-01', updatedAt: '2024-01-01' }]
const mockStores = [{ id: 'st1', sellerId: 's1', name: 'TestStore', slug: 'teststore', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' }]
const mockProducts = [{ id: 'pr1', storeId: 'st1', name: 'TestProduct', slug: 'test-product', basePrice: 29.99, status: 'active', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' }]
const mockOrders = [{ id: 'o1', userId: 'e2e-user', status: 'pending', subtotal: 100, discountAmount: 0, shippingAmount: 5, taxAmount: 8, total: 113, createdAt: '2024-01-01', updatedAt: '2024-01-01' }]
const mockPayments = [{ id: 'pay1', orderId: 'o1', userId: 'e2e-user', gateway: 'stripe', amount: 113, currency: 'USD', status: 'completed', createdAt: '2024-01-01', updatedAt: '2024-01-01' }]
const mockCoupons = [{ id: 'cp1', code: 'SAVE10', discountType: 'percentage', discountValue: 10, usedCount: 0, isActive: true, startsAt: '2024-01-01', expiresAt: '2025-01-01', createdAt: '2024-01-01', updatedAt: '2024-01-01' }]
const mockFlashSales = [{ id: 'fs1', name: 'Summer Sale', isActive: true, startsAt: '2024-06-01', endsAt: '2024-06-30', createdAt: '2024-01-01', updatedAt: '2024-01-01' }]
const mockWarehouses = [{ id: 'w1', code: 'WH-01', name: 'Main Warehouse', city: 'New York', country: 'US', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' }]
const mockInventory = [{ id: 'inv1', warehouseId: 'w1', variantId: 'v1', qtyOnHand: 100, qtyReserved: 10, qtyAvailable: 90, lowStockThreshold: 20 }]
const mockZones = [{ id: 'z1', name: 'Domestic', isActive: true, createdAt: '2024-01-01' }]
const mockMethods = [{ id: 'm1', zoneId: 'z1', name: 'Standard', price: 5.99, minDeliveryDays: 3, maxDeliveryDays: 7, isActive: true, createdAt: '2024-01-01' }]
const mockPlans = [{ id: 'pl1', name: 'Pro', price: 29.99, currency: 'USD', interval: 'month', intervalCount: 1, trialDays: 14, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' }]
const mockReturns = [{ id: 'ret1', orderId: 'o1', userId: 'e2e-user', reason: 'Defective', status: 'pending', createdAt: '2024-01-01', updatedAt: '2024-01-01' }]
const mockReviews = [{ id: 'rev1', productId: 'pr1', userId: 'e2e-user', rating: 5, title: 'Great!', body: 'Love it', isVerified: true, status: 'approved', createdAt: '2024-01-01', updatedAt: '2024-01-01' }]
const mockNotifications = [{ id: 'n1', userId: 'e2e-user', channel: 'in_app', type: 'order', title: 'New Order', body: 'You have a new order', isRead: false, sentAt: '2024-01-01', createdAt: '2024-01-01' }]
const mockAuditLogs = [{ id: 'al1', action: 'CREATE', tableName: 'users', recordId: 'u2', ip: '127.0.0.1', occurredAt: '2024-01-01', createdAt: '2024-01-01' }]
const mockChatThreads = [{ id: 'th1', status: 'open', createdAt: '2024-01-01', updatedAt: '2024-01-01' }]
const mockChatMessages = [{ id: 'msg1', threadId: 'th1', senderId: 'e2e-user', body: 'Hello', sentAt: '2024-01-01' }]

function wrap(data: unknown, total?: number) {
  const arr = Array.isArray(data) ? data : [data]
  return { success: true, data, total: total ?? arr.length, page: 1, limit: 20, totalPages: 1, timestamp: new Date().toISOString() }
}

function wrapSingle(data: unknown) {
  return { success: true, data, timestamp: new Date().toISOString() }
}

/** Mock all backend API calls with realistic data. */
async function mockApi(page: Page) {
  await page.route('**/localhost:3001/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()

    // Auth endpoints
    if (url.includes('/auth/login')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrapSingle({ accessToken: 'e2e-access-token', refreshToken: 'e2e-refresh-token', user: mockUser })) })
    if (url.includes('/auth/refresh') || url.includes('/auth/logout')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrapSingle({ accessToken: 'e2e-access-token', refreshToken: 'e2e-refresh-token' })) })
    if (url.includes('/auth/forgot-password') || url.includes('/auth/reset-password') || url.includes('/auth/change-password')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrapSingle({})) })

    // Entity endpoints
    if (method === 'GET') {
      if (url.includes('/users') && !url.includes('/roles') && !url.includes('/addresses')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap(mockUsers, 2)) })
      if (url.includes('/roles')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap(mockRoles)) })
      if (url.includes('/permissions')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap(mockPermissions)) })
      if (url.includes('/role-permissions')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap([])) })
      if (url.includes('/categories')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap(mockCategories)) })
      if (url.includes('/brands')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap(mockBrands)) })
      if (url.includes('/sellers')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap(mockSellers)) })
      if (url.includes('/stores')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap(mockStores)) })
      if (url.includes('/products/attributes')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap([])) })
      if (url.includes('/products')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap(mockProducts, 1)) })
      if (url.includes('/orders') && url.includes('/items')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap([])) })
      if (url.includes('/orders')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap(mockOrders, 1)) })
      if (url.includes('/payments')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap(mockPayments, 1)) })
      if (url.includes('/coupons')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap(mockCoupons)) })
      if (url.includes('/flash-sales')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap(mockFlashSales)) })
      if (url.includes('/warehouses')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap(mockWarehouses)) })
      if (url.includes('/inventory/low-stock')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap(mockInventory.filter(i => i.qtyAvailable <= i.lowStockThreshold))) })
      if (url.includes('/inventory')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap(mockInventory)) })
      if (url.includes('/shipping/zones')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap(mockZones)) })
      if (url.includes('/shipping/methods')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap(mockMethods)) })
      if (url.includes('/shipping/order')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap([])) })
      if (url.includes('/subscriptions/plans')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap(mockPlans)) })
      if (url.includes('/subscriptions/mine')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap([])) })
      if (url.includes('/returns') && url.includes('/items')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap([])) })
      if (url.includes('/returns')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap(mockReturns, 1)) })
      if (url.includes('/reviews')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap(mockReviews, 1)) })
      if (url.includes('/notifications/mine/unread-count')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrapSingle({ count: 3 })) })
      if (url.includes('/notifications')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap(mockNotifications, 1)) })
      if (url.includes('/audit-logs')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap(mockAuditLogs, 1)) })
      if (url.includes('/chat/mine/threads')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap(mockChatThreads)) })
      if (url.includes('/chat/threads') && url.includes('/messages')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap(mockChatMessages)) })
      if (url.includes('/search/popular')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrapSingle([{ query: 'laptop', count: 42 }, { query: 'phone', count: 28 }])) })
      if (url.includes('/search/history')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrapSingle([{ id: 'sq1', query: 'laptop', resultCount: 15, searchedAt: '2024-01-01' }])) })
      // Fallback GET
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap([])) })
    }

    // POST/PUT/PATCH/DELETE → return contextual success data
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      try {
        const body = route.request().postDataJSON()
        const merged = { id: 'new-' + Date.now(), createdAt: '2024-01-15', updatedAt: '2024-01-15', ...body }
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrapSingle(merged)) })
      } catch {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrapSingle({ id: 'new-item', success: true })) })
      }
    }
    if (method === 'DELETE') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrapSingle({ deleted: true })) })
    }

    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrapSingle({})) })
  })

  // Also handle /api/ prefix
  await page.route('**/api/**', async (route) => {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrapSingle({})) })
  })
}

/**
 * Inject auth tokens into localStorage so protected routes are accessible.
 */
async function seedAuth(page: Page) {
  await mockApi(page)
  await page.goto('/')
  await page.evaluate(() => {
    const state = {
      state: {
        user: { id: 'e2e-user', email: 'admin@test.com', firstName: 'Admin', lastName: 'User', role: 'super_admin', isActive: true, isEmailVerified: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        accessToken: 'e2e-access-token',
        refreshToken: 'e2e-refresh-token',
        isAuthenticated: true,
      },
      version: 0,
    }
    localStorage.setItem('admin-auth', JSON.stringify(state))
  })
  await page.goto('/')
  await page.waitForTimeout(500)
}

export const test = base.extend<{ authedPage: Page }>({
  authedPage: async ({ page }, use) => {
    await seedAuth(page)
    await use(page)
  },
})

export { expect } from '@playwright/test'
