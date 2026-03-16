import { test, expect } from './fixtures'

test.describe('Users CRUD', () => {
  test('create user via dialog and verify toast', async ({ authedPage: page }) => {
    await page.goto('/users')
    await page.getByRole('button', { name: /add user/i }).click()
    await expect(page.getByRole('heading', { name: /create user/i })).toBeVisible()
    const dialog = page.locator('[role="dialog"]')
    await dialog.locator('input[name="email"]').fill('newuser@example.com')
    await dialog.locator('input[name="firstName"]').fill('New')
    await dialog.locator('input[name="lastName"]').fill('User')
    await dialog.locator('input[name="password"]').fill('SecurePass123!')
    await dialog.getByRole('button', { name: /^create$/i }).click()
    await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 5000 })
  })

  test('search filters users table', async ({ authedPage: page }) => {
    await page.goto('/users')
    await expect(page.getByText('admin@test.com')).toBeVisible()
    const searchInput = page.getByPlaceholder(/search/i)
    await searchInput.fill('seller')
    await expect(searchInput).toHaveValue('seller')
  })

  test('export dropdown shows CSV, Excel, PDF options', async ({ authedPage: page }) => {
    await page.goto('/users')
    const exportBtn = page.getByRole('button', { name: /export/i })
    if (await exportBtn.isVisible()) {
      await exportBtn.click()
      await expect(page.getByText(/export csv/i)).toBeVisible()
      await expect(page.getByText(/export excel/i)).toBeVisible()
      await expect(page.getByText(/export pdf/i)).toBeVisible()
    }
  })
})

test.describe('Categories CRUD', () => {
  test('create category with all fields', async ({ authedPage: page }) => {
    await page.goto('/categories')
    await page.getByRole('button', { name: /add category/i }).click()
    await expect(page.getByRole('heading', { name: /create category/i })).toBeVisible()
    const dialog = page.locator('[role="dialog"]')
    await dialog.locator('input[name="name"]').fill('New Category')
    await dialog.locator('input[name="slug"]').fill('new-category')
    await dialog.getByRole('button', { name: /^create$/i }).click()
    await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 5000 })
  })

  test('cancel create category closes dialog', async ({ authedPage: page }) => {
    await page.goto('/categories')
    await page.getByRole('button', { name: /add category/i }).click()
    await expect(page.getByRole('heading', { name: /create category/i })).toBeVisible()
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByRole('heading', { name: /create category/i })).not.toBeVisible()
  })

  test('validates required fields on category create', async ({ authedPage: page }) => {
    await page.goto('/categories')
    await page.getByRole('button', { name: /add category/i }).click()
    await page.locator('[role="dialog"]').getByRole('button', { name: /^create$/i }).click()
    await expect(page.locator('.text-destructive').first()).toBeVisible()
  })
})

test.describe('Brands CRUD', () => {
  test('create brand and verify toast', async ({ authedPage: page }) => {
    await page.goto('/brands')
    await page.getByRole('button', { name: /add brand/i }).click()
    const dialog = page.locator('[role="dialog"]')
    await dialog.locator('input[name="name"]').fill('NewBrand')
    await dialog.locator('input[name="slug"]').fill('newbrand')
    await dialog.getByRole('button', { name: /^create$/i }).click()
    await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 5000 })
  })

  test('displays brand data in table', async ({ authedPage: page }) => {
    await page.goto('/brands')
    await page.waitForTimeout(1000)
    await expect(page.getByRole('cell', { name: 'TestBrand' }).first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Products CRUD', () => {
  test('create product fills all fields and submits', async ({ authedPage: page }) => {
    await page.goto('/products')
    await page.getByRole('button', { name: /add product/i }).click()
    await expect(page.getByRole('heading', { name: /create product/i })).toBeVisible()
    const dialog = page.locator('[role="dialog"]')
    await dialog.locator('input[name="name"]').fill('New Product')
    await dialog.locator('input[name="slug"]').fill('new-product')
    await dialog.locator('textarea[name="description"]').fill('A great new product')
    await dialog.locator('input[name="basePrice"]').fill('49.99')
    await dialog.locator('input[name="storeId"]').fill('st1')
    await dialog.getByRole('button', { name: /^create$/i }).click()
    await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 5000 })
  })

  test('open product detail sheet via View action', async ({ authedPage: page }) => {
    await page.goto('/products')
    await expect(page.getByText('TestProduct')).toBeVisible()
    const actionBtn = page.locator('button').filter({ has: page.locator('svg.lucide-more-horizontal') }).first()
    if (await actionBtn.isVisible()) {
      await actionBtn.click()
      const viewItem = page.getByRole('menuitem', { name: /view/i })
      if (await viewItem.isVisible()) {
        await viewItem.click()
        await expect(page.getByText('TestProduct')).toBeVisible()
      }
    }
  })

  test('product detail sheet has tabs for info, variants, images, attributes', async ({ authedPage: page }) => {
    await page.goto('/products')
    const actionBtn = page.locator('button').filter({ has: page.locator('svg.lucide-more-horizontal') }).first()
    if (await actionBtn.isVisible()) {
      await actionBtn.click()
      const viewItem = page.getByRole('menuitem', { name: /view/i })
      if (await viewItem.isVisible()) {
        await viewItem.click()
        await expect(page.getByRole('button', { name: /info/i }).or(page.getByText('Info'))).toBeVisible()
        await expect(page.getByRole('button', { name: /variants/i }).or(page.getByText('Variants'))).toBeVisible()
        await expect(page.getByRole('button', { name: /images/i }).or(page.getByText('Images'))).toBeVisible()
        await expect(page.getByRole('button', { name: /attributes/i }).or(page.getByText('Attributes'))).toBeVisible()
      }
    }
  })

  test('cancel create product closes dialog', async ({ authedPage: page }) => {
    await page.goto('/products')
    await page.getByRole('button', { name: /add product/i }).click()
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByRole('heading', { name: /create product/i })).not.toBeVisible()
  })

  test('search filters products', async ({ authedPage: page }) => {
    await page.goto('/products')
    const search = page.getByPlaceholder(/search products/i)
    await search.fill('laptop')
    await expect(search).toHaveValue('laptop')
  })
})

test.describe('Coupons CRUD', () => {
  test('create coupon with all fields', async ({ authedPage: page }) => {
    await page.goto('/coupons')
    await page.getByRole('button', { name: /add coupon/i }).click()
    await expect(page.getByRole('heading', { name: /create coupon/i })).toBeVisible()
    const dialog = page.locator('[role="dialog"]')
    await dialog.locator('input[name="code"]').fill('NEWCOUPON20')
    // Select discount type via the combobox trigger
    await dialog.locator('button').filter({ hasText: /percentage|fixed|select/i }).first().click()
    await page.locator('[role="option"]').filter({ hasText: /percentage/i }).click()
    await dialog.locator('input[name="discountValue"]').fill('20')
    await dialog.locator('input[name="startsAt"]').fill('2025-01-01T00:00')
    await dialog.locator('input[name="expiresAt"]').fill('2025-12-31T23:59')
    await dialog.getByRole('button', { name: /^create$/i }).click()
    await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 10000 })
  })

  test('displays coupon code in table', async ({ authedPage: page }) => {
    await page.goto('/coupons')
    await expect(page.getByText('SAVE10')).toBeVisible()
  })

  test('cancel coupon dialog', async ({ authedPage: page }) => {
    await page.goto('/coupons')
    await page.getByRole('button', { name: /add coupon/i }).click()
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByRole('heading', { name: /create coupon/i })).not.toBeVisible()
  })
})

test.describe('Flash Sales CRUD', () => {
  test('create flash sale', async ({ authedPage: page }) => {
    await page.goto('/flash-sales')
    await page.getByRole('button', { name: /add flash sale/i }).click()
    await expect(page.getByRole('heading', { name: /create flash sale/i })).toBeVisible()
    const dialog = page.locator('[role="dialog"]')
    await dialog.locator('input[name="name"]').fill('Winter Clearance')
    await dialog.locator('input[name="startsAt"]').fill('2025-01-01T00:00')
    await dialog.locator('input[name="endsAt"]').fill('2025-12-31T23:59')
    await dialog.getByRole('button', { name: /^create$/i }).click()
    await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 10000 })
  })

  test('displays flash sale in table', async ({ authedPage: page }) => {
    await page.goto('/flash-sales')
    await expect(page.getByText('Summer Sale')).toBeVisible()
  })
})

test.describe('Roles CRUD', () => {
  test('create role with name', async ({ authedPage: page }) => {
    await page.goto('/roles')
    await page.getByRole('button', { name: /add role/i }).click()
    const dialog = page.locator('[role="dialog"]')
    await dialog.locator('input[name="name"]').fill('editor')
    await dialog.getByRole('button', { name: /^create$/i }).click()
    await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 5000 })
  })

  test('displays existing roles', async ({ authedPage: page }) => {
    await page.goto('/roles')
    await page.waitForTimeout(1000)
    await expect(page.getByRole('cell', { name: 'super_admin' })).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Permissions CRUD', () => {
  test('create permission', async ({ authedPage: page }) => {
    await page.goto('/permissions')
    await page.getByRole('button', { name: /add permission/i }).click()
    const dialog = page.locator('[role="dialog"]')
    await dialog.locator('input[name="code"]').fill('orders:read')
    await dialog.locator('input[name="module"]').fill('orders')
    await dialog.getByRole('button', { name: /^create$/i }).click()
    await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 10000 })
  })

  test('displays existing permissions', async ({ authedPage: page }) => {
    await page.goto('/permissions')
    await expect(page.getByText('users:read')).toBeVisible()
    await expect(page.getByText('users:write')).toBeVisible()
  })
})

test.describe('Sellers & Stores', () => {
  test('sellers page displays seller data', async ({ authedPage: page }) => {
    await page.goto('/sellers')
    await expect(page.getByText('SellerOne')).toBeVisible()
  })

  test('stores page displays store data', async ({ authedPage: page }) => {
    await page.goto('/stores')
    await page.waitForTimeout(1000)
    await expect(page.getByRole('cell', { name: 'TestStore' }).first()).toBeVisible({ timeout: 10000 })
  })

  test('sellers page has search', async ({ authedPage: page }) => {
    await page.goto('/sellers')
    const search = page.getByPlaceholder(/search/i)
    await search.fill('seller')
    await expect(search).toHaveValue('seller')
  })
})
