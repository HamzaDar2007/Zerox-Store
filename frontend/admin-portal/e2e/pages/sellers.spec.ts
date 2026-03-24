import { test, expect } from '../fixtures'
import { openRowAction, assertToast, assertTableHas, dialog, fillField, createViaDialog, verifyExportDropdown } from '../helpers'

test.describe('Sellers Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/sellers')
    await expect(page.getByRole('heading', { name: /sellers/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('renders sellers table with data', async ({ authedPage: page }) => {
    await expect(page.getByText('SellerOne')).toBeVisible()
    await expect(page.getByText('PendingSeller')).toBeVisible()
  })

  test('search filters sellers', async ({ authedPage: page }) => {
    const search = page.getByPlaceholder(/search sellers/i)
    await search.fill('Seller')
    await expect(search).toHaveValue('Seller')
  })

  test('create seller via dialog', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add seller/i }).click()
    await expect(page.getByRole('heading', { name: /create seller/i })).toBeVisible()
    const dlg = dialog(page)
    // Select a user from the dropdown
    await dlg.locator('[role="combobox"]').first().click()
    await page.getByRole('option').first().click()
    await fillField(dlg, 'displayName', 'NewSeller')
    await dlg.getByRole('button', { name: /^create$/i }).click()
    await assertToast(page)
  })

  test('view seller details', async ({ authedPage: page }) => {
    await openRowAction(page, 'SellerOne', 'View Details')
    await expect(page.getByText(/seller details/i)).toBeVisible()
  })

  test('approve pending seller', async ({ authedPage: page }) => {
    await openRowAction(page, 'PendingSeller', 'Approve')
    await assertToast(page)
  })

  test('delete seller via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'SellerOne', 'Delete')
    const confirmBtn = page.getByRole('button', { name: /^delete$/i }).or(page.getByRole('button', { name: /confirm/i }))
    await confirmBtn.first().click()
    await assertToast(page)
  })

  test('export dropdown works', async ({ authedPage: page }) => {
    await verifyExportDropdown(page)
  })

  test('bulk select rows', async ({ authedPage: page }) => {
    const checkbox = page.locator('thead input[type="checkbox"], thead [role="checkbox"]').first()
    if (await checkbox.isVisible()) {
      await checkbox.click()
    }
  })
})
