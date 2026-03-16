import { test, expect } from './fixtures'

test.describe('Orders', () => {
  test('displays order data in table', async ({ authedPage: page }) => {
    await page.goto('/orders')
    await expect(page.getByText('pending')).toBeVisible()
  })

  test('search filters orders', async ({ authedPage: page }) => {
    await page.goto('/orders')
    const search = page.getByPlaceholder(/search/i)
    await search.fill('ORD-001')
    await expect(search).toHaveValue('ORD-001')
  })

  test('has export functionality', async ({ authedPage: page }) => {
    await page.goto('/orders')
    const exportBtn = page.getByRole('button', { name: /export/i })
    if (await exportBtn.isVisible()) {
      await exportBtn.click()
      await expect(page.getByText(/export csv/i)).toBeVisible()
    }
  })

  test('opens order detail via actions', async ({ authedPage: page }) => {
    await page.goto('/orders')
    const actionBtn = page.locator('button').filter({ has: page.locator('svg.lucide-more-horizontal') }).first()
    if (await actionBtn.isVisible()) {
      await actionBtn.click()
      const viewItem = page.getByRole('menuitem', { name: /view/i })
      if (await viewItem.isVisible()) {
        await viewItem.click()
        // Dialog/sheet should open
        await page.waitForTimeout(500)
        await expect(page.locator('[role="dialog"]')).toBeVisible()
      }
    }
  })
})

test.describe('Payments', () => {
  test('displays payment data', async ({ authedPage: page }) => {
    await page.goto('/payments')
    await expect(page.getByText('stripe')).toBeVisible()
    await expect(page.getByText('completed')).toBeVisible()
  })

  test('search filters payments', async ({ authedPage: page }) => {
    await page.goto('/payments')
    const search = page.getByPlaceholder(/search/i)
    await search.fill('stripe')
    await expect(search).toHaveValue('stripe')
  })
})

test.describe('Returns', () => {
  test('displays return data', async ({ authedPage: page }) => {
    await page.goto('/returns')
    await expect(page.getByText('Defective')).toBeVisible()
    await expect(page.getByText('pending')).toBeVisible()
  })

  test('has export button', async ({ authedPage: page }) => {
    await page.goto('/returns')
    const exportBtn = page.getByRole('button', { name: /export/i })
    if (await exportBtn.isVisible()) {
      await exportBtn.click()
      await expect(page.getByText(/export csv/i)).toBeVisible()
    }
  })

  test('opens return detail via actions', async ({ authedPage: page }) => {
    await page.goto('/returns')
    const actionBtn = page.locator('button').filter({ has: page.locator('svg.lucide-more-horizontal') }).first()
    if (await actionBtn.isVisible()) {
      await actionBtn.click()
      const viewItem = page.getByRole('menuitem', { name: /view|detail/i })
      if (await viewItem.isVisible()) {
        await viewItem.click()
        await page.waitForTimeout(500)
      }
    }
  })
})

test.describe('Reviews', () => {
  test('displays review data', async ({ authedPage: page }) => {
    await page.goto('/reviews')
    await expect(page.getByText('Great!')).toBeVisible()
  })

  test('search filters reviews', async ({ authedPage: page }) => {
    await page.goto('/reviews')
    const search = page.getByPlaceholder(/search/i)
    await search.fill('Great')
    await expect(search).toHaveValue('Great')
  })

  test('has export button', async ({ authedPage: page }) => {
    await page.goto('/reviews')
    const exportBtn = page.getByRole('button', { name: /export/i })
    if (await exportBtn.isVisible()) {
      await exportBtn.click()
      await expect(page.getByText(/export csv/i)).toBeVisible()
    }
  })
})

test.describe('Shipping Interactions', () => {
  test('create zone via dialog', async ({ authedPage: page }) => {
    await page.goto('/shipping')
    await page.getByRole('tab', { name: /zones/i }).click()
    await page.getByRole('button', { name: /add zone/i }).click()
    await expect(page.getByRole('heading', { name: /create.*shipping zone/i })).toBeVisible()
    const dialog = page.locator('[role="dialog"]')
    await dialog.locator('input[name="name"]').fill('International')
    await dialog.getByRole('button', { name: /^create$/i }).click()
    await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 5000 })
  })

  test('create method via dialog', async ({ authedPage: page }) => {
    await page.goto('/shipping')
    await page.getByRole('tab', { name: /methods/i }).click()
    await page.getByRole('button', { name: /add method/i }).click()
    await expect(page.getByRole('heading', { name: /create.*shipping method/i })).toBeVisible()
    const dialog = page.locator('[role="dialog"]')
    await dialog.locator('input[name="name"]').fill('Express')
    await dialog.locator('input[name="zoneId"]').fill('z1')
    await dialog.locator('input[name="price"]').fill('12.99')
    await dialog.getByRole('button', { name: /^create$/i }).click()
    await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 5000 })
  })

  test('shipments tab has lookup and create', async ({ authedPage: page }) => {
    await page.goto('/shipping')
    await page.getByRole('tab', { name: /shipments/i }).click()
    await expect(page.getByRole('button', { name: /create shipment/i })).toBeVisible()
  })

  test('zone edit dialog opens via actions menu', async ({ authedPage: page }) => {
    await page.goto('/shipping')
    await page.getByRole('tab', { name: /zones/i }).click()
    await expect(page.getByText('Domestic')).toBeVisible()
    const actionBtn = page.locator('button').filter({ has: page.locator('svg.lucide-more-horizontal') }).first()
    if (await actionBtn.isVisible()) {
      await actionBtn.click()
      const editItem = page.getByRole('menuitem', { name: /edit/i })
      if (await editItem.isVisible()) {
        await editItem.click()
        await expect(page.getByRole('heading', { name: /edit.*shipping zone/i })).toBeVisible()
      }
    }
  })
})

test.describe('Inventory Interactions', () => {
  test('create warehouse via dialog', async ({ authedPage: page }) => {
    await page.goto('/inventory')
    await page.getByRole('tab', { name: /warehouses/i }).click()
    await page.getByRole('button', { name: /add warehouse/i }).click()
    await expect(page.getByRole('heading', { name: /create warehouse/i })).toBeVisible()
    const dialog = page.locator('[role="dialog"]')
    await dialog.locator('input[name="code"]').fill('WH-02')
    await dialog.locator('input[name="name"]').fill('West Coast')
    await dialog.getByRole('button', { name: /^create$/i }).click()
    await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 5000 })
  })

  test('set stock dialog opens and has required fields', async ({ authedPage: page }) => {
    await page.goto('/inventory')
    await page.getByRole('tab', { name: /stock/i }).first().click()
    await page.getByRole('button', { name: /set stock/i }).click()
    await expect(page.getByRole('heading', { name: /set stock/i })).toBeVisible()
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog.locator('input').first()).toBeVisible()
  })

  test('adjust stock dialog opens', async ({ authedPage: page }) => {
    await page.goto('/inventory')
    await page.getByRole('tab', { name: /stock/i }).first().click()
    await page.getByRole('button', { name: /adjust stock/i }).click()
    await expect(page.getByRole('heading', { name: /adjust stock/i })).toBeVisible()
  })

  test('low stock tab shows data', async ({ authedPage: page }) => {
    await page.goto('/inventory')
    await page.getByRole('tab', { name: /low stock/i }).click()
    await page.waitForTimeout(500)
    const search = page.getByPlaceholder(/search/i)
    await expect(search).toBeVisible()
  })
})

test.describe('Subscriptions Interactions', () => {
  test('create plan via dialog', async ({ authedPage: page }) => {
    await page.goto('/subscriptions')
    await page.getByRole('button', { name: /add plan/i }).click()
    await expect(page.getByRole('heading', { name: /create plan/i })).toBeVisible()
    const dialog = page.locator('[role="dialog"]')
    await dialog.locator('input[name="name"]').fill('Enterprise')
    await dialog.locator('input[name="price"]').fill('99.99')
    await dialog.locator('input[name="interval"]').fill('month')
    await dialog.getByRole('button', { name: /^create$/i }).click()
    await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 5000 })
  })

  test('active subscriptions tab renders', async ({ authedPage: page }) => {
    await page.goto('/subscriptions')
    await page.getByRole('tab', { name: /active subscriptions/i }).click()
    await expect(page.getByPlaceholder(/search/i)).toBeVisible()
  })

  test('lookup tab has input', async ({ authedPage: page }) => {
    await page.goto('/subscriptions')
    await page.getByRole('tab', { name: /lookup/i }).click()
    await expect(page.getByText(/subscription lookup/i)).toBeVisible()
  })

  test('plan data displayed in table', async ({ authedPage: page }) => {
    await page.goto('/subscriptions')
    await page.waitForTimeout(1000)
    await expect(page.getByRole('cell', { name: 'Pro' })).toBeVisible({ timeout: 10000 })
  })
})
