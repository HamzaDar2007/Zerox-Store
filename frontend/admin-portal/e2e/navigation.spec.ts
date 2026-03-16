import { test, expect } from './fixtures'

test.describe('Sidebar Navigation', () => {
  test('renders sidebar with main navigation items', async ({ authedPage: page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    // Target the visible desktop sidebar (hidden on mobile)
    const sidebar = page.locator('aside').last()
    await expect(sidebar).toBeVisible()

    // Core navigation items should be visible for super-admin
    await expect(sidebar.getByText('Dashboard')).toBeVisible()
    await expect(sidebar.getByText('Users')).toBeVisible()
    await expect(sidebar.getByText('Products')).toBeVisible()
    await expect(sidebar.getByText('Orders')).toBeVisible()
    await expect(sidebar.getByText('Categories')).toBeVisible()
    await expect(sidebar.getByText('Settings')).toBeVisible()
  })

  test('navigates to Users page', async ({ authedPage: page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    await page.locator('aside').last().getByText('Users').click()
    await expect(page).toHaveURL('/users')
  })

  test('navigates to Products page', async ({ authedPage: page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    await page.locator('aside').last().getByText('Products').click()
    await expect(page).toHaveURL('/products')
  })

  test('navigates to Orders page', async ({ authedPage: page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    await page.locator('aside').last().getByText('Orders').click()
    await expect(page).toHaveURL('/orders')
  })

  test('navigates to Categories page', async ({ authedPage: page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    await page.locator('aside').last().getByText('Categories').click()
    await expect(page).toHaveURL('/categories')
  })

  test('navigates to Audit Logs page', async ({ authedPage: page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    await page.locator('aside').last().getByText('Audit Logs').click()
    await expect(page).toHaveURL('/audit')
  })

  test('toggles sidebar collapse', async ({ authedPage: page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    const sidebar = page.locator('aside').last()
    // Initially expanded
    await expect(sidebar.getByText('Admin Portal')).toBeVisible()

    // Click collapse button
    const collapseBtn = sidebar.locator('button').first()
    await collapseBtn.click()

    // Sidebar should be collapsed — title hidden
    await expect(sidebar.getByText('Admin Portal')).not.toBeVisible()

    // Expand again
    await collapseBtn.click()
    await expect(sidebar.getByText('Admin Portal')).toBeVisible()
  })

  test('highlights active navigation item', async ({ authedPage: page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/products')
    const productsLink = page.locator('aside').last().locator('a[href="/products"]')
    await expect(productsLink).toHaveClass(/text-primary/)
  })
})

test.describe('Protected Routes', () => {
  test('redirects unauthenticated user to login', async ({ page }) => {
    // Ensure no auth
    await page.goto('/')
    await page.evaluate(() => localStorage.removeItem('admin-auth'))
    await page.goto('/products')
    await expect(page).toHaveURL(/\/login/)
  })

  test('shows 404 page for unknown route', async ({ authedPage: page }) => {
    await page.goto('/some-random-nonexistent-page')
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
  })
})
