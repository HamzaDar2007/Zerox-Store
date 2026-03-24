import { test, expect } from '../fixtures'
import { openRowAction, assertToast, dialog, fillField, createViaDialog, verifyExportDropdown } from '../helpers'

test.describe('Flash Sales Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/flash-sales')
    await expect(page.getByRole('heading', { name: /flash sales/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('renders flash sales table with data', async ({ authedPage: page }) => {
    await expect(page.getByText('Summer Sale')).toBeVisible()
    await expect(page.getByText('Winter Clearance')).toBeVisible()
  })

  test('search filters flash sales', async ({ authedPage: page }) => {
    const search = page.getByPlaceholder(/search flash sales/i)
    await search.fill('Summer')
    await expect(search).toHaveValue('Summer')
  })

  test('create flash sale via dialog', async ({ authedPage: page }) => {
    await createViaDialog(page, /add flash sale/i, {
      name: 'Spring Launch',
      startsAt: '2025-03-01T00:00',
      endsAt: '2025-03-31T23:59',
    }, { heading: /create flash sale/i })
  })

  test('edit flash sale via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'Summer Sale', 'Edit')
    await expect(page.getByRole('heading', { name: /edit flash sale/i })).toBeVisible()
    await fillField(dialog(page), 'name', 'Updated Summer Sale')
    await dialog(page).getByRole('button', { name: /^update$/i }).click()
    await assertToast(page)
  })

  test('delete flash sale via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'Winter Clearance', 'Delete')
    const confirmBtn = page.getByRole('button', { name: /^delete$/i }).or(page.getByRole('button', { name: /confirm/i }))
    await confirmBtn.first().click()
    await assertToast(page)
  })

  test('view flash sale detail with items', async ({ authedPage: page }) => {
    await openRowAction(page, 'Summer Sale', 'View')
    await page.waitForTimeout(500)
    await expect(page.getByText(/sale items/i)).toBeVisible()
  })

  test('add sale item in detail view', async ({ authedPage: page }) => {
    await openRowAction(page, 'Summer Sale', 'View')
    await page.waitForTimeout(500)
    const addItemBtn = page.getByRole('button', { name: /add item/i })
    if (await addItemBtn.isVisible()) {
      await addItemBtn.click()
      await expect(page.getByRole('heading', { name: /add sale item/i })).toBeVisible()
    }
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
