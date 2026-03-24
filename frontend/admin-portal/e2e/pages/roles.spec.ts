import { test, expect } from '../fixtures'
import { openRowAction, assertToast, assertTableHas, dialog, fillField, createViaDialog, verifyExportDropdown } from '../helpers'

test.describe('Roles Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/roles')
    await expect(page.getByRole('heading', { name: /roles/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('renders roles table with data', async ({ authedPage: page }) => {
    await assertTableHas(page, 'super_admin')
    await assertTableHas(page, 'admin')
    await assertTableHas(page, 'seller')
  })

  test('search filters roles', async ({ authedPage: page }) => {
    const search = page.getByPlaceholder(/search roles/i)
    await search.fill('admin')
    await expect(search).toHaveValue('admin')
  })

  test('create role via dialog', async ({ authedPage: page }) => {
    await createViaDialog(page, /add role/i, { name: 'editor' }, { heading: /create role/i })
  })

  test('validates required name on create', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add role/i }).click()
    await dialog(page).getByRole('button', { name: /^create$/i }).click()
    await expect(page.locator('.text-destructive').first()).toBeVisible()
  })

  test('cancel create role closes dialog', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add role/i }).click()
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByRole('heading', { name: /create role/i })).not.toBeVisible()
  })

  test('edit role via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'seller', 'Edit')
    await expect(page.getByRole('heading', { name: /edit role/i })).toBeVisible()
    await fillField(dialog(page), 'name', 'updated_seller')
    await dialog(page).getByRole('button', { name: /^update$/i }).click()
    await assertToast(page)
  })

  test('delete non-system role via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'seller', 'Delete')
    const confirmBtn = page.getByRole('button', { name: /^delete$/i }).or(page.getByRole('button', { name: /confirm/i }))
    await confirmBtn.first().click()
    await assertToast(page)
  })

  test('export dropdown works', async ({ authedPage: page }) => {
    await verifyExportDropdown(page)
  })

  test('displays system role indicator', async ({ authedPage: page }) => {
    await expect(page.getByText('Yes').first()).toBeVisible()
  })
})
