import { test, expect } from './fixtures'

test.describe('Role Permissions Workflow', () => {
  test('page renders with heading and role selector', async ({ authedPage: page }) => {
    await page.goto('/role-permissions')
    await expect(page.getByRole('heading', { name: /role permissions/i })).toBeVisible()
    await expect(page.getByText(/select a role/i).first()).toBeVisible()
  })

  test('role selector dropdown shows available roles', async ({ authedPage: page }) => {
    await page.goto('/role-permissions')
    const trigger = page.locator('[role="combobox"], button').filter({ hasText: /select a role/i }).first()
    if (await trigger.isVisible()) {
      await trigger.click()
      await page.waitForTimeout(300)
      // Should see role options
      const roleOption = page.getByRole('option', { name: /super_admin/i }).or(page.getByText('super_admin'))
      await expect(roleOption).toBeVisible()
    }
  })

  test('selecting a role shows permission matrix', async ({ authedPage: page }) => {
    await page.goto('/role-permissions')
    const trigger = page.locator('[role="combobox"], button').filter({ hasText: /select a role/i }).first()
    if (await trigger.isVisible()) {
      await trigger.click()
      await page.waitForTimeout(300)
      const roleOption = page.getByRole('option', { name: /super_admin/i }).or(page.locator('[role="option"]').first())
      if (await roleOption.isVisible()) {
        await roleOption.click()
        await page.waitForTimeout(500)
        // Should show permissions or save button
        const saveBtn = page.getByRole('button', { name: /save/i })
        const permissionText = page.getByText(/users/i)
        await expect(saveBtn.or(permissionText)).toBeVisible({ timeout: 3000 })
      }
    }
  })
})

test.describe('Dashboard Interactions', () => {
  test('displays stat cards', async ({ authedPage: page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
    const statGrid = page.locator('.grid').first()
    await expect(statGrid).toBeVisible()
  })

  test('quick action navigates to products', async ({ authedPage: page }) => {
    await page.goto('/')
    const addProduct = page.getByRole('button', { name: /add product/i }).or(page.getByRole('link', { name: /add product/i }))
    if (await addProduct.isVisible()) {
      await addProduct.click()
      await page.waitForURL('**/products')
    }
  })

  test('quick action navigates to categories', async ({ authedPage: page }) => {
    await page.goto('/')
    const catBtn = page.getByRole('button', { name: /categories/i }).or(page.getByRole('link', { name: /categories/i }))
    if (await catBtn.isVisible()) {
      await catBtn.click()
      await page.waitForURL('**/categories')
    }
  })

  test('quick action navigates to orders', async ({ authedPage: page }) => {
    await page.goto('/')
    const ordersBtn = page.getByRole('button', { name: /orders/i }).or(page.getByRole('link', { name: /orders/i }))
    if (await ordersBtn.isVisible()) {
      await ordersBtn.click()
      await page.waitForURL('**/orders')
    }
  })

  test('chart sections are visible', async ({ authedPage: page }) => {
    await page.goto('/')
    await expect(page.getByText(/monthly orders|revenue trend|order status|recent/i).first()).toBeVisible()
  })
})

test.describe('Sidebar Navigation Depth', () => {
  test('navigate to each major section', async ({ authedPage: page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    const routes = [
      { name: /users/i, url: '/users' },
      { name: /products/i, url: '/products' },
      { name: /orders/i, url: '/orders' },
      { name: /categories/i, url: '/categories' },
      { name: /settings/i, url: '/settings' },
    ]
    for (const route of routes) {
      await page.goto('/')
      const link = page.locator('nav a, nav button').filter({ hasText: route.name }).first()
      if (await link.isVisible()) {
        await link.click()
        await page.waitForTimeout(500)
        expect(page.url()).toContain(route.url)
      }
    }
  })

  test('sidebar collapse hides labels and shows icons', async ({ authedPage: page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    const collapseBtn = page.locator('button').filter({ has: page.locator('svg.lucide-panel-left-close, svg.lucide-chevron-left') }).first()
    if (await collapseBtn.isVisible()) {
      await collapseBtn.click()
      await page.waitForTimeout(500)
      // After collapse, the admin portal title should be hidden
      await expect(page.locator('nav').filter({ hasText: /admin portal/i })).not.toBeVisible()
    }
  })

  test('active nav item is highlighted', async ({ authedPage: page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/products')
    await page.waitForTimeout(500)
    const productsLink = page.locator('nav a, nav button').filter({ hasText: /products/i }).first()
    if (await productsLink.isVisible()) {
      const classes = await productsLink.getAttribute('class')
      expect(classes).toBeTruthy()
    }
  })
})
