import { test, expect } from '../fixtures'

test.describe('Error Pages', () => {
  test('404 renders for unknown route', async ({ authedPage: page }) => {
    await page.goto('/some-nonexistent-page')
    await expect(page.getByRole('heading', { name: /404/i })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/page not found/i)).toBeVisible()
  })

  test('404 Go to Dashboard navigates home', async ({ authedPage: page }) => {
    await page.goto('/some-nonexistent-page')
    await page.getByRole('button', { name: /go to dashboard/i }).or(page.getByRole('link', { name: /go to dashboard/i })).first().click()
    await expect(page).toHaveURL('/')
  })

  test('401 unauthorized page renders', async ({ authedPage: page }) => {
    await page.goto('/unauthorized')
    await expect(page.getByRole('heading', { name: /401/i })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/unauthorized/i)).toBeVisible()
  })

  test('401 Go to Login navigates to login', async ({ authedPage: page }) => {
    // Clear auth so login page doesn't redirect
    await page.evaluate(() => localStorage.removeItem('admin-auth'))
    await page.goto('/unauthorized')
    await page.getByRole('button', { name: /go to login/i }).or(page.getByRole('link', { name: /go to login/i })).first().click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('403 forbidden page renders', async ({ authedPage: page }) => {
    await page.goto('/forbidden')
    await expect(page.getByRole('heading', { name: /403/i })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/access forbidden/i)).toBeVisible()
  })

  test('403 Back to Dashboard navigates home', async ({ authedPage: page }) => {
    await page.goto('/forbidden')
    await page.getByRole('button', { name: /back to dashboard/i }).or(page.getByRole('link', { name: /back to dashboard/i })).first().click()
    await expect(page).toHaveURL('/')
  })
})
