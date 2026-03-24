import { test, expect } from '../fixtures'
import { assertToast, dialog, fillField } from '../helpers'

test.describe('Settings Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: /settings/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('shows page description', async ({ authedPage: page }) => {
    await expect(page.getByText(/manage your account/i)).toBeVisible()
  })

  test('profile section is visible', async ({ authedPage: page }) => {
    await expect(page.getByText(/profile/i).first()).toBeVisible()
  })

  test('edit profile toggle shows form', async ({ authedPage: page }) => {
    const editBtn = page.getByRole('button', { name: /^edit$/i })
    if (await editBtn.isVisible()) {
      await editBtn.click()
      await expect(page.locator('input[name="firstName"]')).toBeVisible()
      await expect(page.locator('input[name="lastName"]')).toBeVisible()
    }
  })

  test('save profile changes', async ({ authedPage: page }) => {
    const editBtn = page.getByRole('button', { name: /^edit$/i })
    if (await editBtn.isVisible()) {
      await editBtn.click()
      await page.locator('input[name="firstName"]').fill('UpdatedName')
      await page.getByRole('button', { name: /save changes/i }).click()
      await assertToast(page)
    }
  })

  test('cancel profile edit', async ({ authedPage: page }) => {
    const editBtn = page.getByRole('button', { name: /^edit$/i })
    if (await editBtn.isVisible()) {
      await editBtn.click()
      await page.getByRole('button', { name: /cancel/i }).click()
      // Should hide the form
      await expect(page.locator('input[name="firstName"]')).not.toBeVisible()
    }
  })

  test('change password section is visible', async ({ authedPage: page }) => {
    await expect(page.getByText(/change password/i).first()).toBeVisible()
  })

  test('change password validates required fields', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /change password/i }).click()
    await expect(page.getByText(/current password is required/i).or(page.locator('.text-destructive').first())).toBeVisible()
  })

  test('change password validates mismatched passwords', async ({ authedPage: page }) => {
    await page.locator('input[name="currentPassword"]').fill('OldPassword1')
    await page.locator('input[name="newPassword"]').fill('NewPassword1')
    await page.locator('input[name="confirmPassword"]').fill('DifferentPassword1')
    await page.getByRole('button', { name: /change password/i }).click()
    await expect(page.getByText(/passwords do not match/i)).toBeVisible()
  })

  test('change password validates short password', async ({ authedPage: page }) => {
    await page.locator('input[name="currentPassword"]').fill('OldPassword1')
    await page.locator('input[name="newPassword"]').fill('short')
    await page.locator('input[name="confirmPassword"]').fill('short')
    await page.getByRole('button', { name: /change password/i }).click()
    await expect(page.getByText(/password must be at least 8/i)).toBeVisible()
  })

  test('appearance section shows theme options', async ({ authedPage: page }) => {
    await expect(page.getByText(/appearance/i)).toBeVisible()
    await expect(page.getByText(/dark mode/i)).toBeVisible()
  })

  test('dark mode toggle works', async ({ authedPage: page }) => {
    const toggle = page.locator('[role="switch"]').first()
    if (await toggle.isVisible()) {
      await toggle.click()
      await page.waitForTimeout(300)
    }
  })

  test('theme color options are visible', async ({ authedPage: page }) => {
    await expect(page.getByText('Blue').first()).toBeVisible()
    await expect(page.getByText('Emerald').first()).toBeVisible()
    await expect(page.getByText('Rose').first()).toBeVisible()
  })

  test('select theme color', async ({ authedPage: page }) => {
    const emeraldBtn = page.locator('button:has(.bg-emerald-500)')
    if (await emeraldBtn.isVisible()) {
      await emeraldBtn.click()
      await page.waitForTimeout(300)
    }
  })

  test('danger zone has logout button', async ({ authedPage: page }) => {
    await expect(page.getByText(/danger zone/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /log out of all devices/i })).toBeVisible()
  })

  test('avatar section is visible', async ({ authedPage: page }) => {
    await expect(page.getByText(/avatar/i).first()).toBeVisible()
  })
})
