import { test, expect } from '../fixtures'
import { openRowAction, assertToast, assertTableHas, dialog, fillField, createViaDialog, verifyExportDropdown } from '../helpers'

test.describe('Inventory Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/inventory')
    await expect(page.getByRole('heading', { name: /inventory/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('warehouses tab renders table with data', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /warehouses/i }).click()
    await assertTableHas(page, 'Main Warehouse')
    await assertTableHas(page, 'West Warehouse')
  })

  test('create warehouse via dialog', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /warehouses/i }).click()
    await createViaDialog(page, /add warehouse/i, {
      code: 'WH-03',
      name: 'East Warehouse',
    }, { heading: /create warehouse/i })
  })

  test('edit warehouse via row action', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /warehouses/i }).click()
    await openRowAction(page, 'Main Warehouse', 'Edit')
    await expect(page.getByRole('heading', { name: /edit warehouse/i })).toBeVisible()
    await dialog(page).getByRole('button', { name: /^update$/i }).click()
    await assertToast(page)
  })

  test('delete warehouse via row action', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /warehouses/i }).click()
    await openRowAction(page, 'West Warehouse', 'Delete')
    const confirmBtn = page.getByRole('button', { name: /^delete$/i }).or(page.getByRole('button', { name: /confirm/i }))
    await confirmBtn.first().click()
    await assertToast(page)
  })

  test('stock tab renders inventory data', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /^stock$/i }).first().click()
    await page.waitForTimeout(500)
    const search = page.getByPlaceholder(/search inventory/i)
    await expect(search).toBeVisible()
  })

  test('set stock dialog opens with correct fields', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /^stock$/i }).first().click()
    await page.getByRole('button', { name: /set stock/i }).click()
    await expect(page.getByRole('heading', { name: /set stock/i })).toBeVisible()
    const dlg = dialog(page)
    await expect(dlg.locator('input[name="warehouseId"]')).toBeVisible()
    await expect(dlg.locator('input[name="variantId"]')).toBeVisible()
  })

  test('set stock submission works', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /^stock$/i }).first().click()
    await page.getByRole('button', { name: /set stock/i }).click()
    const dlg = dialog(page)
    await fillField(dlg, 'warehouseId', 'w1')
    await fillField(dlg, 'variantId', 'v1')
    await fillField(dlg, 'qtyOnHand', '200')
    await fillField(dlg, 'lowStockThreshold', '10')
    const submitBtn = dlg.getByRole('button', { name: /set stock/i })
    await submitBtn.click()
    await assertToast(page)
  })

  test('adjust stock dialog opens', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /^stock$/i }).first().click()
    await page.getByRole('button', { name: /adjust stock/i }).click()
    await expect(page.getByRole('heading', { name: /adjust stock/i })).toBeVisible()
  })

  test('reserve stock dialog opens', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /^stock$/i }).first().click()
    await page.getByRole('button', { name: /reserve stock/i }).click()
    await expect(page.getByRole('heading', { name: /reserve stock/i })).toBeVisible()
  })

  test('release reservation dialog opens', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /^stock$/i }).first().click()
    await page.getByRole('button', { name: /release reservation/i }).click()
    await expect(page.getByRole('heading', { name: /release reservation/i })).toBeVisible()
  })

  test('low stock tab shows filtered data', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /low stock/i }).click()
    await page.waitForTimeout(500)
    const search = page.getByPlaceholder(/search low stock/i)
    await expect(search).toBeVisible()
  })

  test('tab switching works', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /warehouses/i }).click()
    await assertTableHas(page, 'Main Warehouse')
    await page.getByRole('tab', { name: /^stock$/i }).first().click()
    await page.waitForTimeout(500)
    await page.getByRole('tab', { name: /low stock/i }).click()
  })
})
