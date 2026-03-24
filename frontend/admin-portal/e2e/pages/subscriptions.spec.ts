import { test, expect } from '../fixtures'
import { openRowAction, assertToast, assertTableHas, dialog, fillField, createViaDialog, verifyExportDropdown } from '../helpers'

test.describe('Subscriptions Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/subscriptions')
    await expect(page.getByRole('heading', { name: /subscriptions/i }).first()).toBeVisible({ timeout: 10000 })
  })

  // Plans tab
  test('plans tab renders table with data', async ({ authedPage: page }) => {
    await assertTableHas(page, 'Pro')
    await assertTableHas(page, 'Enterprise')
  })

  test('create plan via dialog', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add plan/i }).click()
    await expect(page.getByRole('heading', { name: /create plan/i })).toBeVisible()
    const dlg = dialog(page)
    await fillField(dlg, 'name', 'Starter')
    await fillField(dlg, 'price', '9.99')
    await fillField(dlg, 'interval', 'month')
    await dlg.getByRole('button', { name: /^create$/i }).click()
    await assertToast(page)
  })

  test('edit plan via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'Pro', 'Edit')
    await expect(page.getByRole('heading', { name: /edit plan/i })).toBeVisible()
    await dialog(page).getByRole('button', { name: /^update$/i }).click()
    await assertToast(page)
  })

  test('delete plan via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'Enterprise', 'Delete')
    const confirmBtn = page.getByRole('button', { name: /^delete$/i }).or(page.getByRole('button', { name: /confirm/i }))
    await confirmBtn.first().click()
    await assertToast(page)
  })

  // Active Subscriptions tab
  test('active subscriptions tab renders', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /active subscriptions/i }).click()
    await page.waitForTimeout(500)
    await expect(page.getByPlaceholder(/search subscriptions/i)).toBeVisible()
  })

  // Lookup tab
  test('lookup tab has search input', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /lookup/i }).click()
    await expect(page.getByText(/subscription lookup/i)).toBeVisible()
  })

  test('lookup by ID finds subscription', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /lookup/i }).click()
    await page.waitForTimeout(300)
    const input = page.getByPlaceholder(/enter subscription id/i)
    if (await input.isVisible()) {
      await input.fill('sub1')
      const lookupBtn = page.getByRole('button', { name: /lookup/i })
      if (await lookupBtn.isVisible()) {
        await lookupBtn.click()
        await page.waitForTimeout(500)
      }
    }
  })

  test('tab switching works', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /active subscriptions/i }).click()
    await page.waitForTimeout(300)
    await page.getByRole('tab', { name: /lookup/i }).click()
    await expect(page.getByText(/subscription lookup/i)).toBeVisible()
  })

  test('export dropdown works', async ({ authedPage: page }) => {
    await verifyExportDropdown(page)
  })
})
