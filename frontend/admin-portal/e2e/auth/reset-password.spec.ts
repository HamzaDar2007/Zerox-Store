import { test, expect } from '@playwright/test'
import { wrapSingle } from '../fixtures'

test.describe('Reset Password', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/localhost:3001/**', async (route) => {
      const url = route.request().url()
      if (url.includes('/auth/reset-password')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrapSingle({})) })
      if (url.includes('/auth/refresh')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrapSingle({ accessToken: 'tok', refreshToken: 'ref' })) })
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wrapSingle({})) })
    })
  })

  test('shows invalid token message when no token', async ({ page }) => {
    await page.goto('/reset-password')
    await expect(page.getByText(/invalid or missing reset token/i)).toBeVisible()
    await expect(page.getByText(/request a new reset link/i)).toBeVisible()
  })

  test('renders form with valid token', async ({ page }) => {
    await page.goto('/reset-password?token=valid-token')
    await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible()
    await expect(page.getByText(/enter your new password/i)).toBeVisible()
    const pwFields = page.getByPlaceholder('••••••••')
    await expect(pwFields.first()).toBeVisible()
    await expect(pwFields.nth(1)).toBeVisible()
    await expect(page.getByRole('button', { name: /reset password/i })).toBeVisible()
  })

  test('shows validation for mismatched passwords', async ({ page }) => {
    await page.goto('/reset-password?token=valid-token')
    await page.locator('input[name="newPassword"]').fill('Password123')
    await page.locator('input[name="confirmPassword"]').fill('Different456')
    await page.getByRole('button', { name: /reset password/i }).click()
    await expect(page.getByText(/passwords do not match/i)).toBeVisible()
  })

  test('shows validation for short password', async ({ page }) => {
    await page.goto('/reset-password?token=valid-token')
    await page.locator('input[name="newPassword"]').fill('short')
    await page.locator('input[name="confirmPassword"]').fill('short')
    await page.getByRole('button', { name: /reset password/i }).click()
    await expect(page.getByText(/password must be at least 8/i)).toBeVisible()
  })

  test('successful reset redirects to login', async ({ page }) => {
    await page.goto('/reset-password?token=valid-token')
    await page.locator('input[name="newPassword"]').fill('NewPassword123')
    await page.locator('input[name="confirmPassword"]').fill('NewPassword123')
    await page.getByRole('button', { name: /reset password/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('back to login link works', async ({ page }) => {
    await page.goto('/reset-password?token=valid-token')
    await page.getByText(/back to login/i).click()
    await expect(page).toHaveURL(/\/login/)
  })
})
