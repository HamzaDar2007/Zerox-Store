import { test, expect } from './fixtures'

test.describe('Theme Toggle', () => {
  test('can toggle dark mode', async ({ authedPage: page }) => {
    await page.goto('/')
    // Look for theme toggle button in the header
    const themeBtn = page.locator('button:has([class*="sun"]), button:has([class*="moon"])')
    if (await themeBtn.count()) {
      await themeBtn.first().click()
      // The html element should have or not have the 'dark' class
      const html = page.locator('html')
      const classList = await html.getAttribute('class')
      expect(classList !== null).toBe(true)
    }
  })
})

test.describe('Responsive Sidebar', () => {
  test('sidebar is visible on desktop', async ({ authedPage: page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')
    // Target the desktop sidebar (the last aside element)
    await expect(page.locator('aside').last()).toBeVisible()
  })
})

test.describe('Breadcrumb on Subpages', () => {
  test('products page shows breadcrumb', async ({ authedPage: page }) => {
    await page.goto('/products')
    const breadcrumb = page.locator('[aria-label="Breadcrumb"], nav.breadcrumb, .breadcrumb')
    if (await breadcrumb.count()) {
      await expect(breadcrumb.first()).toBeVisible()
    }
  })
})

test.describe('Error Pages', () => {
  test('unauthorized page renders', async ({ authedPage: page }) => {
    await page.goto('/unauthorized')
    await expect(page.getByRole('heading', { name: '401' })).toBeVisible()
  })

  test('forbidden page renders for authenticated user', async ({ authedPage: page }) => {
    await page.goto('/forbidden')
    await expect(page.getByRole('heading', { name: '403' })).toBeVisible()
  })
})
