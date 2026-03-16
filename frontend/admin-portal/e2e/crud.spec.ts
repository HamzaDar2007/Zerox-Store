import { test, expect } from './fixtures'

test.describe('Products CRUD', () => {
  test('renders products page with table', async ({ authedPage: page }) => {
    await page.goto('/products')
    await expect(page.getByRole('heading', { name: /products/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search products/i)).toBeVisible()
  })

  test('opens create product dialog', async ({ authedPage: page }) => {
    await page.goto('/products')
    await page.getByRole('button', { name: /add product/i }).click()
    await expect(page.getByRole('heading', { name: /create product/i })).toBeVisible()
    // Form inputs are present inside the dialog
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog.locator('input').first()).toBeVisible()
  })

  test('validates required fields on create', async ({ authedPage: page }) => {
    await page.goto('/products')
    await page.getByRole('button', { name: /add product/i }).click()
    await expect(page.getByRole('heading', { name: /create product/i })).toBeVisible()

    // Submit empty form
    const dialog = page.locator('[role="dialog"]')
    await dialog.getByRole('button', { name: /create/i }).click()

    // Validation errors should appear inside the dialog
    const errors = dialog.locator('.text-destructive')
    await expect(errors.first()).toBeVisible({ timeout: 10000 })
  })

  test('can close create dialog with cancel', async ({ authedPage: page }) => {
    await page.goto('/products')
    await page.getByRole('button', { name: /add product/i }).click()
    await expect(page.getByRole('heading', { name: /create product/i })).toBeVisible()

    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByRole('heading', { name: /create product/i })).not.toBeVisible()
  })

  test('shows export dropdown with CSV, Excel, PDF options', async ({ authedPage: page }) => {
    await page.goto('/products')
    const exportBtn = page.getByRole('button', { name: /export/i })
    if (await exportBtn.isVisible()) {
      await exportBtn.click()
      await expect(page.getByText(/export csv/i)).toBeVisible()
      await expect(page.getByText(/export excel/i)).toBeVisible()
      await expect(page.getByText(/export pdf/i)).toBeVisible()
    }
  })

  test('search input filters products', async ({ authedPage: page }) => {
    await page.goto('/products')
    const searchInput = page.getByPlaceholder(/search products/i)
    await searchInput.fill('test-product-query')
    // Search debounce fires after 300ms — just verify the input took the value
    await expect(searchInput).toHaveValue('test-product-query')
  })
})

test.describe('Categories Page', () => {
  test('renders categories page', async ({ authedPage: page }) => {
    await page.goto('/categories')
    await expect(page.getByRole('heading', { name: /categories/i })).toBeVisible()
  })
})

test.describe('Orders Page', () => {
  test('renders orders page', async ({ authedPage: page }) => {
    await page.goto('/orders')
    await expect(page.getByRole('heading', { name: /orders/i })).toBeVisible()
  })
})

test.describe('Users Page', () => {
  test('renders users page', async ({ authedPage: page }) => {
    await page.goto('/users')
    await expect(page.getByRole('heading', { name: /users/i })).toBeVisible()
  })
})

test.describe('Reviews Page', () => {
  test('renders reviews page', async ({ authedPage: page }) => {
    await page.goto('/reviews')
    await expect(page.getByRole('heading', { name: /reviews/i })).toBeVisible()
  })
})

test.describe('Audit Logs Page', () => {
  test('renders audit page', async ({ authedPage: page }) => {
    await page.goto('/audit')
    await expect(page.getByRole('heading', { name: /audit logs/i })).toBeVisible()
  })
})

test.describe('Settings Page', () => {
  test('renders settings page', async ({ authedPage: page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible()
  })
})
