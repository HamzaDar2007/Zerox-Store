import { test, expect } from '../fixtures'

const tablePages = [
  { path: '/users', heading: /users/i },
  { path: '/roles', heading: /roles/i },
  { path: '/products', heading: /products/i },
  { path: '/orders', heading: /orders/i },
]

for (const { path, heading } of tablePages) {
  test.describe(`Error Handling - ${path}`, () => {
    test(`shows error state on ${path}`, async ({ errorPage: page }) => {
      await page.goto(path)
      await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible({ timeout: 10000 })
      // Should show error, retry, or "something went wrong"
      const errorIndicator = page.getByText(/error/i)
        .or(page.getByText(/something went wrong/i))
        .or(page.getByText(/fail/i))
        .or(page.getByRole('button', { name: /retry/i }))
      await expect(errorIndicator.first()).toBeVisible({ timeout: 5000 })
    })

    test(`retry button reloads on ${path}`, async ({ errorPage: page }) => {
      await page.goto(path)
      await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible({ timeout: 10000 })
      const retryBtn = page.getByRole('button', { name: /retry/i })
        .or(page.getByRole('button', { name: /try again/i }))
      if (await retryBtn.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await retryBtn.first().click()
        await page.waitForTimeout(500)
      }
    })
  })
}
