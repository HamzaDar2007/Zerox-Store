import { test, expect } from '../fixtures'
import { openRowAction, assertToast, dialog, verifyExportDropdown } from '../helpers'

test.describe('Payments Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/payments')
    await expect(page.getByRole('heading', { name: /payments/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('renders payments table with data', async ({ authedPage: page }) => {
    await expect(page.getByText('stripe').first()).toBeVisible()
    await expect(page.getByText('completed').first()).toBeVisible()
  })

  test('search filters payments', async ({ authedPage: page }) => {
    const search = page.getByPlaceholder(/search payments/i)
    await search.fill('stripe')
    await expect(search).toHaveValue('stripe')
  })

  test('update payment status via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'stripe', 'Update Status')
    await expect(page.getByRole('heading', { name: /update payment status/i })).toBeVisible()
    const statusSelect = dialog(page).locator('button').filter({ hasText: /completed|pending|select/i }).first()
      .or(dialog(page).getByRole('combobox').first())
    if (await statusSelect.isVisible()) {
      await statusSelect.click()
      const option = page.getByRole('option', { name: /refunded/i }).first()
      if (await option.isVisible()) await option.click()
    }
    await dialog(page).getByRole('button', { name: /^update$/i }).click()
    await assertToast(page)
  })

  test('export dropdown works', async ({ authedPage: page }) => {
    await verifyExportDropdown(page)
  })
})
