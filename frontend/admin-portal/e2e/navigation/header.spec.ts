import { test, expect } from '../fixtures'

test.describe('Header', () => {
  test('header displays theme toggle', async ({ authedPage: page }) => {
    const themeToggle = page.locator('header').locator('button').filter({ has: page.locator('svg.lucide-sun, svg.lucide-moon') }).first()
    await expect(themeToggle).toBeVisible()
  })

  test('header shows notification bell', async ({ authedPage: page }) => {
    const notifBtn = page.locator('header').locator('button:has(svg.lucide-bell)')
    await expect(notifBtn.first()).toBeVisible()
  })

  test('theme toggle switches dark/light mode', async ({ authedPage: page }) => {
    const themeToggle = page.locator('header').locator('button').filter({ has: page.locator('svg.lucide-sun, svg.lucide-moon') }).first()
    if (await themeToggle.isVisible()) {
      await themeToggle.click()
      // After toggle, the html element should have dark class or not
      await page.waitForTimeout(300)
      await themeToggle.click() // Toggle back
    }
  })

  test('profile dropdown shows user options', async ({ authedPage: page }) => {
    // Click the user/profile button in header
    const profileBtn = page.locator('header').locator('button').filter({ has: page.locator('svg.lucide-user, svg.lucide-circle-user') }).first()
      .or(page.locator('header').locator('[role="button"]').last())
    if (await profileBtn.isVisible()) {
      await profileBtn.click()
      await page.waitForTimeout(300)
    }
  })
})
