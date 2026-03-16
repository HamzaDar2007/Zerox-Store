import { test as base, type Page } from '@playwright/test'

/** Mock all backend API calls so fake auth tokens never trigger 401 redirects. */
async function mockApi(page: Page) {
  await page.route('**/api/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()
    const empty = { success: true, data: [], total: 0, page: 1, limit: 10, totalPages: 0, timestamp: new Date().toISOString() }

    // Auth endpoints
    if (url.includes('/auth/refresh') || url.includes('/auth/logout')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { accessToken: 'e2e-access-token', refreshToken: 'e2e-refresh-token' } }) })
    }

    // For any GET request, return empty paginated data
    if (method === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(empty) })
    }

    // For POST/PUT/PATCH/DELETE, return success
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) })
  })

  // Also intercept direct backend calls (non-/api/ prefix)
  await page.route('**/localhost:3001/**', async (route) => {
    const url = route.request().url()
    const method = route.request().method()
    const empty = { success: true, data: [], total: 0, page: 1, limit: 10, totalPages: 0, timestamp: new Date().toISOString() }

    if (url.includes('/auth/refresh') || url.includes('/auth/logout')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { accessToken: 'e2e-access-token', refreshToken: 'e2e-refresh-token' } }) })
    }
    if (method === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(empty) })
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) })
  })
}

/**
 * Inject auth tokens into localStorage so protected routes are accessible
 * without going through the login flow every time.
 */
async function seedAuth(page: Page) {
  await mockApi(page)
  await page.goto('/')
  await page.evaluate(() => {
    const state = {
      state: {
        user: { id: 'e2e-user', email: 'admin@test.com', role: 'super-admin' },
        accessToken: 'e2e-access-token',
        refreshToken: 'e2e-refresh-token',
        isAuthenticated: true,
      },
      version: 0,
    }
    localStorage.setItem('admin-auth', JSON.stringify(state))
  })
  await page.reload()
}

export const test = base.extend<{ authedPage: Page }>({
  authedPage: async ({ page }, use) => {
    await seedAuth(page)
    await use(page)
  },
})

export { expect } from '@playwright/test'
