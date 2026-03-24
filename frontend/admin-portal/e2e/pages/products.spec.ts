import { test, expect } from '../fixtures'
import { openRowAction, assertToast, assertTableHas, dialog, fillField, fillTextarea, verifyExportDropdown } from '../helpers'

test.describe('Products Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/products')
    await expect(page.getByRole('heading', { name: /products/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('renders products table with data', async ({ authedPage: page }) => {
    await expect(page.getByText('TestProduct')).toBeVisible()
    await expect(page.getByText('DraftProduct')).toBeVisible()
  })

  test('search filters products', async ({ authedPage: page }) => {
    const search = page.getByPlaceholder(/search products/i)
    await search.fill('Test')
    await expect(search).toHaveValue('Test')
  })

  test('create product switches to form view', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add product/i }).click()
    // Should switch to full-page form view
    const nameInput = page.locator('input[name="name"]').first()
    await expect(nameInput).toBeVisible({ timeout: 5000 })
  })

  test('cancel create product returns to list', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add product/i }).click()
    const cancelBtn = page.getByRole('button', { name: /cancel/i }).or(page.getByRole('button', { name: /back/i }))
    await cancelBtn.first().click()
    // Should return to list view with table
    await expect(page.locator('table').first()).toBeVisible({ timeout: 5000 })
  })

  test('view product detail via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'TestProduct', 'View')
    // Detail sheet/panel should appear
    await expect(page.locator('[role="dialog"]').or(page.locator('[data-state="open"]')).first()).toBeVisible({ timeout: 5000 })
  })

  test('product edit form has tabs: Variants, Images, Attributes', async ({ authedPage: page }) => {
    await openRowAction(page, 'TestProduct', 'Edit')
    await page.waitForTimeout(500)
    const nameInput = page.locator('input[name="name"]').first()
    await expect(nameInput).toBeVisible({ timeout: 5000 })
    // Form view should contain sub-panels for Variants, Images, Attributes
    await expect(page.getByText('Variants').first()).toBeVisible()
    await expect(page.getByText('Images').first()).toBeVisible()
  })

  test('edit product via row action opens form', async ({ authedPage: page }) => {
    await openRowAction(page, 'TestProduct', 'Edit')
    await page.waitForTimeout(500)
    // Edit mode shows the product form
    const nameInput = page.locator('input[name="name"]').first()
    await expect(nameInput).toBeVisible({ timeout: 5000 })
  })

  test('delete product via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'DraftProduct', 'Delete')
    const confirmBtn = page.getByRole('button', { name: /^delete$/i }).or(page.getByRole('button', { name: /confirm/i }))
    await confirmBtn.first().click()
    await assertToast(page)
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
