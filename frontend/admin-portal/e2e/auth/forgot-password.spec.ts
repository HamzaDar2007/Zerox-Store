import { test, expect } from '@playwright/test'
import { wrapSingle } from '../fixtures'

test.describe('Forgot Password', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/localhost:3001/**', async (route) => {
      const url = route.request().url()
      if (url.includes('/auth/forgot-password')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrapSingle({})) })
      if (url.includes('/auth/refresh')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrapSingle({ accessToken: 'tok', refreshToken: 'ref' })) })
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrapSingle({})) })
    })
    await page.goto('/forgot-password')
  })

  test('renders forgot password form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /forgot password/i })).toBeVisible()
    await expect(page.getByText(/enter your email/i)).toBeVisible()
    await expect(page.getByPlaceholder('admin@example.com')).toBeVisible()
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible()
    await expect(page.getByText(/back to login/i)).toBeVisible()
  })

  test('shows validation error for empty email', async ({ page }) => {
    await page.getByRole('button', { name: /send reset link/i }).click()
    await expect(page.getByText(/invalid email/i)).toBeVisible()
  })

  test('successful submission shows success message', async ({ page }) => {
    await page.getByPlaceholder('admin@example.com').fill('admin@test.com')
    await page.getByRole('button', { name: /send reset link/i }).click()
    await expect(page.getByText(/we sent a password reset link/i)).toBeVisible()
    await expect(page.getByText(/send again/i)).toBeVisible()
  })

  test('send again button is available after success', async ({ page }) => {
    await page.getByPlaceholder('admin@example.com').fill('admin@test.com')
    await page.getByRole('button', { name: /send reset link/i }).click()
    await expect(page.getByText(/send again/i)).toBeVisible()
  })

  test('back to login link navigates to login', async ({ page }) => {
    await page.getByText(/back to login/i).click()
    await expect(page).toHaveURL(/\/login/)
  })
})
