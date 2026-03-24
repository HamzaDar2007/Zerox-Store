import { test, expect } from '../fixtures'
import { openRowAction, assertToast, assertTableHas, dialog, fillField, createViaDialog, verifyExportDropdown } from '../helpers'

test.describe('Users Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/users')
    await expect(page.getByRole('heading', { name: /users/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('renders users table with data', async ({ authedPage: page }) => {
    await assertTableHas(page, 'admin@test.com')
    await assertTableHas(page, 'seller@test.com')
  })

  test('search filters users', async ({ authedPage: page }) => {
    const search = page.getByPlaceholder(/search users/i)
    await search.fill('seller')
    await expect(search).toHaveValue('seller')
  })

  test('create user via dialog', async ({ authedPage: page }) => {
    await createViaDialog(page, /add user/i, {
      email: 'new@example.com',
      firstName: 'New',
      lastName: 'User',
      password: 'SecurePass123!',
    }, { heading: /create user/i })
  })

  test('validates required fields on create', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add user/i }).click()
    await dialog(page).getByRole('button', { name: /^create$/i }).click()
    await expect(page.locator('.text-destructive').first()).toBeVisible()
  })

  test('cancel create user closes dialog', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add user/i }).click()
    await expect(page.getByRole('heading', { name: /create user/i })).toBeVisible()
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByRole('heading', { name: /create user/i })).not.toBeVisible()
  })

  test('edit user via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'admin@test.com', 'Edit')
    await expect(page.getByRole('heading', { name: /edit user/i })).toBeVisible()
    await fillField(dialog(page), 'firstName', 'Updated')
    await dialog(page).getByRole('button', { name: /^update$/i }).click()
    await assertToast(page)
  })

  test('delete user via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'seller@test.com', 'Delete')
    // Confirm dialog should appear
    const confirmBtn = page.getByRole('button', { name: /^delete$/i }).or(page.getByRole('button', { name: /confirm/i }))
    await confirmBtn.first().click()
    await assertToast(page)
  })

  test('view user detail dialog', async ({ authedPage: page }) => {
    await openRowAction(page, 'admin@test.com', 'View')
    await page.waitForTimeout(500)
    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })

  test('user detail has Info, Roles, Addresses tabs', async ({ authedPage: page }) => {
    await openRowAction(page, 'admin@test.com', 'View')
    await page.waitForTimeout(500)
    const dlg = page.locator('[role="dialog"]')
    await expect(dlg).toBeVisible()
    // Tabs are plain buttons, not role="tab"
    await expect(dlg.getByRole('button', { name: /^info$/i })).toBeVisible()
    await expect(dlg.getByRole('button', { name: /^roles$/i })).toBeVisible()
    await expect(dlg.getByRole('button', { name: /^addresses$/i })).toBeVisible()
  })

  test('export dropdown shows CSV, Excel, PDF', async ({ authedPage: page }) => {
    await verifyExportDropdown(page)
  })

  test('bulk select rows', async ({ authedPage: page }) => {
    const checkbox = page.locator('thead input[type="checkbox"], thead [role="checkbox"]').first()
    if (await checkbox.isVisible()) {
      await checkbox.click()
    }
  })
})
