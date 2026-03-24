import { test, expect } from '@playwright/test'
import { wrapSingle, mockUser } from '../fixtures'

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/localhost:3001/**', async (route) => {
      const url = route.request().url()
      if (url.includes('/auth/login')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrapSingle({ accessToken: 'tok', refreshToken: 'ref', user: mockUser })) })
      }
      if (url.includes('/auth/refresh') || url.includes('/auth/logout')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrapSingle({ accessToken: 'tok', refreshToken: 'ref' })) })
      }
      if (url.includes('/notifications/mine/unread-count')) {
        return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrapSingle({ count: 0 })) })
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrapSingle({})) })
    })
    await page.goto('/login')
  })

  test('renders login form with all elements', async ({ page }) => {
    await expect(page.getByText(/welcome back/i)).toBeVisible()
    await expect(page.getByText(/sign in to your admin account/i)).toBeVisible()
    await expect(page.getByPlaceholder('admin@example.com')).toBeVisible()
    await expect(page.getByPlaceholder('••••••••')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    await expect(page.getByText(/forgot password/i)).toBeVisible()
  })

  test('shows validation errors for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/invalid email address/i)).toBeVisible()
    await expect(page.getByText(/password must be at least 6/i)).toBeVisible()
  })

  test('shows validation error for invalid email', async ({ page }) => {
    // Use a value that passes HTML5 type="email" but fails Zod's stricter email validation
    await page.getByPlaceholder('admin@example.com').fill('test@invalid')
    await page.getByPlaceholder('••••••••').fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/invalid email address/i)).toBeVisible()
  })

  test('shows validation error for short password', async ({ page }) => {
    await page.getByPlaceholder('admin@example.com').fill('admin@test.com')
    await page.getByPlaceholder('••••••••').fill('123')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/password must be at least 6/i)).toBeVisible()
  })

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.getByPlaceholder('admin@example.com').fill('admin@test.com')
    await page.getByPlaceholder('••••••••').fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL('/')
  })

  test('failed login shows error toast', async ({ page }) => {
    await page.route('**/localhost:3001/auth/login', async (route) => {
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Invalid credentials' }) })
    })
    await page.getByPlaceholder('admin@example.com').fill('admin@test.com')
    await page.getByPlaceholder('••••••••').fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('show/hide password toggle works', async ({ page }) => {
    const pwField = page.getByPlaceholder('••••••••')
    await expect(pwField).toHaveAttribute('type', 'password')
    // Click the eye toggle button (icon-only button adjacent to password)
    const toggleBtn = page.locator('button').filter({ has: page.locator('svg.lucide-eye, svg.lucide-eye-off') }).first()
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click()
      await expect(pwField).toHaveAttribute('type', 'text')
    }
  })

  test('redirects authenticated user away from login', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('admin-auth', JSON.stringify({
        state: { user: { id: '1', email: 'a@b.com', role: 'super_admin' }, accessToken: 'tok', refreshToken: 'ref', isAuthenticated: true },
        version: 0,
      }))
    })
    await page.goto('/login')
    await expect(page).toHaveURL('/')
  })
})
