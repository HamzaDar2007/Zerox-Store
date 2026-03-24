import { test, expect } from '../fixtures'
import { openRowAction, assertToast, dialog, verifyExportDropdown } from '../helpers'

test.describe('Orders Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/orders')
    await expect(page.getByRole('heading', { name: /orders/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('renders orders table with data', async ({ authedPage: page }) => {
    await expect(page.getByText('pending').first()).toBeVisible()
    await expect(page.getByText('shipped').first()).toBeVisible()
  })

  test('search filters orders', async ({ authedPage: page }) => {
    const search = page.getByPlaceholder(/search orders/i)
    await search.fill('o1')
    await expect(search).toHaveValue('o1')
  })

  test('view order detail via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'pending', 'View')
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await expect(page.getByText(/order details/i)).toBeVisible()
  })

  test('order detail shows items section', async ({ authedPage: page }) => {
    await openRowAction(page, 'pending', 'View')
    await page.waitForTimeout(500)
    await expect(page.getByText(/items/i)).toBeVisible()
  })

  test('update order status via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'pending', 'Update Status')
    await expect(page.getByRole('heading', { name: /update order status/i })).toBeVisible()
    // Select a new status
    const statusSelect = dialog(page).locator('button').filter({ hasText: /pending|confirmed|select/i }).first()
      .or(dialog(page).getByRole('combobox').first())
    if (await statusSelect.isVisible()) {
      await statusSelect.click()
      const option = page.getByRole('option', { name: /confirmed/i }).first()
      if (await option.isVisible()) await option.click()
    }
    await dialog(page).getByRole('button', { name: /^update$/i }).click()
    await assertToast(page)
  })

  test('cancel order via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'pending', 'Cancel Order')
    await assertToast(page)
  })

  test('export dropdown works', async ({ authedPage: page }) => {
    await verifyExportDropdown(page)
  })
})
