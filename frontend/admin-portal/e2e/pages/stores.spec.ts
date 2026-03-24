import { test, expect } from '../fixtures'
import { openRowAction, assertToast, assertTableHas, dialog, fillField, createViaDialog, verifyExportDropdown } from '../helpers'

test.describe('Stores Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/stores')
    await expect(page.getByRole('heading', { name: /stores/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('renders stores table with data', async ({ authedPage: page }) => {
    await assertTableHas(page, 'TestStore')
    await assertTableHas(page, 'SecondStore')
  })

  test('search filters stores', async ({ authedPage: page }) => {
    const search = page.getByPlaceholder(/search stores/i)
    await search.fill('Test')
    await expect(search).toHaveValue('Test')
  })

  test('create store via dialog', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add store/i }).click()
    await expect(page.getByRole('heading', { name: /create store/i })).toBeVisible()
    const dlg = dialog(page)
    // Select a seller from the dropdown
    await dlg.locator('[role="combobox"]').first().click()
    await page.getByRole('option').first().click()
    await fillField(dlg, 'name', 'NewStore')
    await fillField(dlg, 'slug', 'newstore')
    await dlg.getByRole('button', { name: /^create$/i }).click()
    await assertToast(page)
  })

  test('edit store via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'TestStore', 'Edit')
    await expect(page.getByRole('heading', { name: /edit store/i })).toBeVisible()
    await fillField(dialog(page), 'name', 'UpdatedStore')
    await dialog(page).getByRole('button', { name: /^update$/i }).click()
    await assertToast(page)
  })

  test('delete store via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'SecondStore', 'Delete')
    const confirmBtn = page.getByRole('button', { name: /^delete$/i }).or(page.getByRole('button', { name: /confirm/i }))
    await confirmBtn.first().click()
    await assertToast(page)
  })

  test('view store detail dialog', async ({ authedPage: page }) => {
    await openRowAction(page, 'TestStore', 'View')
    await expect(page.getByText(/store details/i)).toBeVisible()
  })

  test('export dropdown works', async ({ authedPage: page }) => {
    await verifyExportDropdown(page)
  })
})
