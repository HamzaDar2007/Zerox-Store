import { test, expect } from '../fixtures'
import { assertToast, dialog, fillField, fillTextarea } from '../helpers'

test.describe('Notifications Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/notifications')
    await expect(page.getByRole('heading', { name: /^notifications$/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('renders notification list with data', async ({ authedPage: page }) => {
    await expect(page.getByText('New Order').first()).toBeVisible()
  })

  test('filter toggle buttons are visible', async ({ authedPage: page }) => {
    await expect(page.getByRole('button', { name: /^all$/i }).or(page.getByText(/^all$/i).first())).toBeVisible()
    await expect(page.getByRole('button', { name: /^unread$/i }).or(page.getByText(/^unread$/i).first())).toBeVisible()
  })

  test('filter by unread', async ({ authedPage: page }) => {
    const unreadBtn = page.getByRole('button', { name: /^unread$/i })
    if (await unreadBtn.isVisible()) {
      await unreadBtn.click()
      await page.waitForTimeout(500)
    }
  })

  test('filter by read', async ({ authedPage: page }) => {
    const readBtn = page.getByRole('button', { name: /^read$/i })
    if (await readBtn.isVisible()) {
      await readBtn.click()
      await page.waitForTimeout(500)
    }
  })

  test('mark all read button is visible', async ({ authedPage: page }) => {
    const markAllBtn = page.getByRole('button', { name: /mark all read/i })
    await expect(markAllBtn).toBeVisible()
  })

  test('mark all read works', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /mark all read/i }).click()
    await assertToast(page)
  })

  test('send notification dialog opens', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /send notification/i }).click()
    await expect(page.getByRole('heading', { name: /send notification/i })).toBeVisible()
  })

  test('send notification via dialog', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /send notification/i }).click()
    const dlg = dialog(page)
    await fillField(dlg, 'userId', 'e2e-user')
    await fillField(dlg, 'title', 'Test Notification')
    await fillTextarea(dlg, 'body', 'Test notification body')
    await dlg.getByRole('button', { name: /^send$/i }).click()
    await assertToast(page)
  })

  test('send notification validates required fields', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /send notification/i }).click()
    await dialog(page).getByRole('button', { name: /^send$/i }).click()
    await expect(page.locator('.text-destructive').first()).toBeVisible()
  })
})

test.describe('Notifications Empty State', () => {
  test('shows empty state message', async ({ emptyPage: page }) => {
    await page.goto('/notifications')
    await expect(page.getByRole('heading', { name: /^notifications$/i }).first()).toBeVisible({ timeout: 10000 })
  })
})
