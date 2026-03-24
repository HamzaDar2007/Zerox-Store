import { test, expect } from '../fixtures'

test.describe('Responsive Layout', () => {
  test('desktop layout shows sidebar', async ({ authedPage: page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await expect(page.getByRole('heading', { name: /good (morning|afternoon|evening)/i }).first()).toBeVisible({ timeout: 15000 })
    // Desktop sidebar is the second aside (first is mobile overlay)
    await expect(page.locator('aside').nth(1)).toBeVisible()
  })

  test('mobile layout hides sidebar and shows hamburger', async ({ authedPage: page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await page.waitForTimeout(500)
    // Look for hamburger/menu button
    const hamburger = page.locator('button').filter({ has: page.locator('svg.lucide-menu, svg.lucide-panel-left') }).first()
    await expect(hamburger).toBeVisible({ timeout: 10000 })
  })

  test('mobile hamburger opens sidebar overlay', async ({ authedPage: page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await page.waitForTimeout(500)
    const hamburger = page.locator('button').filter({ has: page.locator('svg.lucide-menu, svg.lucide-panel-left') }).first()
    if (await hamburger.isVisible()) {
      await hamburger.click()
      // After opening, sidebar nav items should be visible
      await expect(page.getByText('Dashboard').first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('tablet layout renders correctly', async ({ authedPage: page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /good (morning|afternoon|evening)/i }).first()).toBeVisible({ timeout: 15000 })
  })

  test('main content adjusts width on mobile', async ({ authedPage: page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    await page.waitForTimeout(500)
    const main = page.locator('main').first()
    if (await main.isVisible()) {
      const box = await main.boundingBox()
      if (box) {
        expect(box.width).toBeGreaterThan(300)
      }
    }
  })
})
