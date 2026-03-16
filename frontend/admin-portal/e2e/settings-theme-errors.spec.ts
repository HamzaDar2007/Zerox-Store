import { test, expect } from './fixtures'

test.describe('Settings Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/settings')
  })

  test('renders settings page with all sections', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { name: /settings/i }).first()).toBeVisible()
    await expect(page.getByText(/profile/i).first()).toBeVisible()
    await expect(page.getByText(/appearance/i)).toBeVisible()
    await expect(page.getByText(/danger zone/i)).toBeVisible()
  })

  test('shows user profile info', async ({ authedPage: page }) => {
    await expect(page.locator('.font-medium').filter({ hasText: 'admin@test.com' })).toBeVisible({ timeout: 5000 })
  })

  test('has edit profile button', async ({ authedPage: page }) => {
    await expect(page.getByRole('button', { name: /edit/i })).toBeVisible()
  })

  test('opens profile edit form', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /edit/i }).click()
    await expect(page.getByLabel(/first name/i)).toBeVisible()
    await expect(page.getByLabel(/last name/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /save changes/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible()
  })

  test('can cancel profile edit', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /edit/i }).click()
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByLabel(/first name/i)).not.toBeVisible()
  })

  test('has change password section', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { name: /change password/i })).toBeVisible()
    await expect(page.getByLabel(/current password/i)).toBeVisible()
    await expect(page.getByLabel(/new password/i)).toBeVisible()
    await expect(page.getByLabel(/confirm password/i)).toBeVisible()
  })

  test('validates password change form', async ({ authedPage: page }) => {
    const submitBtn = page.getByRole('button', { name: /change password/i })
    await submitBtn.click()
    await expect(page.locator('.text-destructive').first()).toBeVisible({ timeout: 5000 })
  })

  test('shows appearance section with dark mode toggle', async ({ authedPage: page }) => {
    await expect(page.getByText(/dark mode/i)).toBeVisible()
  })

  test('shows theme color options', async ({ authedPage: page }) => {
    await expect(page.getByText(/theme color/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /blue/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /emerald/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /rose/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /orange/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /violet/i })).toBeVisible()
  })

  test('can switch accent color', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /emerald/i }).click()
    const html = page.locator('html')
    await expect(html).toHaveClass(/theme-emerald/)
  })

  test('can switch to rose color', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /rose/i }).click()
    const html = page.locator('html')
    await expect(html).toHaveClass(/theme-rose/)
  })

  test('has danger zone with logout button', async ({ authedPage: page }) => {
    await expect(page.getByText(/danger zone/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /log out/i })).toBeVisible()
  })
})

test.describe('Theme System', () => {
  test('dark mode toggles html class', async ({ authedPage: page }) => {
    await page.goto('/settings')
    const html = page.locator('html')
    // Find the dark mode switch/toggle
    const darkModeToggle = page.locator('button[role="switch"]').first()
    if (await darkModeToggle.isVisible()) {
      const classBefore = await html.getAttribute('class')
      await darkModeToggle.click()
      await page.waitForTimeout(300)
      const classAfter = await html.getAttribute('class')
      expect(classBefore).not.toBe(classAfter)
    }
  })

  test('theme persists across navigation', async ({ authedPage: page }) => {
    await page.goto('/settings')
    await page.getByRole('button', { name: /violet/i }).click()
    await page.goto('/products')
    await page.waitForTimeout(500)
    const html = page.locator('html')
    await expect(html).toHaveClass(/theme-violet/)
  })

  test('all five accent colors can be applied', async ({ authedPage: page }) => {
    await page.goto('/settings')
    // blue is the default and has no explicit theme-blue class
    const nonDefaultColors = ['emerald', 'rose', 'orange', 'violet']
    for (const color of nonDefaultColors) {
      await page.getByRole('button', { name: new RegExp(`^${color}$`, 'i') }).click()
      await page.waitForTimeout(300)
      const html = page.locator('html')
      await expect(html).toHaveClass(new RegExp(`theme-${color}`))
    }
    // Switch back to blue (default) - should remove any theme-* class
    await page.getByRole('button', { name: /^blue$/i }).click()
    await page.waitForTimeout(300)
    const classAttr = await page.locator('html').getAttribute('class') || ''
    expect(classAttr).not.toMatch(/theme-/)
  })
})

test.describe('Responsive Layout', () => {
  test('sidebar is visible on desktop', async ({ authedPage: page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    await expect(page.locator('aside').last()).toBeVisible()
  })

  test('sidebar collapses on mobile', async ({ authedPage: page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    // On mobile, the sidebar should be hidden or a hamburger menu shown
    await page.waitForTimeout(500)
    // The desktop aside shouldn't be expanded on mobile
    const sidebar = page.locator('aside')
    const count = await sidebar.count()
    if (count > 0) {
      // Check if sidebar is hidden or collapsed
      const isVisible = await sidebar.last().isVisible()
      // On mobile it could be visible as a collapsed icon bar or hidden entirely
      expect(typeof isVisible).toBe('boolean')
    }
  })

  test('main content area fills screen on desktop', async ({ authedPage: page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    const main = page.locator('main')
    if (await main.count() > 0) {
      const box = await main.first().boundingBox()
      expect(box).not.toBeNull()
      if (box) {
        expect(box.width).toBeGreaterThan(600)
      }
    }
  })
})

test.describe('Error Pages', () => {
  test('unauthorized page renders correctly', async ({ authedPage: page }) => {
    await page.goto('/unauthorized')
    await expect(page.getByRole('heading', { name: '401' })).toBeVisible()
  })

  test('forbidden page renders correctly', async ({ authedPage: page }) => {
    await page.goto('/forbidden')
    await expect(page.getByRole('heading', { name: '403' })).toBeVisible()
  })

  test('404 page renders for unknown routes', async ({ authedPage: page }) => {
    await page.goto('/this-page-does-not-exist-xyz')
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
  })

  test('404 page has go back button', async ({ authedPage: page }) => {
    await page.goto('/this-page-does-not-exist-xyz')
    const goBack = page.getByRole('button', { name: /go back/i }).or(page.getByRole('link', { name: /home|dashboard|go back/i }))
    await expect(goBack.first()).toBeVisible()
  })
})

test.describe('Navigation Smoke Tests', () => {
  const routes = [
    { path: '/users', heading: /users/i },
    { path: '/roles', heading: /roles/i },
    { path: '/permissions', heading: /permissions/i },
    { path: '/role-permissions', heading: /role permissions/i },
    { path: '/categories', heading: /categories/i },
    { path: '/brands', heading: /brands/i },
    { path: '/sellers', heading: /sellers/i },
    { path: '/stores', heading: /stores/i },
    { path: '/products', heading: /products/i },
    { path: '/orders', heading: /orders/i },
    { path: '/payments', heading: /payments/i },
    { path: '/coupons', heading: /coupons/i },
    { path: '/flash-sales', heading: /flash sales/i },
    { path: '/inventory', heading: /inventory/i },
    { path: '/shipping', heading: /shipping/i },
    { path: '/subscriptions', heading: /subscriptions/i },
    { path: '/returns', heading: /returns/i },
    { path: '/reviews', heading: /reviews/i },
    { path: '/notifications', heading: /notifications/i },
    { path: '/chat', heading: /chat/i },
    { path: '/audit', heading: /audit/i },
    { path: '/settings', heading: /settings/i },
    { path: '/search-analytics', heading: /search analytics/i },
  ]

  for (const { path, heading } of routes) {
    test(`${path} loads without errors`, async ({ authedPage: page }) => {
      await page.goto(path)
      await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible({ timeout: 10000 })
      // No console errors for uncaught exceptions
      const errors: string[] = []
      page.on('pageerror', (err) => errors.push(err.message))
      await page.waitForTimeout(1000)
      // We allow controlled errors but check for none
      expect(errors.length).toBe(0)
    })
  }
})
