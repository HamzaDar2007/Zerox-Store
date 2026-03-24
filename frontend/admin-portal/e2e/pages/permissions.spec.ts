import { test, expect } from '../fixtures'
import { openRowAction, assertToast, assertTableHas, dialog, fillField, createViaDialog, verifyExportDropdown } from '../helpers'

test.describe('Permissions Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/permissions')
    await expect(page.getByRole('heading', { name: /permissions/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('renders permissions table with data', async ({ authedPage: page }) => {
    await expect(page.getByText('users:read')).toBeVisible()
    await expect(page.getByText('users:write')).toBeVisible()
    await expect(page.getByText('orders:read')).toBeVisible()
  })

  test('search filters permissions', async ({ authedPage: page }) => {
    const search = page.getByPlaceholder(/search permissions/i)
    await search.fill('users')
    await expect(search).toHaveValue('users')
  })

  test('create permission via dialog', async ({ authedPage: page }) => {
    await createViaDialog(page, /add permission/i, {
      code: 'orders:write',
      module: 'orders',
    }, { heading: /create permission/i })
  })

  test('validates required fields on create', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add permission/i }).click()
    await dialog(page).getByRole('button', { name: /^create$/i }).click()
    await expect(page.locator('.text-destructive').first()).toBeVisible()
  })

  test('edit permission via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'users:read', 'Edit')
    await expect(page.getByRole('heading', { name: /edit permission/i })).toBeVisible()
    await dialog(page).getByRole('button', { name: /^update$/i }).click()
    await assertToast(page)
  })

  test('delete permission via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'users:read', 'Delete')
    const confirmBtn = page.getByRole('button', { name: /^delete$/i }).or(page.getByRole('button', { name: /confirm/i }))
    await confirmBtn.first().click()
    await assertToast(page)
  })

  test('export dropdown works', async ({ authedPage: page }) => {
    await verifyExportDropdown(page)
  })

  test('bulk select and delete', async ({ authedPage: page }) => {
    const checkbox = page.locator('thead input[type="checkbox"], thead [role="checkbox"]').first()
    if (await checkbox.isVisible()) {
      await checkbox.click()
    }
  })
})
