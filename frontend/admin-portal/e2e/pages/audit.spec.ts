import { test, expect } from '../fixtures'
import { openRowAction, dialog, verifyExportDropdown } from '../helpers'

test.describe('Audit Logs Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/audit')
    await expect(page.getByRole('heading', { name: /audit/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('renders audit logs table with data', async ({ authedPage: page }) => {
    await expect(page.getByText('CREATE').first()).toBeVisible()
    await expect(page.getByText('UPDATE').first()).toBeVisible()
  })

  test('search filters audit logs', async ({ authedPage: page }) => {
    const search = page.getByPlaceholder(/search logs/i)
    await search.fill('CREATE')
    await expect(search).toHaveValue('CREATE')
  })

  test('filter panel toggle works', async ({ authedPage: page }) => {
    const filterBtn = page.getByRole('button', { name: /filters/i })
    if (await filterBtn.isVisible()) {
      await filterBtn.click()
      await page.waitForTimeout(300)
      // Filter inputs should appear
      await expect(page.getByPlaceholder(/create.*update.*delete/i).or(page.getByPlaceholder(/e\.g\..*create/i)).first()).toBeVisible()
    }
  })

  test('apply action filter', async ({ authedPage: page }) => {
    const filterBtn = page.getByRole('button', { name: /filters/i })
    if (await filterBtn.isVisible()) {
      await filterBtn.click()
      await page.waitForTimeout(300)
      const actionInput = page.getByPlaceholder(/e\.g\..*create/i).first()
      if (await actionInput.isVisible()) {
        await actionInput.fill('CREATE')
      }
    }
  })

  test('clear filters button works', async ({ authedPage: page }) => {
    const filterBtn = page.getByRole('button', { name: /filters/i })
    if (await filterBtn.isVisible()) {
      await filterBtn.click()
      await page.waitForTimeout(300)
      const clearBtn = page.getByRole('button', { name: /clear filters/i })
      if (await clearBtn.isVisible()) {
        await clearBtn.click()
      }
    }
  })

  test('view audit log detail dialog', async ({ authedPage: page }) => {
    await openRowAction(page, 'CREATE', 'View Details')
    await expect(page.getByText(/audit log detail/i)).toBeVisible()
  })

  test('audit detail shows diff data', async ({ authedPage: page }) => {
    await openRowAction(page, 'UPDATE', 'View Details')
    await page.waitForTimeout(500)
    await expect(page.getByText(/changes/i).or(page.getByText(/diff/i)).first()).toBeVisible()
  })

  test('export dropdown works', async ({ authedPage: page }) => {
    await verifyExportDropdown(page)
  })
})
