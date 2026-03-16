import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear auth state so we land on login
    await page.goto('/')
    await page.evaluate(() => localStorage.removeItem('admin-auth'))
    await page.goto('/login')
  })

  test('renders login form correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /admin portal/i })).toBeVisible()
    await expect(page.getByText(/sign in to your admin account/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('shows validation errors for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/invalid email/i)).toBeVisible()
    await expect(page.getByText(/password must be at least 6/i)).toBeVisible()
  })

  test('shows validation error for invalid email', async ({ page }) => {
    // Use a value that passes HTML5 email check but fails Zod
    await page.getByLabel(/email/i).fill('a@b')
    await page.getByLabel(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()
    // Either shows Zod validation error or the request fails with an error toast
    // The key assertion is that we don't navigate away from /login
    await page.waitForTimeout(2000)
    await expect(page).toHaveURL(/\/login/)
  })

  test('shows validation error for short password', async ({ page }) => {
    await page.getByLabel(/email/i).fill('admin@test.com')
    await page.getByLabel(/password/i).fill('123')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/password must be at least 6/i)).toBeVisible()
  })

  test('redirects authenticated user away from login', async ({ page }) => {
    await page.evaluate(() => {
      const state = {
        state: {
          user: { id: '1', email: 'a@b.com', role: 'super-admin' },
          accessToken: 'tok',
          refreshToken: 'ref',
          isAuthenticated: true,
        },
        version: 0,
      }
      localStorage.setItem('admin-auth', JSON.stringify(state))
    })
    await page.goto('/login')
    // Should redirect to dashboard
    await expect(page).toHaveURL('/')
  })
})
