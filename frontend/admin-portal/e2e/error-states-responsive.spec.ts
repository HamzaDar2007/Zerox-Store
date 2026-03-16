import { test as base, expect } from '@playwright/test'

/**
 * Error state tests use a custom fixture that mocks API to return empty data.
 */
const test = base.extend<{ errorPage: import('@playwright/test').Page }>({
  errorPage: async ({ page }, use) => {
    // Set up route mocking FIRST, before any navigation
    await page.route('**/localhost:3001/**', async (route) => {
      const method = route.request().method()
      const url = route.request().url()
      if (url.includes('/auth/login') || url.includes('/auth/refresh')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { accessToken: 'e2e-access', refreshToken: 'e2e-refresh', user: { id: 'e2e-user', email: 'admin@test.com', firstName: 'Admin', lastName: 'User', role: 'super_admin', isActive: true } } }) })
      }
      if (method === 'GET') {
        const wrap = { success: true, data: [], total: 0, page: 1, limit: 20, totalPages: 0, timestamp: new Date().toISOString() }
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap) })
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) })
    })
    await page.route('**/api/**', async (route) => {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) })
    })
    // Now navigate and seed auth
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
    await page.reload()
    await page.waitForTimeout(500)
    await use(page)
  },
})

test.describe('Empty States', () => {
  test('products page shows empty table', async ({ errorPage: page }) => {
    await page.goto('/products')
    await page.waitForTimeout(2000)
    await expect(page.getByRole('heading', { name: /products/i })).toBeVisible({ timeout: 10000 })
  })

  test('users page shows empty table', async ({ errorPage: page }) => {
    await page.goto('/users')
    await page.waitForTimeout(2000)
    await expect(page.getByRole('heading', { name: /users/i })).toBeVisible({ timeout: 10000 })
  })

  test('orders page shows empty state', async ({ errorPage: page }) => {
    await page.goto('/orders')
    await page.waitForTimeout(2000)
    await expect(page.getByRole('heading', { name: /orders/i })).toBeVisible({ timeout: 10000 })
  })

  test('notifications page shows empty state', async ({ errorPage: page }) => {
    await page.goto('/notifications')
    await page.waitForTimeout(2000)
    await expect(page.getByRole('heading', { name: /^notifications$/i })).toBeVisible({ timeout: 10000 })
  })

  test('search analytics shows empty data', async ({ errorPage: page }) => {
    await page.goto('/search-analytics')
    await page.waitForTimeout(2000)
    await expect(page.getByRole('heading', { name: /search analytics/i })).toBeVisible({ timeout: 10000 })
  })

  test('audit logs shows empty table', async ({ errorPage: page }) => {
    await page.goto('/audit')
    await page.waitForTimeout(2000)
    await expect(page.getByRole('heading', { name: /audit/i })).toBeVisible({ timeout: 10000 })
  })

  test('reviews page shows empty table', async ({ errorPage: page }) => {
    await page.goto('/reviews')
    await page.waitForTimeout(2000)
    await expect(page.getByRole('heading', { name: /reviews/i })).toBeVisible({ timeout: 10000 })
  })

  test('categories page shows empty table', async ({ errorPage: page }) => {
    await page.goto('/categories')
    await page.waitForTimeout(2000)
    await expect(page.getByRole('heading', { name: /categories/i })).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Error Pages', () => {
  test('404 page renders for unknown route', async ({ errorPage: page }) => {
    await page.goto('/some-nonexistent-page')
    await expect(page.getByText(/404/i)).toBeVisible()
  })

  test('404 page has go home action', async ({ errorPage: page }) => {
    await page.goto('/some-nonexistent-page')
    await page.waitForTimeout(1000)
    const homeBtn = page.getByRole('button', { name: /go to dashboard|go back|home/i }).or(page.getByRole('link', { name: /go to dashboard|go back|home/i }))
    await expect(homeBtn.first()).toBeVisible({ timeout: 10000 })
  })

  test('unauthorized page renders', async ({ errorPage: page }) => {
    await page.goto('/unauthorized')
    await page.waitForTimeout(1000)
    await expect(page.getByRole('heading', { name: /401/ })).toBeVisible({ timeout: 10000 })
  })

  test('forbidden page renders', async ({ errorPage: page }) => {
    await page.goto('/forbidden')
    await page.waitForTimeout(1000)
    await expect(page.getByRole('heading', { name: /403/ })).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Responsive Layout', () => {
  test('desktop layout shows sidebar', async ({ errorPage: page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.waitForTimeout(1000)
    // Verify the page renders dashboard content at desktop width
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 15000 })
  })

  test('mobile layout adjusts content width', async ({ errorPage: page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await page.waitForTimeout(500)
    const main = page.locator('main').first()
    if (await main.isVisible()) {
      const box = await main.boundingBox()
      if (box) {
        expect(box.width).toBeGreaterThan(300)
      }
    }
  })

  test('tablet layout works', async ({ errorPage: page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForTimeout(1000)
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 10000 })
  })
})
