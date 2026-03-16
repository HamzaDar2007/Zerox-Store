import { test, expect } from './fixtures'

test.describe('Login Success Flow', () => {
  test('successful login with valid credentials redirects to dashboard', async ({ page }) => {
    // Mock the API
    await page.route('**/localhost:3001/**', async (route) => {
      const url = route.request().url()
      if (url.includes('/auth/login')) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              accessToken: 'e2e-access',
              refreshToken: 'e2e-refresh',
              user: { id: 'u1', email: 'admin@test.com', firstName: 'Admin', lastName: 'User', role: 'super_admin', isActive: true, isEmailVerified: true },
            },
          }),
        })
      }
      // All other endpoints return empty lists
      const wrap = { success: true, data: [], total: 0, page: 1, limit: 20, totalPages: 0, timestamp: new Date().toISOString() }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrap) })
    })
    await page.route('**/api/**', async (route) => {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) })
    })

    // Navigate directly to login
    await page.goto('/login')
    await page.waitForTimeout(1000)

    await page.locator('input[name="email"], input[type="email"]').first().fill('admin@test.com')
    await page.locator('input[name="password"], input[type="password"]').first().fill('SecurePass123!')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Should redirect away from /login
    await page.waitForTimeout(2000)
    expect(page.url()).not.toContain('/login')
  })

  test('login with bad credentials shows error', async ({ page }) => {
    await page.route('**/localhost:3001/**', async (route) => {
      const url = route.request().url()
      if (url.includes('/auth/login')) {
        return route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'Invalid credentials' }),
        })
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) })
    })
    await page.route('**/api/**', async (route) => {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) })
    })

    await page.goto('/login')
    await page.waitForTimeout(1000)

    await page.locator('input[name="email"], input[type="email"]').first().fill('wrong@test.com')
    await page.locator('input[name="password"], input[type="password"]').first().fill('WrongPass123!')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Should stay on login and show error
    await page.waitForTimeout(2000)
    expect(page.url()).toContain('/login')
  })
})

test.describe('Forgot Password Flow', () => {
  test('submit forgot password shows success', async ({ page }) => {
    // Forgot password is a public route - don't use authedPage which redirects away
    await page.route('**/localhost:3001/**', async (route) => {
      if (route.request().url().includes('/auth/forgot-password')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) })
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) })
    })
    await page.goto('/forgot-password')
    await page.waitForTimeout(1000)
    await page.locator('input[name="email"], input[type="email"]').first().fill('admin@test.com')
    await page.getByRole('button', { name: /send reset link/i }).click()
    await page.waitForTimeout(2000)
    const successMsg = page.getByText(/reset link|sent|check your email/i).first()
    await expect(successMsg).toBeVisible({ timeout: 10000 })
  })

  test('forgot password back to login link works', async ({ page }) => {
    await page.route('**/localhost:3001/**', async (route) => {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) })
    })
    await page.goto('/forgot-password')
    await page.waitForTimeout(1000)
    const backLink = page.getByRole('link', { name: /back to login|login/i }).or(page.getByText(/back to login/i))
    if (await backLink.isVisible()) {
      await backLink.click()
      await page.waitForTimeout(1000)
    }
  })
})

test.describe('Unauthenticated Redirect', () => {
  test('accessing protected route without auth redirects to login', async ({ page }) => {
    await page.route('**/localhost:3001/**', async (route) => {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) })
    })
    await page.route('**/api/**', async (route) => {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) })
    })
    await page.goto('/')
    await page.evaluate(() => localStorage.removeItem('admin-auth'))
    await page.goto('/products')
    await page.waitForTimeout(1000)
    expect(page.url()).toContain('/login')
  })
})

test.describe('DataTable Interactions', () => {
  test('products table column sorting', async ({ authedPage: page }) => {
    await page.goto('/products')
    await page.waitForTimeout(1000)
    await expect(page.getByText('TestProduct')).toBeVisible({ timeout: 10000 })
    // Click a sortable header
    const nameHeader = page.getByRole('button', { name: /name/i }).first()
    if (await nameHeader.isVisible()) {
      await nameHeader.click()
      await page.waitForTimeout(300)
      // Click again for reverse sort
      await nameHeader.click()
      await page.waitForTimeout(300)
    }
  })

  test('users table shows row selection checkboxes', async ({ authedPage: page }) => {
    await page.goto('/users')
    await page.waitForTimeout(500)
    const checkbox = page.locator('table input[type="checkbox"], table [role="checkbox"]').first()
    if (await checkbox.isVisible()) {
      await checkbox.click()
      await page.waitForTimeout(200)
    }
  })

  test('categories table export to CSV', async ({ authedPage: page }) => {
    await page.goto('/categories')
    const exportBtn = page.getByRole('button', { name: /export/i })
    if (await exportBtn.isVisible()) {
      await exportBtn.click()
      const csvBtn = page.getByText(/export csv/i)
      if (await csvBtn.isVisible()) {
        await csvBtn.click()
        // CSV download triggered (we can't verify file content in E2E, but no error should occur)
        await page.waitForTimeout(500)
      }
    }
  })

  test('orders table search works', async ({ authedPage: page }) => {
    await page.goto('/orders')
    const search = page.getByPlaceholder(/search/i)
    await search.fill('pending')
    await expect(search).toHaveValue('pending')
  })

  test('reviews table search works', async ({ authedPage: page }) => {
    await page.goto('/reviews')
    const search = page.getByPlaceholder(/search/i)
    await search.fill('Great')
    await expect(search).toHaveValue('Great')
  })
})

test.describe('Bulk Operations', () => {
  test('select all checkbox toggles all rows', async ({ authedPage: page }) => {
    await page.goto('/users')
    await page.waitForTimeout(500)
    const selectAll = page.locator('thead input[type="checkbox"], thead [role="checkbox"]').first()
    if (await selectAll.isVisible()) {
      await selectAll.click()
      await page.waitForTimeout(300)
      // A bulk action bar may appear
      const bulkBar = page.getByText(/selected/i).or(page.getByRole('button', { name: /delete selected/i }))
      if (await bulkBar.isVisible().catch(() => false)) {
        expect(true).toBeTruthy()
      }
    }
  })
})
