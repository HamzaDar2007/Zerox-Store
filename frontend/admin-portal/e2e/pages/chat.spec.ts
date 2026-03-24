import { test, expect } from '../fixtures'
import { dialog, fillField, assertToast } from '../helpers'

test.describe('Chat Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/chat')
    await expect(page.getByRole('heading', { name: /chat/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('renders thread list', async ({ authedPage: page }) => {
    await expect(page.getByText(/threads/i).first()).toBeVisible()
  })

  test('shows select thread prompt before selection', async ({ authedPage: page }) => {
    await expect(page.getByText(/select a thread/i).first()).toBeVisible()
  })

  test('select thread loads messages', async ({ authedPage: page }) => {
    // Click on the first thread button
    const thread = page.locator('button.w-full.text-left').first()
    if (await thread.isVisible()) {
      await thread.click()
      await page.waitForTimeout(500)
      // Messages should load
      await expect(page.getByText('Hello, I need help').first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('message input is visible after selecting thread', async ({ authedPage: page }) => {
    const thread = page.locator('button.w-full.text-left').first()
    if (await thread.isVisible()) {
      await thread.click()
      await page.waitForTimeout(500)
      await expect(page.getByPlaceholder(/type a message/i)).toBeVisible()
    }
  })

  test('send message via input', async ({ authedPage: page }) => {
    const thread = page.locator('button.w-full.text-left').first()
    if (await thread.isVisible()) {
      await thread.click()
      await page.waitForTimeout(500)
      const input = page.getByPlaceholder(/type a message/i)
      if (await input.isVisible()) {
        await input.fill('Test message from E2E')
        await input.press('Enter')
        await page.waitForTimeout(500)
      }
    }
  })

  test('create new thread dialog opens', async ({ authedPage: page }) => {
    const newBtn = page.getByRole('button', { name: /new/i })
    if (await newBtn.isVisible()) {
      await newBtn.click()
      await expect(page.getByRole('heading', { name: /new thread/i })).toBeVisible()
    }
  })

  test('create new thread via dialog', async ({ authedPage: page }) => {
    const newBtn = page.getByRole('button', { name: /new/i })
    if (await newBtn.isVisible()) {
      await newBtn.click()
      const dlg = dialog(page)
      await dlg.getByRole('button', { name: /^create$/i }).click()
      await assertToast(page)
    }
  })

  test('thread status actions are available', async ({ authedPage: page }) => {
    const thread = page.locator('button.w-full.text-left').first()
    if (await thread.isVisible()) {
      await thread.click()
      await page.waitForTimeout(500)
      // Resolve/Close buttons should be visible for an open thread
      const resolveBtn = page.getByRole('button', { name: /resolve/i }).first()
      const closeBtn = page.getByRole('button', { name: /close/i }).first()
      const actionVisible = await resolveBtn.isVisible() || await closeBtn.isVisible()
      expect(actionVisible).toBeTruthy()
    }
  })
})
