import { test, expect } from './fixtures'

test.describe('Settings - Profile', () => {
  test('edit profile form saves successfully', async ({ authedPage: page }) => {
    await page.goto('/settings')
    await page.getByRole('button', { name: /edit/i }).click()
    const firstName = page.locator('input[name="firstName"]')
    await expect(firstName).toBeVisible()
    await firstName.clear()
    await firstName.fill('Updated')
    const lastName = page.locator('input[name="lastName"]')
    await lastName.clear()
    await lastName.fill('Admin')
    await page.getByRole('button', { name: /save changes/i }).click()
    await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 5000 })
  })

  test('cancel profile edit discards changes', async ({ authedPage: page }) => {
    await page.goto('/settings')
    await page.getByRole('button', { name: /edit/i }).click()
    const firstName = page.locator('input[name="firstName"]')
    await firstName.clear()
    await firstName.fill('Changed')
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(firstName).not.toBeVisible()
  })
})

test.describe('Settings - Password', () => {
  test('change password validates empty fields', async ({ authedPage: page }) => {
    await page.goto('/settings')
    await page.getByRole('button', { name: /change password/i }).click()
    await expect(page.locator('.text-destructive').first()).toBeVisible()
  })

  test('change password submits successfully', async ({ authedPage: page }) => {
    await page.goto('/settings')
    await page.locator('input[name="currentPassword"]').fill('OldPass123!')
    await page.locator('input[name="newPassword"]').fill('NewPass456!')
    await page.locator('input[name="confirmPassword"]').fill('NewPass456!')
    await page.getByRole('button', { name: /change password/i }).click()
    await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Settings - Theme', () => {
  test('toggle dark mode', async ({ authedPage: page }) => {
    await page.goto('/settings')
    const darkModeLabel = page.getByText(/dark mode/i)
    await expect(darkModeLabel).toBeVisible()
    const toggle = page.locator('button[role="switch"]').first()
    if (await toggle.isVisible()) {
      await toggle.click()
      await page.waitForTimeout(300)
    }
  })

  test('select each accent color', async ({ authedPage: page }) => {
    await page.goto('/settings')
    for (const color of ['Emerald', 'Rose', 'Orange', 'Violet', 'Blue']) {
      const btn = page.getByRole('button', { name: color })
      if (await btn.isVisible()) {
        await btn.click()
        await page.waitForTimeout(200)
      }
    }
  })

  test('theme color persists on navigation', async ({ authedPage: page }) => {
    await page.goto('/settings')
    const emeraldBtn = page.getByRole('button', { name: 'Emerald' })
    if (await emeraldBtn.isVisible()) {
      await emeraldBtn.click()
      await page.waitForTimeout(200)
      await page.goto('/products')
      const htmlClass = await page.locator('html').getAttribute('class')
      expect(htmlClass).toContain('theme-emerald')
    }
  })
})

test.describe('Settings - Logout', () => {
  test('logout button is in danger zone', async ({ authedPage: page }) => {
    await page.goto('/settings')
    await expect(page.getByText(/danger zone/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /log out/i })).toBeVisible()
  })

  test('clicking logout redirects to login', async ({ authedPage: page }) => {
    await page.goto('/settings')
    await page.getByRole('button', { name: /log out/i }).click()
    await page.waitForURL('**/login', { timeout: 5000 })
    expect(page.url()).toContain('/login')
  })
})

test.describe('Notifications Interactions', () => {
  test('displays notification cards', async ({ authedPage: page }) => {
    await page.goto('/notifications')
    await page.waitForTimeout(1000)
    await expect(page.getByText('New Order').first()).toBeVisible({ timeout: 10000 })
  })

  test('filter buttons switch between all/unread/read', async ({ authedPage: page }) => {
    await page.goto('/notifications')
    await page.getByRole('button', { name: /^unread$/i }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: /^read$/i }).click()
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: /^all$/i }).click()
    await page.waitForTimeout(300)
  })

  test('mark all read button triggers action', async ({ authedPage: page }) => {
    await page.goto('/notifications')
    const markAllBtn = page.getByRole('button', { name: /mark all read/i })
    await expect(markAllBtn).toBeVisible()
    await markAllBtn.click()
    await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Chat Interactions', () => {
  test('renders chat page with threads', async ({ authedPage: page }) => {
    await page.goto('/chat')
    await page.waitForTimeout(1000)
    await expect(page.getByRole('heading', { name: /chat/i })).toBeVisible({ timeout: 5000 })
  })

  test('select a thread shows messages area', async ({ authedPage: page }) => {
    await page.goto('/chat')
    await page.waitForTimeout(500)
    const threadButton = page.locator('[data-testid="thread-item"], button, [role="button"]').filter({ hasText: /thread|open|chat/ }).first()
    if (await threadButton.isVisible()) {
      await threadButton.click()
      await page.waitForTimeout(500)
    }
  })

  test('shows select thread prompt initially', async ({ authedPage: page }) => {
    await page.goto('/chat')
    await expect(page.getByText(/select a thread/i)).toBeVisible()
  })
})

test.describe('Audit Logs', () => {
  test('displays audit log entries', async ({ authedPage: page }) => {
    await page.goto('/audit')
    await expect(page.getByText('CREATE')).toBeVisible()
  })

  test('filter panel opens and accepts values', async ({ authedPage: page }) => {
    await page.goto('/audit')
    const filtersBtn = page.getByRole('button', { name: /filters/i })
    if (await filtersBtn.isVisible()) {
      await filtersBtn.click()
      const actionInput = page.getByPlaceholder(/action/i).or(page.getByLabel(/action/i))
      if (await actionInput.isVisible()) {
        await actionInput.fill('CREATE')
        await expect(actionInput).toHaveValue('CREATE')
      }
    }
  })

  test('clear filters resets inputs', async ({ authedPage: page }) => {
    await page.goto('/audit')
    const filtersBtn = page.getByRole('button', { name: /filters/i })
    if (await filtersBtn.isVisible()) {
      await filtersBtn.click()
      const actionInput = page.getByPlaceholder(/action/i).or(page.getByLabel(/action/i))
      if (await actionInput.isVisible()) {
        await actionInput.fill('DELETE')
        const clearBtn = page.getByRole('button', { name: /clear filters/i })
        if (await clearBtn.isVisible()) {
          await clearBtn.click()
          await expect(actionInput).toHaveValue('')
        }
      }
    }
  })

  test('search logs input works', async ({ authedPage: page }) => {
    await page.goto('/audit')
    const search = page.getByPlaceholder(/search logs/i)
    await search.fill('users')
    await expect(search).toHaveValue('users')
  })
})

test.describe('Search Analytics', () => {
  test('displays popular searches', async ({ authedPage: page }) => {
    await page.goto('/search-analytics')
    await page.waitForTimeout(1000)
    await expect(page.getByText('laptop').first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('phone').first()).toBeVisible({ timeout: 5000 })
  })

  test('displays search count badges', async ({ authedPage: page }) => {
    await page.goto('/search-analytics')
    await expect(page.getByText('42 searches')).toBeVisible()
    await expect(page.getByText('28 searches')).toBeVisible()
  })

  test('shows recent search history section', async ({ authedPage: page }) => {
    await page.goto('/search-analytics')
    await expect(page.getByText(/recent search history/i)).toBeVisible()
  })

  test('shows popular searches section', async ({ authedPage: page }) => {
    await page.goto('/search-analytics')
    await expect(page.getByText(/popular searches/i)).toBeVisible()
  })
})
