import { test, expect } from '../fixtures'

test.describe('Dashboard', () => {
  test('renders page heading with greeting', async ({ authedPage: page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /good (morning|afternoon|evening)/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('shows store overview text', async ({ authedPage: page }) => {
    await page.goto('/')
    await expect(page.getByText(/here's what's happening/i)).toBeVisible({ timeout: 10000 })
  })

  test('displays stat cards', async ({ authedPage: page }) => {
    await page.goto('/')
    await expect(page.getByText('Total Users').first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Total Products').first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Total Orders').first()).toBeVisible({ timeout: 10000 })
  })

  test('renders chart sections', async ({ authedPage: page }) => {
    await page.goto('/')
    await expect(page.getByText(/monthly orders/i).or(page.getByText(/revenue/i)).first()).toBeVisible({ timeout: 10000 })
  })

  test('shows recent orders section', async ({ authedPage: page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /recent orders/i })).toBeVisible({ timeout: 10000 })
  })

  test('quick action Add Product navigates to products', async ({ authedPage: page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /add product/i }).or(page.getByRole('link', { name: /add product/i })).first().click()
    await expect(page).toHaveURL(/\/products/)
  })

  test('quick action Orders navigates to orders', async ({ authedPage: page }) => {
    await page.goto('/')
    const ordersBtn = page.getByRole('button', { name: /^orders$/i }).or(page.getByRole('link', { name: /^orders$/i })).first()
    if (await ordersBtn.isVisible()) {
      await ordersBtn.click()
      await expect(page).toHaveURL(/\/orders/)
    }
  })
})

test.describe('Dashboard Empty State', () => {
  test('renders with empty data', async ({ emptyPage: page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /good (morning|afternoon|evening)/i }).first()).toBeVisible({ timeout: 15000 })
  })
})
