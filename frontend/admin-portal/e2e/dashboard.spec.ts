import { test, expect } from './fixtures'

test.describe('Dashboard', () => {
  test('renders dashboard heading and quick actions', async ({ authedPage: page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
    await expect(page.getByText(/welcome to the admin portal/i)).toBeVisible()
  })

  test('displays quick action buttons', async ({ authedPage: page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: /add product/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /categories/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /orders/i })).toBeVisible()
  })

  test('navigates to products on Add Product click', async ({ authedPage: page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /add product/i }).click()
    await expect(page).toHaveURL('/products')
  })

  test('displays stat cards or loading skeletons', async ({ authedPage: page }) => {
    await page.goto('/')
    // Stat cards grid should be present (may show skeletons or actual data)
    const statsGrid = page.locator('.grid.gap-4').first()
    await expect(statsGrid).toBeVisible()
  })

  test('displays chart sections', async ({ authedPage: page }) => {
    await page.goto('/')
    await expect(page.getByText(/monthly orders/i)).toBeVisible()
    await expect(page.getByText(/revenue trend/i)).toBeVisible()
    await expect(page.getByText(/order status/i)).toBeVisible()
    await expect(page.getByRole('heading', { name: /recent orders/i })).toBeVisible()
  })
})
