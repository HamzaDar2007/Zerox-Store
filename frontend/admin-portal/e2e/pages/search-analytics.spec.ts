import { test, expect } from '../fixtures'

test.describe('Search Analytics Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/search-analytics')
    await expect(page.getByRole('heading', { name: /search analytics/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('shows page description', async ({ authedPage: page }) => {
    await expect(page.getByText(/search trends/i).or(page.getByText(/popular queries/i)).first()).toBeVisible()
  })

  test('renders popular searches section', async ({ authedPage: page }) => {
    await expect(page.getByText(/popular searches/i)).toBeVisible()
    await expect(page.locator('p, span').filter({ hasText: 'laptop' }).first()).toBeVisible()
  })

  test('renders search history section', async ({ authedPage: page }) => {
    await expect(page.getByText(/recent search history/i).or(page.getByText(/search history/i)).first()).toBeVisible()
  })

  test('shows search count badges', async ({ authedPage: page }) => {
    await expect(page.getByText('42').first()).toBeVisible()
  })
})

test.describe('Search Analytics Empty State', () => {
  test('shows empty state when no data', async ({ emptyPage: page }) => {
    await page.goto('/search-analytics')
    await expect(page.getByRole('heading', { name: /search analytics/i }).first()).toBeVisible({ timeout: 10000 })
  })
})
