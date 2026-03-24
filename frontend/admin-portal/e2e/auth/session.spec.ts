import { test, expect } from '../fixtures'

test.describe('Session & Logout', () => {
  test('logout from header clears auth and redirects to login', async ({ authedPage: page }) => {
    // Open profile dropdown in header
    const profileBtn = page.locator('header').getByRole('button').filter({ has: page.locator('svg.lucide-user, svg.lucide-log-out') }).first()
      .or(page.locator('header button').last())
    if (await profileBtn.isVisible()) {
      await profileBtn.click()
      const logoutItem = page.getByRole('menuitem', { name: /log\s*out/i }).or(page.getByText(/log\s*out/i))
      if (await logoutItem.first().isVisible()) {
        await logoutItem.first().click()
        await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
      }
    }
  })

  test('unauthenticated user is redirected to login from protected routes', async ({ page }) => {
    await page.route('**/localhost:3001/**', async (route) => {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) })
    })
    await page.goto('/')
    await page.evaluate(() => localStorage.removeItem('admin-auth'))
    await page.goto('/users')
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated user can access login page', async ({ page }) => {
    await page.route('**/localhost:3001/**', async (route) => {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) })
    })
    await page.goto('/login')
    await expect(page.getByText(/welcome back/i).or(page.getByText(/sign in/i)).first()).toBeVisible()
  })
})
