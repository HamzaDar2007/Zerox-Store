import { test, expect } from '../fixtures'
import { openRowAction, assertToast, assertTableHas, dialog, fillField, createViaDialog, verifyExportDropdown } from '../helpers'

test.describe('Shipping Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/shipping')
    await expect(page.getByRole('heading', { name: /shipping/i }).first()).toBeVisible({ timeout: 10000 })
  })

  // Zones tab
  test('zones tab renders table with data', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /zones/i }).click()
    await expect(page.getByText('Domestic')).toBeVisible()
  })

  test('create zone via dialog', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /zones/i }).click()
    await createViaDialog(page, /add zone/i, { name: 'Pacific' }, { heading: /create.*shipping zone/i })
  })

  test('edit zone via row action', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /zones/i }).click()
    await openRowAction(page, 'Domestic', 'Edit')
    await expect(page.getByRole('heading', { name: /edit.*shipping zone/i })).toBeVisible()
    await dialog(page).getByRole('button', { name: /^update$/i }).click()
    await assertToast(page)
  })

  test('manage zone countries via row action', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /zones/i }).click()
    await openRowAction(page, 'Domestic', 'Countries')
    await expect(page.getByText(/zone countries/i)).toBeVisible()
  })

  // Methods tab
  test('methods tab renders table with data', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /methods/i }).click()
    await expect(page.getByText('Standard').first()).toBeVisible()
    await expect(page.getByText('Express').first()).toBeVisible()
  })

  test('create method via dialog', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /methods/i }).click()
    await page.getByRole('button', { name: /add method/i }).click()
    await expect(page.getByRole('heading', { name: /create.*shipping method/i })).toBeVisible()
    const dlg = dialog(page)
    await fillField(dlg, 'name', 'Overnight')
    await fillField(dlg, 'zoneId', 'z1')
    await fillField(dlg, 'baseRate', '25.99')
    await dlg.getByRole('button', { name: /^create$/i }).click()
    await assertToast(page)
  })

  test('edit method via row action', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /methods/i }).click()
    await openRowAction(page, 'Standard', 'Edit')
    await expect(page.getByRole('heading', { name: /edit.*shipping method/i })).toBeVisible()
    await dialog(page).getByRole('button', { name: /^update$/i }).click()
    await assertToast(page)
  })

  // Shipments tab
  test('shipments tab has create shipment button', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /shipments/i }).click()
    await expect(page.getByRole('button', { name: /create shipment/i })).toBeVisible()
  })

  test('create shipment dialog opens', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /shipments/i }).click()
    await page.getByRole('button', { name: /create shipment/i }).click()
    await expect(page.getByRole('heading', { name: /create shipment/i })).toBeVisible()
  })

  test('shipments tab has order ID lookup', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /shipments/i }).click()
    const lookup = page.getByPlaceholder(/enter order id/i).or(page.getByPlaceholder(/order id/i))
    await expect(lookup.first()).toBeVisible()
  })

  test('tab switching works', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /zones/i }).click()
    await expect(page.getByText('Domestic')).toBeVisible()
    await page.getByRole('tab', { name: /methods/i }).click()
    await expect(page.getByText('Standard').first()).toBeVisible()
    await page.getByRole('tab', { name: /shipments/i }).click()
    await expect(page.getByRole('button', { name: /create shipment/i })).toBeVisible()
  })
})
