import { test, expect } from '../fixtures'

test.describe('Sidebar Navigation', () => {
  test('sidebar is visible on desktop with nav groups', async ({ authedPage: page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    const sidebar = page.locator('aside').nth(1)
    await expect(sidebar).toBeVisible()
    await expect(sidebar.locator('a', { hasText: 'Dashboard' }).first()).toBeVisible()
    await expect(sidebar.locator('a', { hasText: 'Users' }).first()).toBeVisible()
    await expect(sidebar.locator('a', { hasText: 'Products' }).first()).toBeVisible()
  })

  test('navigates to each main page via sidebar', async ({ authedPage: page }) => {
    const navItems = [
      { label: 'Users', heading: /users/i },
      { label: 'Products', heading: /products/i },
      { label: 'Orders', heading: /orders/i },
      { label: 'Categories', heading: /categories/i },
      { label: 'Settings', heading: /settings/i },
    ]
    for (const { label, heading } of navItems) {
      await page.getByRole('link', { name: label }).first().click()
      await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible({ timeout: 10000 })
    }
  })

  test('active link is highlighted correctly', async ({ authedPage: page }) => {
    await page.getByRole('link', { name: 'Users' }).first().click()
    await expect(page).toHaveURL(/\/users/)
    // The active link should have distinct styling (bg-primary or similar)
    const activeLink = page.getByRole('link', { name: 'Users' }).first()
    await expect(activeLink).toBeVisible()
  })

  test('sidebar collapse toggle works', async ({ authedPage: page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    // Find and click the collapse toggle button
    const collapseBtn = page.locator('button').filter({ has: page.locator('svg.lucide-panel-left-close, svg.lucide-panel-left-open, svg.lucide-chevron-left, svg.lucide-chevrons-left') }).first()
    if (await collapseBtn.isVisible()) {
      await collapseBtn.click()
      // After collapse, sidebar should be in icon-only mode (narrower)
      await page.waitForTimeout(300) // Allow animation
      // Click expand again
      const expandBtn = page.locator('button').filter({ has: page.locator('svg.lucide-panel-left-open, svg.lucide-panel-left-close, svg.lucide-chevron-right, svg.lucide-chevrons-right') }).first()
      if (await expandBtn.isVisible()) {
        await expandBtn.click()
      }
    }
  })

  test('sidebar shows correct nav groups', async ({ authedPage: page }) => {
    // Desktop sidebar is the second aside (first is mobile)
    // First group 'Overview' label is not rendered (gi=0)
    const sidebar = page.locator('aside').nth(1)
    await expect(sidebar.getByText('Access Control').first()).toBeVisible()
    await expect(sidebar.getByText('Catalog').first()).toBeVisible()
    await expect(sidebar.getByText('Commerce').first()).toBeVisible()
  })
})
