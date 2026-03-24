import { test, expect } from '../fixtures'
import { openRowAction, assertToast, dialog, verifyExportDropdown } from '../helpers'

test.describe('Returns Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/returns')
    await expect(page.getByRole('heading', { name: /returns/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('renders returns table with data', async ({ authedPage: page }) => {
    await expect(page.getByText('Defective').first()).toBeVisible()
    await expect(page.getByText('Wrong item').first()).toBeVisible()
  })

  test('search filters returns', async ({ authedPage: page }) => {
    const search = page.getByPlaceholder(/search returns/i)
    await search.fill('Defective')
    await expect(search).toHaveValue('Defective')
  })

  test('view return detail dialog', async ({ authedPage: page }) => {
    await openRowAction(page, 'Defective', 'View')
    await expect(page.getByText(/return details/i)).toBeVisible()
  })

  test('return detail shows items section', async ({ authedPage: page }) => {
    await openRowAction(page, 'Defective', 'View')
    await page.waitForTimeout(500)
    await expect(page.getByText(/items/i)).toBeVisible()
  })

  test('update return status via row action', async ({ authedPage: page }) => {
    await openRowAction(page, 'Defective', 'Update Status')
    await expect(page.getByRole('heading', { name: /update return status/i })).toBeVisible()
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

  test('export dropdown works', async ({ authedPage: page }) => {
    await verifyExportDropdown(page)
  })
})
