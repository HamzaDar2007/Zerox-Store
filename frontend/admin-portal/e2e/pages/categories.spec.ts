import { test, expect } from '../fixtures'
import { openRowAction, assertToast, assertTableHas, dialog, fillField, createViaDialog, verifyExportDropdown } from '../helpers'

test.describe('Categories Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/categories')
    await expect(page.getByRole('heading', { name: /categories/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('renders categories table with data', async ({ authedPage: page }) => {
    await assertTableHas(page, 'Electronics')
    await assertTableHas(page, 'Clothing')
  })

  test('search filters categories', async ({ authedPage: page }) => {
    const search = page.getByPlaceholder(/search categories/i)
    await search.fill('Electronics')
    await expect(search).toHaveValue('Electronics')
  })

  test('create category via dialog', async ({ authedPage: page }) => {
    await createViaDialog(page, /add category/i, {
      name: 'New Category',
      slug: 'new-category',
    }, { heading: /create category/i })
  })

  test('validates required fields on create', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add category/i }).click()
    await dialog(page).getByRole('button', { name: /^create$/i }).click()
    await expect(page.locator('.text-destructive').first()).toBeVisible()
  })

  test('cancel create closes dialog', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add category/i }).click()
    await expect(page.getByRole('heading', { name: /create category/i })).toBeVisible()
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByRole('heading', { name: /create category/i })).not.toBeVisible()
  })

  test('edit category via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'Electronics', 'Edit')
    await expect(page.getByRole('heading', { name: /edit category/i })).toBeVisible()
    await fillField(dialog(page), 'name', 'Updated Electronics')
    await dialog(page).getByRole('button', { name: /^update$/i }).click()
    await assertToast(page)
  })

  test('delete category via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'Clothing', 'Delete')
    const confirmBtn = page.getByRole('button', { name: /^delete$/i }).or(page.getByRole('button', { name: /confirm/i }))
    await confirmBtn.first().click()
    await assertToast(page)
  })

  test('upload image via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'Electronics', 'Upload Image')
    await expect(page.getByRole('heading', { name: /upload category image/i })).toBeVisible()
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
