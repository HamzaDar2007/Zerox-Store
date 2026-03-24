import { test, expect } from '../fixtures'

const tablePages = [
  { path: '/users', heading: /users/i },
  { path: '/roles', heading: /roles/i },
  { path: '/permissions', heading: /permissions/i },
  { path: '/categories', heading: /categories/i },
  { path: '/brands', heading: /brands/i },
  { path: '/sellers', heading: /sellers/i },
  { path: '/stores', heading: /stores/i },
  { path: '/products', heading: /products/i },
  { path: '/orders', heading: /orders/i },
  { path: '/coupons', heading: /coupons/i },
  { path: '/reviews', heading: /reviews/i },
]

for (const { path, heading } of tablePages) {
  test.describe(`Empty State - ${path}`, () => {
    test(`shows empty table on ${path}`, async ({ emptyPage: page }) => {
      await page.goto(path)
      await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible({ timeout: 10000 })
      // Table should render but with no data rows or an "no data" message
      const noData = page.getByText(/no .*found/i)
        .or(page.getByText(/no data/i))
        .or(page.getByText(/no results/i))
        .or(page.locator('table tbody tr td[colspan]'))
      await expect(noData.first()).toBeVisible({ timeout: 5000 })
    })
  })
}
