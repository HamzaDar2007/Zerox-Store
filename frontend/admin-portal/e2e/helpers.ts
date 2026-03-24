import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

/** Open a row's action menu and click an item by name. */
export async function openRowAction(page: Page, rowText: string, actionName: string) {
  const row = page.locator('tr', { hasText: rowText }).first()
  await row.locator('button:has(svg.lucide-ellipsis)').click()
  await page.getByRole('menuitem', { name: new RegExp(actionName, 'i') }).click()
}

/** Assert a sonner toast is visible, optionally matching text. */
export async function assertToast(page: Page, text?: string | RegExp) {
  const toast = page.locator('[data-sonner-toast]').first()
  await expect(toast).toBeVisible({ timeout: 5000 })
  if (text) await expect(toast).toContainText(text)
}

/** Assert a table cell with the given text is visible. */
export async function assertTableHas(page: Page, text: string) {
  await expect(page.getByRole('cell', { name: text }).first()).toBeVisible({ timeout: 10000 })
}

/** Get the dialog locator. */
export function dialog(page: Page) {
  return page.locator('[role="dialog"]')
}

/** Fill a field inside a dialog by input name attribute. */
export async function fillField(container: ReturnType<typeof dialog>, name: string, value: string) {
  await container.locator(`input[name="${name}"]`).fill(value)
}

/** Fill a textarea inside a dialog by name attribute. */
export async function fillTextarea(container: ReturnType<typeof dialog>, name: string, value: string) {
  await container.locator(`textarea[name="${name}"]`).fill(value)
}

/** Open a create dialog via CTA button, fill fields, submit, and verify toast. */
export async function createViaDialog(
  page: Page,
  buttonName: string | RegExp,
  fields: Record<string, string>,
  opts?: { textareas?: Record<string, string>; heading?: string | RegExp },
) {
  await page.getByRole('button', { name: buttonName }).click()
  if (opts?.heading) {
    await expect(page.getByRole('heading', { name: opts.heading })).toBeVisible()
  }
  const dlg = dialog(page)
  for (const [name, value] of Object.entries(fields)) {
    await fillField(dlg, name, value)
  }
  if (opts?.textareas) {
    for (const [name, value] of Object.entries(opts.textareas)) {
      await fillTextarea(dlg, name, value)
    }
  }
  await dlg.getByRole('button', { name: /^create$/i }).click()
  await assertToast(page)
}

/** Click an export button and verify the dropdown options appear. */
export async function verifyExportDropdown(page: Page) {
  const exportBtn = page.getByRole('button', { name: /export/i })
  if (await exportBtn.isVisible()) {
    await exportBtn.click()
    await expect(page.getByText(/export csv/i)).toBeVisible()
    await expect(page.getByText(/export excel/i)).toBeVisible()
    await expect(page.getByText(/export pdf/i)).toBeVisible()
    // Close dropdown by pressing Escape
    await page.keyboard.press('Escape')
  }
}
