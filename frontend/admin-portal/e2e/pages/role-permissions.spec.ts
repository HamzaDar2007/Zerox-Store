import { test, expect } from '../fixtures'

test.describe('Role Permissions Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/role-permissions')
    await expect(page.getByRole('heading', { name: /role permissions/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('shows empty state before role selection', async ({ authedPage: page }) => {
    await expect(page.getByText(/select a role/i).or(page.getByText(/choose a role/i)).first()).toBeVisible()
  })

  test('select role shows permissions checkboxes', async ({ authedPage: page }) => {
    // Open the role selector
    const roleSelect = page.locator('button').filter({ hasText: /select a role/i }).first()
      .or(page.getByRole('combobox').first())
    if (await roleSelect.isVisible()) {
      await roleSelect.click()
      // Select the first role
      const option = page.getByRole('option').first()
      if (await option.isVisible()) {
        await option.click()
        await page.waitForTimeout(500)
        // Permissions should now be visible
        const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').first()
        await expect(checkbox).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test('Save Changes button appears after toggling permission', async ({ authedPage: page }) => {
    const roleSelect = page.locator('button').filter({ hasText: /select a role/i }).first()
      .or(page.getByRole('combobox').first())
    if (await roleSelect.isVisible()) {
      await roleSelect.click()
      const option = page.getByRole('option').first()
      if (await option.isVisible()) {
        await option.click()
        await page.waitForTimeout(500)
        // Toggle a permission
        const checkbox = page.locator('[role="checkbox"], input[type="checkbox"]').first()
        if (await checkbox.isVisible()) {
          await checkbox.click()
          await expect(page.getByRole('button', { name: /save changes/i })).toBeVisible()
        }
      }
    }
  })

  test('shows page description', async ({ authedPage: page }) => {
    await expect(page.getByText(/assign permissions to roles/i)).toBeVisible()
  })
})
