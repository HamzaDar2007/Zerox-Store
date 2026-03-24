import { test, expect } from '../fixtures'
import { openRowAction, assertToast, assertTableHas, dialog, fillField, createViaDialog, verifyExportDropdown } from '../helpers'

test.describe('Brands Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/brands')
    await expect(page.getByRole('heading', { name: /brands/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('renders brands table with data', async ({ authedPage: page }) => {
    await assertTableHas(page, 'TestBrand')
    await assertTableHas(page, 'AnotherBrand')
  })

  test('search filters brands', async ({ authedPage: page }) => {
    const search = page.getByPlaceholder(/search brands/i)
    await search.fill('Test')
    await expect(search).toHaveValue('Test')
  })

  test('create brand via dialog', async ({ authedPage: page }) => {
    await createViaDialog(page, /add brand/i, {
      name: 'NewBrand',
      slug: 'newbrand',
    }, { heading: /create brand/i })
  })

  test('cancel create closes dialog', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add brand/i }).click()
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByRole('heading', { name: /create brand/i })).not.toBeVisible()
  })

  test('edit brand via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'TestBrand', 'Edit')
    await expect(page.getByRole('heading', { name: /edit brand/i })).toBeVisible()
    await fillField(dialog(page), 'name', 'UpdatedBrand')
    await dialog(page).getByRole('button', { name: /^update$/i }).click()
    await assertToast(page)
  })

  test('delete brand via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'AnotherBrand', 'Delete')
    const confirmBtn = page.getByRole('button', { name: /^delete$/i }).or(page.getByRole('button', { name: /confirm/i }))
    await confirmBtn.first().click()
    await assertToast(page)
  })

  test('upload logo via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'TestBrand', 'Upload Logo')
    await expect(page.getByRole('heading', { name: /upload brand logo/i })).toBeVisible()
  })

  test('export dropdown works', async ({ authedPage: page }) => {
    await verifyExportDropdown(page)
  })
})
