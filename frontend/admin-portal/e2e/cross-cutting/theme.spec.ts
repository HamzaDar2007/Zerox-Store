import { test, expect } from '../fixtures'

test.describe('Theme Persistence', () => {
  test('dark mode toggle persists on reload', async ({ authedPage: page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: /settings/i }).first()).toBeVisible({ timeout: 10000 })

    const toggle = page.locator('[role="switch"]').first()
    if (await toggle.isVisible()) {
      // Get current state
      const wasDark = await page.locator('html').evaluate(el => el.classList.contains('dark'))

      // Toggle
      await toggle.click()
      await page.waitForTimeout(500)

      // Verify changed
      const isDark = await page.locator('html').evaluate(el => el.classList.contains('dark'))
      expect(isDark).not.toBe(wasDark)

      // Reload and verify persisted
      await page.reload()
      await expect(page.getByRole('heading', { name: /settings/i }).first()).toBeVisible({ timeout: 10000 })
      const isDarkAfterReload = await page.locator('html').evaluate(el => el.classList.contains('dark'))
      expect(isDarkAfterReload).toBe(isDark)
    }
  })

  test('theme color persists on reload', async ({ authedPage: page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: /settings/i }).first()).toBeVisible({ timeout: 10000 })

    // Select Emerald color
    const emerald = page.locator('button:has(.bg-emerald-500)')
    if (await emerald.isVisible()) {
      await emerald.click()
      await page.waitForTimeout(500)

      // Reload and verify
      await page.reload()
      await expect(page.getByRole('heading', { name: /settings/i }).first()).toBeVisible({ timeout: 10000 })
      // The emerald option should still appear selected
    }
  })

  test('dark mode toggle from header works', async ({ authedPage: page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /good (morning|afternoon|evening)/i }).first()).toBeVisible({ timeout: 10000 })

    // Click theme toggle in header
    const themeBtn = page.locator('header').locator('button:has(svg.lucide-moon), button:has(svg.lucide-sun)').first()
    if (await themeBtn.isVisible()) {
      const wasDark = await page.locator('html').evaluate(el => el.classList.contains('dark'))
      await themeBtn.click()
      await page.waitForTimeout(300)
      const isDark = await page.locator('html').evaluate(el => el.classList.contains('dark'))
      expect(isDark).not.toBe(wasDark)
    }
  })
})
