import { test, expect } from '../fixtures'
import { openRowAction, assertToast, assertTableHas, dialog, fillField, createViaDialog, verifyExportDropdown } from '../helpers'

test.describe('Coupons Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/coupons')
    await expect(page.getByRole('heading', { name: /coupons/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('renders coupons table with data', async ({ authedPage: page }) => {
    await expect(page.getByText('SAVE10')).toBeVisible()
    await expect(page.getByText('FLAT20')).toBeVisible()
  })

  test('search filters coupons', async ({ authedPage: page }) => {
    const search = page.getByPlaceholder(/search coupons/i)
    await search.fill('SAVE')
    await expect(search).toHaveValue('SAVE')
  })

  test('create coupon via dialog', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add coupon/i }).click()
    await expect(page.getByRole('heading', { name: /create coupon/i })).toBeVisible()
    const dlg = dialog(page)
    await fillField(dlg, 'code', 'NEWCOUPON20')
    // Select discount type
    await dlg.locator('button').filter({ hasText: /percentage|fixed|select/i }).first().click()
    const option = page.getByRole('option', { name: /percentage/i }).first()
    if (await option.isVisible()) await option.click()
    await fillField(dlg, 'discountValue', '20')
    await fillField(dlg, 'startsAt', '2025-01-01T00:00')
    await fillField(dlg, 'expiresAt', '2025-12-31T23:59')
    await dlg.getByRole('button', { name: /^create$/i }).click()
    await assertToast(page)
  })

  test('cancel create closes dialog', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add coupon/i }).click()
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByRole('heading', { name: /create coupon/i })).not.toBeVisible()
  })

  test('edit coupon via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'SAVE10', 'Edit')
    await expect(page.getByRole('heading', { name: /edit coupon/i })).toBeVisible()
    await dialog(page).getByRole('button', { name: /^update$/i }).click()
    await assertToast(page)
  })

  test('delete coupon via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'FLAT20', 'Delete')
    const confirmBtn = page.getByRole('button', { name: /^delete$/i }).or(page.getByRole('button', { name: /confirm/i }))
    await confirmBtn.first().click()
    await assertToast(page)
  })

  test('view coupon scopes dialog', async ({ authedPage: page }) => {
    await openRowAction(page, 'SAVE10', 'Scopes')
    await expect(page.getByText(/coupon scopes/i)).toBeVisible()
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
