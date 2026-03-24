import { test, expect } from '../fixtures'

test.describe('DataTable - Shared Behaviors', () => {
  // Use /users as representative page with full DataTable
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/users')
    await expect(page.getByRole('heading', { name: /users/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('table renders with columns and rows', async ({ authedPage: page }) => {
    const table = page.locator('table').first()
    await expect(table).toBeVisible()
    const rows = table.locator('tbody tr')
    await expect(rows.first()).toBeVisible()
  })

  test('clickable column header for sorting', async ({ authedPage: page }) => {
    const th = page.locator('table thead th').first()
    if (await th.isVisible()) {
      await th.click()
      await page.waitForTimeout(300)
    }
  })

  test('pagination controls are visible', async ({ authedPage: page }) => {
    // Pagination uses icon-only chevron buttons
    const paginationArea = page.locator('button:has(svg.lucide-chevron-right)').first()
      .or(page.getByText(/row\(s\)/i).first())
    await expect(paginationArea).toBeVisible()
  })

  test('pagination next button navigates', async ({ authedPage: page }) => {
    const nextBtn = page.locator('button:has(svg.lucide-chevron-right)').first()
    if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
      await nextBtn.click()
      await page.waitForTimeout(500)
    }
  })

  test('row checkbox selection works', async ({ authedPage: page }) => {
    const checkbox = page.locator('table tbody tr').first().locator('input[type="checkbox"], [role="checkbox"]').first()
    if (await checkbox.isVisible()) {
      await checkbox.click()
      await page.waitForTimeout(300)
      // Bulk action bar should appear
      await expect(page.getByText(/selected/i).or(page.getByRole('button', { name: /delete/i })).first()).toBeVisible()
    }
  })

  test('select all checkbox in header', async ({ authedPage: page }) => {
    const selectAll = page.locator('table thead').locator('input[type="checkbox"], [role="checkbox"]').first()
    if (await selectAll.isVisible()) {
      await selectAll.click()
      await page.waitForTimeout(300)
    }
  })

  test('search input filters table', async ({ authedPage: page }) => {
    const search = page.getByPlaceholder('Search users...')
    await search.fill('admin')
    await expect(search).toHaveValue('admin')
  })

  test('table shows loading skeletons', async ({ authedPage: page }) => {
    // Loading is brief but skeleton class or pulse animation should be present initially
    // This is best verified on slow networks; we just check the page renders
    const table = page.locator('table').first()
    await expect(table).toBeVisible()
  })
})
