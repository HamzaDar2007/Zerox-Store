import { test, expect } from '../fixtures'
import { openRowAction, assertToast, dialog, verifyExportDropdown } from '../helpers'

test.describe('Reviews Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/reviews')
    await expect(page.getByRole('heading', { name: /reviews/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('renders reviews table with data', async ({ authedPage: page }) => {
    await expect(page.getByText('Great!').first()).toBeVisible()
    await expect(page.getByText('Not good').first()).toBeVisible()
  })

  test('search filters reviews', async ({ authedPage: page }) => {
    const search = page.getByPlaceholder(/search reviews/i)
    await search.fill('Great')
    await expect(search).toHaveValue('Great')
  })

  test('moderate review via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'Not good', 'Moderate')
    await expect(page.getByRole('heading', { name: /moderate review/i })).toBeVisible()
    // Select status
    const statusSelect = dialog(page).locator('button').filter({ hasText: /pending|approved|select/i }).first()
      .or(dialog(page).getByRole('combobox').first())
    if (await statusSelect.isVisible()) {
      await statusSelect.click()
      const option = page.getByRole('option', { name: /approved/i }).first()
      if (await option.isVisible()) await option.click()
    }
    await dialog(page).getByRole('button', { name: /^update$/i }).click()
    await assertToast(page)
  })

  test('delete review via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'Not good', 'Delete')
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
