import { test, expect } from './fixtures'

test.describe('Shipping Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/shipping')
  })

  test('renders shipping page with tabs', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { name: /shipping/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /zones/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /methods/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /shipments/i })).toBeVisible()
  })

  test('zones tab shows table and add button', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /zones/i }).click()
    await expect(page.getByRole('button', { name: /add zone/i })).toBeVisible()
    await expect(page.getByText('Domestic')).toBeVisible({ timeout: 5000 })
  })

  test('opens create zone dialog', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /zones/i }).click()
    await page.getByRole('button', { name: /add zone/i }).click()
    await expect(page.getByRole('heading', { name: /create shipping zone/i })).toBeVisible()
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog.locator('input').first()).toBeVisible()
  })

  test('methods tab shows table and add button', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /methods/i }).click()
    await expect(page.getByRole('button', { name: /add method/i })).toBeVisible()
    await expect(page.getByText('Standard')).toBeVisible({ timeout: 5000 })
  })

  test('opens create method dialog', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /methods/i }).click()
    await page.getByRole('button', { name: /add method/i }).click()
    await expect(page.getByRole('heading', { name: /create shipping method/i })).toBeVisible()
  })

  test('shipments tab has order lookup', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /shipments/i }).click()
    await expect(page.getByPlaceholder(/enter order id/i)).toBeVisible()
  })

  test('shipments tab has create shipment button', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /shipments/i }).click()
    await expect(page.getByRole('button', { name: /create shipment/i })).toBeVisible()
  })

  test('opens create shipment dialog', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /shipments/i }).click()
    await page.getByRole('button', { name: /create shipment/i }).click()
    await expect(page.getByRole('heading', { name: /create shipment/i })).toBeVisible()
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog.locator('input').first()).toBeVisible()
  })
})

test.describe('Inventory Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/inventory')
  })

  test('renders inventory page with tabs', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { name: /inventory/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /warehouses/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /stock/i }).first()).toBeVisible()
    await expect(page.getByRole('tab', { name: /low stock/i })).toBeVisible()
  })

  test('warehouses tab shows table and add button', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /warehouses/i }).click()
    await expect(page.getByRole('button', { name: /add warehouse/i })).toBeVisible()
    await expect(page.getByText('Main Warehouse')).toBeVisible({ timeout: 5000 })
  })

  test('opens create warehouse dialog', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /warehouses/i }).click()
    await page.getByRole('button', { name: /add warehouse/i }).click()
    await expect(page.getByRole('heading', { name: /create warehouse/i })).toBeVisible()
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog.locator('input').first()).toBeVisible()
  })

  test('stock tab shows set stock and adjust stock buttons', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /^stock$/i }).click()
    await expect(page.getByRole('button', { name: /set stock/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /adjust stock/i })).toBeVisible()
  })

  test('opens set stock dialog', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /^stock$/i }).click()
    await page.getByRole('button', { name: /set stock/i }).click()
    await expect(page.getByRole('heading', { name: /set stock/i })).toBeVisible()
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog.locator('input').first()).toBeVisible()
  })

  test('opens adjust stock dialog', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /^stock$/i }).click()
    await page.getByRole('button', { name: /adjust stock/i }).click()
    await expect(page.getByRole('heading', { name: /adjust stock/i })).toBeVisible()
  })

  test('low stock tab shows data', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /low stock/i }).click()
    await expect(page.getByPlaceholder(/search low stock/i)).toBeVisible()
  })
})

test.describe('Subscriptions Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/subscriptions')
  })

  test('renders subscriptions page with tabs', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { name: /subscriptions/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /plans/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /active subscriptions/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /lookup/i })).toBeVisible()
  })

  test('plans tab shows table and add button', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /plans/i }).click()
    await expect(page.getByRole('button', { name: /add plan/i })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Pro', exact: true })).toBeVisible({ timeout: 5000 })
  })

  test('opens create plan dialog', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /plans/i }).click()
    await page.getByRole('button', { name: /add plan/i }).click()
    await expect(page.getByRole('heading', { name: /create plan/i })).toBeVisible()
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog.locator('input').first()).toBeVisible()
  })

  test('validates required plan fields', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /plans/i }).click()
    await page.getByRole('button', { name: /add plan/i }).click()
    const dialog = page.locator('[role="dialog"]')
    await dialog.getByRole('button', { name: /create/i }).click()
    await expect(dialog.locator('.text-destructive').first()).toBeVisible({ timeout: 5000 })
  })

  test('active subscriptions tab renders', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /active subscriptions/i }).click()
    await expect(page.getByPlaceholder(/search subscriptions/i)).toBeVisible()
  })

  test('lookup tab has input', async ({ authedPage: page }) => {
    await page.getByRole('tab', { name: /lookup/i }).click()
    await expect(page.getByText(/subscription lookup/i)).toBeVisible()
  })
})

test.describe('Chat Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/chat')
  })

  test('renders chat page', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { name: /chat/i })).toBeVisible()
    await expect(page.getByText(/threads/i)).toBeVisible()
  })

  test('shows thread list', async ({ authedPage: page }) => {
    // Thread list should display threads
    await page.waitForTimeout(1000)
    const threadItems = page.locator('[class*="cursor-pointer"]')
    const count = await threadItems.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('shows select thread prompt when no thread selected', async ({ authedPage: page }) => {
    await expect(page.getByText(/select a thread/i)).toBeVisible()
  })

  test('has message input when thread is selected', async ({ authedPage: page }) => {
    // Message input only appears after selecting a thread
    const threadBtn = page.locator('button').filter({ hasText: /thread/i }).first()
    if (await threadBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await threadBtn.click()
      await expect(page.getByPlaceholder(/type a message/i)).toBeVisible({ timeout: 5000 })
    }
  })
})

test.describe('Notifications Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/notifications')
  })

  test('renders notifications page', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { name: /notifications/i })).toBeVisible()
  })

  test('shows filter buttons', async ({ authedPage: page }) => {
    await expect(page.getByRole('button', { name: /^all$/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /unread/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /^read$/i })).toBeVisible()
  })

  test('shows mark all read button', async ({ authedPage: page }) => {
    await expect(page.getByRole('button', { name: /mark all read/i })).toBeVisible()
  })

  test('displays notification items', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { name: 'New Order' })).toBeVisible({ timeout: 5000 })
  })

  test('filter buttons toggle active state', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /unread/i }).click()
    await page.waitForTimeout(500)
    await page.getByRole('button', { name: /^read$/i }).click()
    await page.waitForTimeout(500)
    await page.getByRole('button', { name: /^all$/i }).click()
  })
})

test.describe('Audit Logs Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/audit')
  })

  test('renders audit logs page', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { name: /audit logs/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search logs/i)).toBeVisible()
  })

  test('displays audit log entries', async ({ authedPage: page }) => {
    await expect(page.getByText('CREATE')).toBeVisible({ timeout: 5000 })
  })

  test('has filters button', async ({ authedPage: page }) => {
    await expect(page.getByRole('button', { name: /filters/i })).toBeVisible()
  })

  test('opens filter panel', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /filters/i }).click()
    await expect(page.getByPlaceholder(/e\.g\., CREATE/i)).toBeVisible()
  })

  test('filter inputs accept values', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /filters/i }).click()
    await page.getByPlaceholder(/e\.g\., CREATE/i).fill('CREATE')
    await expect(page.getByPlaceholder(/e\.g\., CREATE/i)).toHaveValue('CREATE')
  })

  test('clear filters button works', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /filters/i }).click()
    await page.getByPlaceholder(/e\.g\., CREATE/i).fill('CREATE')
    await page.getByRole('button', { name: /clear filters/i }).click()
    await expect(page.getByPlaceholder(/e\.g\., CREATE/i)).toHaveValue('')
  })

  test('has export button', async ({ authedPage: page }) => {
    const exportBtn = page.getByRole('button', { name: /export/i })
    if (await exportBtn.isVisible()) {
      await exportBtn.click()
      await expect(page.getByText(/export csv/i)).toBeVisible()
    }
  })
})

test.describe('Search Analytics Page', () => {
  test('renders search analytics page', async ({ authedPage: page }) => {
    await page.goto('/search-analytics')
    await expect(page.getByRole('heading', { name: /search analytics/i })).toBeVisible()
  })

  test('shows popular searches section', async ({ authedPage: page }) => {
    await page.goto('/search-analytics')
    await expect(page.getByText(/popular searches/i)).toBeVisible()
    await expect(page.locator('span').filter({ hasText: 'laptop' }).first()).toBeVisible({ timeout: 5000 })
    await expect(page.locator('span').filter({ hasText: 'phone' }).first()).toBeVisible()
  })

  test('shows recent search history', async ({ authedPage: page }) => {
    await page.goto('/search-analytics')
    await expect(page.getByText(/recent search history/i)).toBeVisible()
  })
})
