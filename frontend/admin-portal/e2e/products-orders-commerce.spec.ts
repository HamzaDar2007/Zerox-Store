import { test, expect } from './fixtures'

test.describe('Products Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/products')
  })

  test('renders products page with heading and search', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { name: /products/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search products/i)).toBeVisible()
  })

  test('displays products in table', async ({ authedPage: page }) => {
    await expect(page.getByText('TestProduct')).toBeVisible({ timeout: 5000 })
  })

  test('opens create product dialog with all fields', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add product/i }).click()
    await expect(page.getByRole('heading', { name: /create product/i })).toBeVisible()
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog.locator('input').first()).toBeVisible()
  })

  test('validates required product fields', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add product/i }).click()
    const dialog = page.locator('[role="dialog"]')
    await dialog.getByRole('button', { name: /create/i }).click()
    await expect(dialog.locator('.text-destructive').first()).toBeVisible({ timeout: 5000 })
  })

  test('can cancel create product dialog', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add product/i }).click()
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByRole('heading', { name: /create product/i })).not.toBeVisible()
  })

  test('shows export dropdown', async ({ authedPage: page }) => {
    const exportBtn = page.getByRole('button', { name: /export/i })
    if (await exportBtn.isVisible()) {
      await exportBtn.click()
      await expect(page.getByText(/export csv/i)).toBeVisible()
      await expect(page.getByText(/export excel/i)).toBeVisible()
      await expect(page.getByText(/export pdf/i)).toBeVisible()
    }
  })

  test('search input works', async ({ authedPage: page }) => {
    const search = page.getByPlaceholder(/search products/i)
    await search.fill('laptop')
    await expect(search).toHaveValue('laptop')
  })
})

test.describe('Orders Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/orders')
  })

  test('renders orders page', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { name: /orders/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search orders/i)).toBeVisible()
  })

  test('displays orders in table', async ({ authedPage: page }) => {
    await expect(page.getByText('pending')).toBeVisible({ timeout: 5000 })
  })

  test('has export button', async ({ authedPage: page }) => {
    const exportBtn = page.getByRole('button', { name: /export/i })
    if (await exportBtn.isVisible()) {
      await exportBtn.click()
      await expect(page.getByText(/export csv/i)).toBeVisible()
    }
  })

  test('search input works', async ({ authedPage: page }) => {
    const search = page.getByPlaceholder(/search orders/i)
    await search.fill('ORD-001')
    await expect(search).toHaveValue('ORD-001')
  })
})

test.describe('Payments Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/payments')
  })

  test('renders payments page', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { name: /payments/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search payments/i)).toBeVisible()
  })

  test('displays payments in table', async ({ authedPage: page }) => {
    await expect(page.getByText('stripe')).toBeVisible({ timeout: 5000 })
  })

  test('has export button', async ({ authedPage: page }) => {
    const exportBtn = page.getByRole('button', { name: /export/i })
    if (await exportBtn.isVisible()) {
      await exportBtn.click()
      await expect(page.getByText(/export csv/i)).toBeVisible()
    }
  })
})

test.describe('Coupons Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/coupons')
  })

  test('renders coupons page', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { name: /coupons/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search coupons/i)).toBeVisible()
  })

  test('displays coupons in table', async ({ authedPage: page }) => {
    await expect(page.getByText('SAVE10')).toBeVisible({ timeout: 5000 })
  })

  test('opens create coupon dialog', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add coupon/i }).click()
    await expect(page.getByRole('heading', { name: /create coupon/i })).toBeVisible()
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog.locator('input').first()).toBeVisible()
  })

  test('validates required coupon fields', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add coupon/i }).click()
    const dialog = page.locator('[role="dialog"]')
    await dialog.getByRole('button', { name: /create/i }).click()
    await expect(dialog.locator('.text-destructive').first()).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Flash Sales Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/flash-sales')
  })

  test('renders flash sales page', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { name: /flash sales/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search flash sales/i)).toBeVisible()
  })

  test('displays flash sales in table', async ({ authedPage: page }) => {
    await expect(page.getByText('Summer Sale')).toBeVisible({ timeout: 5000 })
  })

  test('opens create flash sale dialog', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add flash sale/i }).click()
    await expect(page.getByRole('heading', { name: /create flash sale/i })).toBeVisible()
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog.locator('input').first()).toBeVisible()
  })

  test('validates required flash sale fields', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add flash sale/i }).click()
    const dialog = page.locator('[role="dialog"]')
    await dialog.getByRole('button', { name: /create/i }).click()
    await expect(dialog.locator('.text-destructive').first()).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Returns Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/returns')
  })

  test('renders returns page', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { name: /returns/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search returns/i)).toBeVisible()
  })

  test('displays returns in table', async ({ authedPage: page }) => {
    await expect(page.getByText('Defective')).toBeVisible({ timeout: 5000 })
  })

  test('has export button', async ({ authedPage: page }) => {
    const exportBtn = page.getByRole('button', { name: /export/i })
    if (await exportBtn.isVisible()) {
      await exportBtn.click()
      await expect(page.getByText(/export csv/i)).toBeVisible()
    }
  })
})

test.describe('Reviews Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/reviews')
  })

  test('renders reviews page', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { name: /reviews/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search reviews/i)).toBeVisible()
  })

  test('displays reviews in table', async ({ authedPage: page }) => {
    await expect(page.getByText('Great!')).toBeVisible({ timeout: 5000 })
  })

  test('has export button', async ({ authedPage: page }) => {
    const exportBtn = page.getByRole('button', { name: /export/i })
    if (await exportBtn.isVisible()) {
      await exportBtn.click()
      await expect(page.getByText(/export csv/i)).toBeVisible()
    }
  })
})
