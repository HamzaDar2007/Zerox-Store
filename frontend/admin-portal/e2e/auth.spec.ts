import { test, expect } from '@playwright/test'

test.describe('Forgot Password Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/localhost:3001/**', async (route) => {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) })
    })
    await page.goto('/forgot-password')
  })

  test('renders forgot password form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /forgot password/i })).toBeVisible()
    await expect(page.getByText(/enter your email/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible()
  })

  test('shows validation error for empty email', async ({ page }) => {
    await page.getByRole('button', { name: /send reset link/i }).click()
    await expect(page.getByText(/invalid email/i)).toBeVisible()
  })

  test('shows success state after submitting email', async ({ page }) => {
    await page.getByLabel(/email/i).fill('admin@test.com')
    await page.getByRole('button', { name: /send reset link/i }).click()
    await expect(page.getByText(/we sent a password reset link/i)).toBeVisible({ timeout: 5000 })
  })

  test('has back to login link', async ({ page }) => {
    await expect(page.getByText(/back to login/i)).toBeVisible()
    await page.getByText(/back to login/i).click()
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Reset Password Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/localhost:3001/**', async (route) => {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) })
    })
  })

  test('shows invalid token message without token', async ({ page }) => {
    await page.goto('/reset-password')
    await expect(page.getByText(/invalid or missing reset token/i)).toBeVisible()
  })

  test('renders reset form with valid token', async ({ page }) => {
    await page.goto('/reset-password?token=valid-token-123')
    await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible()
    await expect(page.getByLabel(/new password/i)).toBeVisible()
    await expect(page.getByLabel(/confirm password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /reset password/i })).toBeVisible()
  })

  test('shows validation errors for empty fields', async ({ page }) => {
    await page.goto('/reset-password?token=valid-token-123')
    await page.getByRole('button', { name: /reset password/i }).click()
    await expect(page.getByText(/password must be at least 8/i)).toBeVisible()
  })

  test('shows mismatch error when passwords differ', async ({ page }) => {
    await page.goto('/reset-password?token=valid-token-123')
    await page.getByLabel(/new password/i).fill('password123')
    await page.getByLabel(/confirm password/i).fill('differentpass')
    await page.getByRole('button', { name: /reset password/i }).click()
    await expect(page.getByText(/passwords do not match/i)).toBeVisible()
  })

  test('has back to login link', async ({ page }) => {
    await page.goto('/reset-password?token=valid-token-123')
    await expect(page.getByText(/back to login/i)).toBeVisible()
  })
})
