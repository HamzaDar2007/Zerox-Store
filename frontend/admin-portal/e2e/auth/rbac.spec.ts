import { test, expect } from '../fixtures'

test.describe('RBAC - Role-Based Access Control', () => {
  test('seller cannot access admin-only routes', async ({ sellerPage: page }) => {
    const adminRoutes = ['/users', '/roles', '/permissions', '/role-permissions', '/payments', '/audit', '/search-analytics']
    for (const route of adminRoutes) {
      await page.goto(route)
      await expect(page.getByRole('heading', { name: /403/i })).toBeVisible({ timeout: 10000 })
    }
  })

  test('seller can access general routes', async ({ sellerPage: page }) => {
    const allowedRoutes = [
      { path: '/products', heading: /products/i },
      { path: '/orders', heading: /orders/i },
      { path: '/categories', heading: /categories/i },
      { path: '/brands', heading: /brands/i },
    ]
    for (const { path, heading } of allowedRoutes) {
      await page.goto(path)
      await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible({ timeout: 10000 })
    }
  })

  test('admin can access all routes', async ({ authedPage: page }) => {
    const adminRoutes = [
      { path: '/users', heading: /users/i },
      { path: '/roles', heading: /roles/i },
      { path: '/permissions', heading: /permissions/i },
      { path: '/payments', heading: /payments/i },
      { path: '/audit', heading: /audit/i },
    ]
    for (const { path, heading } of adminRoutes) {
      await page.goto(path)
      await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible({ timeout: 10000 })
    }
  })
})
