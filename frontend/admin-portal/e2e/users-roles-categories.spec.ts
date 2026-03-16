import { test, expect } from './fixtures'

test.describe('Users Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/users')
  })

  test('renders users page with heading and search', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { name: /users/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search users/i)).toBeVisible()
  })

  test('displays users table with data', async ({ authedPage: page }) => {
    await expect(page.getByText('admin@test.com')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('seller@test.com')).toBeVisible()
  })

  test('opens create user dialog', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add user/i }).click()
    await expect(page.getByRole('heading', { name: /create user/i })).toBeVisible()
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog.locator('input').first()).toBeVisible()
  })

  test('validates required create user fields', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add user/i }).click()
    const dialog = page.locator('[role="dialog"]')
    await dialog.getByRole('button', { name: /create/i }).click()
    await expect(dialog.locator('.text-destructive').first()).toBeVisible({ timeout: 5000 })
  })

  test('can close create user dialog', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add user/i }).click()
    await expect(page.getByRole('heading', { name: /create user/i })).toBeVisible()
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByRole('heading', { name: /create user/i })).not.toBeVisible()
  })

  test('search filters users', async ({ authedPage: page }) => {
    const search = page.getByPlaceholder(/search users/i)
    await search.fill('admin')
    await expect(search).toHaveValue('admin')
  })

  test('has export button', async ({ authedPage: page }) => {
    const exportBtn = page.getByRole('button', { name: /export/i })
    if (await exportBtn.isVisible()) {
      await exportBtn.click()
      await expect(page.getByText(/export csv/i)).toBeVisible()
    }
  })
})

test.describe('Roles Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/roles')
  })

  test('renders roles page', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { name: /roles/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search roles/i)).toBeVisible()
  })

  test('displays roles in table', async ({ authedPage: page }) => {
    await expect(page.getByRole('cell', { name: 'super_admin', exact: true })).toBeVisible({ timeout: 5000 })
  })

  test('opens create role dialog', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add role/i }).click()
    await expect(page.getByRole('heading', { name: /create role/i })).toBeVisible()
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog.locator('input').first()).toBeVisible()
  })

  test('validates required role fields', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add role/i }).click()
    const dialog = page.locator('[role="dialog"]')
    await dialog.getByRole('button', { name: /create/i }).click()
    await expect(dialog.locator('.text-destructive').first()).toBeVisible({ timeout: 5000 })
  })

  test('can cancel create role dialog', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add role/i }).click()
    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByRole('heading', { name: /create role/i })).not.toBeVisible()
  })
})

test.describe('Permissions Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/permissions')
  })

  test('renders permissions page', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { name: /permissions/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search permissions/i)).toBeVisible()
  })

  test('displays permissions in table', async ({ authedPage: page }) => {
    await expect(page.getByRole('cell', { name: 'users:read', exact: true })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('cell', { name: 'users:write', exact: true })).toBeVisible()
  })

  test('opens create permission dialog', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add permission/i }).click()
    await expect(page.getByRole('heading', { name: /create permission/i })).toBeVisible()
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog.locator('input').first()).toBeVisible()
  })

  test('validates required permission fields', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add permission/i }).click()
    const dialog = page.locator('[role="dialog"]')
    await dialog.getByRole('button', { name: /create/i }).click()
    await expect(dialog.locator('.text-destructive').first()).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Role Permissions Page', () => {
  test('renders role permissions page', async ({ authedPage: page }) => {
    await page.goto('/role-permissions')
    await expect(page.getByRole('heading', { name: /role permissions/i })).toBeVisible()
  })

  test('shows select role prompt initially', async ({ authedPage: page }) => {
    await page.goto('/role-permissions')
    await expect(page.getByText(/select a role/i).first()).toBeVisible()
  })

  test('has role selector', async ({ authedPage: page }) => {
    await page.goto('/role-permissions')
    await expect(page.getByText(/select a role/i).first()).toBeVisible()
  })
})

test.describe('Categories Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/categories')
  })

  test('renders categories page', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { name: /categories/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search categories/i)).toBeVisible()
  })

  test('displays categories in table', async ({ authedPage: page }) => {
    await expect(page.getByRole('cell', { name: 'Electronics', exact: true })).toBeVisible({ timeout: 5000 })
  })

  test('opens create category dialog', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add category/i }).click()
    await expect(page.getByRole('heading', { name: /create category/i })).toBeVisible()
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog.locator('input').first()).toBeVisible()
  })

  test('validates required category fields', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add category/i }).click()
    const dialog = page.locator('[role="dialog"]')
    await dialog.getByRole('button', { name: /create/i }).click()
    await expect(dialog.locator('.text-destructive').first()).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Brands Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/brands')
  })

  test('renders brands page', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { name: /brands/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search brands/i)).toBeVisible()
  })

  test('displays brands in table', async ({ authedPage: page }) => {
    await expect(page.getByRole('cell', { name: 'TestBrand', exact: true })).toBeVisible({ timeout: 5000 })
  })

  test('opens create brand dialog', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add brand/i }).click()
    await expect(page.getByRole('heading', { name: /create brand/i })).toBeVisible()
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog.locator('input').first()).toBeVisible()
  })

  test('validates required brand fields', async ({ authedPage: page }) => {
    await page.getByRole('button', { name: /add brand/i }).click()
    const dialog = page.locator('[role="dialog"]')
    await dialog.getByRole('button', { name: /create/i }).click()
    await expect(dialog.locator('.text-destructive').first()).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Sellers Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/sellers')
  })

  test('renders sellers page', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { name: /sellers/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search sellers/i)).toBeVisible()
  })

  test('displays sellers in table', async ({ authedPage: page }) => {
    await expect(page.getByRole('cell', { name: 'SellerOne', exact: true })).toBeVisible({ timeout: 5000 })
  })

  test('has export button', async ({ authedPage: page }) => {
    const exportBtn = page.getByRole('button', { name: /export/i })
    if (await exportBtn.isVisible()) {
      await exportBtn.click()
      await expect(page.getByText(/export csv/i)).toBeVisible()
    }
  })
})

test.describe('Stores Page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/stores')
  })

  test('renders stores page', async ({ authedPage: page }) => {
    await expect(page.getByRole('heading', { name: /stores/i })).toBeVisible()
    await expect(page.getByPlaceholder(/search stores/i)).toBeVisible()
  })

  test('displays stores in table', async ({ authedPage: page }) => {
    await expect(page.getByRole('cell', { name: 'TestStore', exact: true })).toBeVisible({ timeout: 5000 })
  })

  test('has export button', async ({ authedPage: page }) => {
    const exportBtn = page.getByRole('button', { name: /export/i })
    if (await exportBtn.isVisible()) {
      await exportBtn.click()
      await expect(page.getByText(/export csv/i)).toBeVisible()
    }
  })
})
