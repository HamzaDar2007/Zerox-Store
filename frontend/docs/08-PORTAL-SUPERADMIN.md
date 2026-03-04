# 08 — Super Admin Portal

> **Contract Type:** Pages, Components, Layouts for the Super Admin Panel
> **Dependencies:** `00-ARCHITECTURE.md`, `02-API-CONTRACTS.md`, `03-STORE-AND-STATE.md`, `04-AUTH-AND-GUARDS.md`, `07-PORTAL-ADMIN.md`
> **Routes:** `/super-admin/*` (requires `super_admin` role exclusively)
> **Generates:** `src/features/super-admin/`, `src/layouts/SuperAdminLayout.tsx`

---

## Design Principle

The Super Admin portal extends the Admin portal with **platform-level** management capabilities. Super admins have access to everything admins have (via the admin portal), plus:

- Role & Permission management (RBAC)
- System configuration & feature flags
- Audit logs
- Operations (import/export, bulk operations)
- Platform health monitoring
- i18n / Localization management

---

## Super Admin Layout

### `src/layouts/SuperAdminLayout.tsx`

Reuses the same shell pattern as Admin. Distinct branding (e.g., darker sidebar, "Platform Admin" label) to differentiate.

```typescript
import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';

import { SuperAdminSidebar } from '@features/super-admin/components/SuperAdminSidebar';
import { SuperAdminTopbar } from '@features/super-admin/components/SuperAdminTopbar';
import { PageSkeleton } from '@components/skeletons/PageSkeleton';
import { useAppSelector } from '@store';
import { cn } from '@lib/utils';

export function SuperAdminLayout() {
  const sidebarCollapsed = useAppSelector((s) => s.ui.sidebarCollapsed);

  return (
    <div className="flex h-screen overflow-hidden">
      <SuperAdminSidebar />
      <div className={cn('flex flex-1 flex-col overflow-hidden', sidebarCollapsed ? 'ml-16' : 'ml-64')}>
        <SuperAdminTopbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
```

---

## Sidebar Navigation

### `src/features/super-admin/components/SuperAdminSidebar.tsx`

```typescript
const superAdminNavItems = [
  { label: 'Dashboard', icon: 'LayoutDashboard', path: '/super-admin' },
  {
    label: 'Access Control', icon: 'Shield', path: '/super-admin/access',
    children: [
      { label: 'Roles', path: '/super-admin/roles' },
      { label: 'Permissions', path: '/super-admin/permissions' },
      { label: 'Role Assignments', path: '/super-admin/role-assignments' },
    ],
  },
  {
    label: 'System', icon: 'Settings', path: '/super-admin/system',
    children: [
      { label: 'Settings', path: '/super-admin/settings' },
      { label: 'Feature Flags', path: '/super-admin/features' },
      { label: 'Health', path: '/super-admin/health' },
    ],
  },
  { label: 'Audit Logs', icon: 'FileSearch', path: '/super-admin/audit-logs' },
  {
    label: 'Operations', icon: 'Cog', path: '/super-admin/operations',
    children: [
      { label: 'Import/Export', path: '/super-admin/operations/import-export' },
      { label: 'Bulk Operations', path: '/super-admin/operations/bulk' },
      { label: 'Job Queue', path: '/super-admin/operations/jobs' },
    ],
  },
  {
    label: 'Localization', icon: 'Globe', path: '/super-admin/i18n',
    children: [
      { label: 'Languages', path: '/super-admin/i18n/languages' },
      { label: 'Translations', path: '/super-admin/i18n/translations' },
      { label: 'Currencies', path: '/super-admin/i18n/currencies' },
    ],
  },
  {
    label: 'Loyalty', icon: 'Gift', path: '/super-admin/loyalty',
    children: [
      { label: 'Configuration', path: '/super-admin/loyalty/config' },
      { label: 'Points Ledger', path: '/super-admin/loyalty/points' },
      { label: 'Referrals', path: '/super-admin/loyalty/referrals' },
    ],
  },
  { label: 'Subscriptions', icon: 'RefreshCw', path: '/super-admin/subscriptions' },
  {
    label: 'Quick Links', icon: 'ExternalLink', path: '#',
    children: [
      { label: '→ Admin Panel', path: '/admin' },
      { label: '→ API Docs', path: '/api/docs', external: true },
    ],
  },
];
```

---

## Route Configuration

```typescript
{
  path: '/super-admin',
  element: <SuperAdminLayout />,
  children: [
    { index: true, element: <SuperAdminDashboard /> },
    // Access Control
    { path: 'roles', element: <RolesPage /> },
    { path: 'roles/:id', element: <RoleDetailPage /> },
    { path: 'permissions', element: <PermissionsPage /> },
    { path: 'role-assignments', element: <RoleAssignmentsPage /> },
    // System
    { path: 'settings', element: <SystemSettingsPage /> },
    { path: 'features', element: <FeatureFlagsPage /> },
    { path: 'health', element: <SystemHealthPage /> },
    // Audit
    { path: 'audit-logs', element: <AuditLogsPage /> },
    // Operations
    { path: 'operations/import-export', element: <ImportExportPage /> },
    { path: 'operations/bulk', element: <BulkOperationsPage /> },
    { path: 'operations/jobs', element: <JobQueuePage /> },
    // i18n
    { path: 'i18n/languages', element: <LanguagesPage /> },
    { path: 'i18n/translations', element: <TranslationsPage /> },
    { path: 'i18n/currencies', element: <CurrenciesPage /> },
    // Loyalty
    { path: 'loyalty/config', element: <LoyaltyConfigPage /> },
    { path: 'loyalty/points', element: <LoyaltyPointsPage /> },
    { path: 'loyalty/referrals', element: <ReferralsPage /> },
    // Subscriptions
    { path: 'subscriptions', element: <SubscriptionsPage /> },
  ],
}
```

---

## Page Contracts

### 1. Dashboard — `src/features/super-admin/pages/DashboardPage.tsx`

**Route:** `/super-admin` (index)

**Layout:**

```
┌────────┬────────┬────────┬────────┐
│ Roles  │ Perms  │ Users  │ System │
│   5    │   47   │ 1,234  │ ● OK   │
├────────┴────────┴────────┴────────┤
│ Platform Health Summary            │
│ ┌───────────────────────────────┐ │
│ │ API Up │ DB Connected │ Redis │ │
│ │   ●●       ●●           ●●   │ │
│ └───────────────────────────────┘ │
├───────────────────────────────────┤
│ Recent Audit Logs (5 rows)        │
│ User │ Action │ Resource │ Time   │
│ [View All Audit Logs →]           │
├───────────────────────────────────┤
│ Active Feature Flags (list)       │
│ ✅ multi_language                  │
│ ✅ loyalty_program                 │
│ ❌ beta_search                     │
│ [Manage Flags →]                  │
├───────────────────────────────────┤
│ Pending Operations                │
│ 2 import jobs running             │
│ 1 bulk operation queued           │
│ [View Jobs →]                     │
└───────────────────────────────────┘
```

---

### 2. Role Management — `src/features/super-admin/pages/RolesPage.tsx`

**Route:** `/super-admin/roles`

**Data Requirements:**
| Hook | Endpoint |
|------|----------|
| `useGetRolesQuery()` | `GET /roles` |
| `useCreateRoleMutation()` | `POST /roles` |
| `useUpdateRoleMutation()` | `PATCH /roles/:id` |
| `useDeleteRoleMutation()` | `DELETE /roles/:id` |

**Layout:**
- Table: role name, description, user count, permissions count, system (built-in), actions
- Built-in roles (super_admin, admin, seller, customer, support_agent) are read-only — cannot delete
- Create Role: Dialog with name, description
- Edit Role: same dialog pre-filled

### Role Detail — `src/features/super-admin/pages/RoleDetailPage.tsx`

**Route:** `/super-admin/roles/:id`

- Role info (name, description, created/updated dates)
- **Permission Matrix** — the core feature:

```
┌──────────────────────────────────────────────────────────────────┐
│ Role: Admin                                                       │
├──────────────────┬────────┬──────┬────────┬────────┬─────────────┤
│ Module           │ Create │ Read │ Update │ Delete │ Manage       │
├──────────────────┼────────┼──────┼────────┼────────┼─────────────┤
│ Users            │  ☑     │  ☑   │  ☑     │  ☐    │  ☐          │
│ Products         │  ☑     │  ☑   │  ☑     │  ☑    │  ☑          │
│ Orders           │  ☐     │  ☑   │  ☑     │  ☐    │  ☐          │
│ Categories       │  ☑     │  ☑   │  ☑     │  ☑    │  ☑          │
│ Sellers          │  ☐     │  ☑   │  ☑     │  ☐    │  ☑          │
│ Settings         │  ☐     │  ☑   │  ☐     │  ☐    │  ☐          │
│ ...              │        │      │        │        │             │
├──────────────────┴────────┴──────┴────────┴────────┴─────────────┤
│ [Select All] [Clear All]                    [Save Permissions]    │
└──────────────────────────────────────────────────────────────────┘
```

- Each checkbox toggle: `useAssignPermissionToRoleMutation()` or `useRemovePermissionFromRoleMutation()`
- Permissions format: `module.action` (e.g., `users.create`, `products.update`)
- Group by module, auto-detect available actions from permissions list
- "Select All Row" and "Select All Column" capabilities

---

### 3. Permissions — `src/features/super-admin/pages/PermissionsPage.tsx`

**Route:** `/super-admin/permissions`

**Data Requirements:**
| Hook | Endpoint |
|------|----------|
| `useGetPermissionsQuery()` | `GET /permissions` |
| `useCreatePermissionMutation()` | `POST /permissions` |
| `useDeletePermissionMutation()` | `DELETE /permissions/:id` |

**Layout:**
- Grouped view: permissions organized by module
- Each group shows: `users.create`, `users.read`, `users.update`, `users.delete`, `users.manage`
- Create permission: module (select from existing or new), action (select from enum: create/read/update/delete/manage/export)
- Bulk create: add all CRUD permissions for a new module at once

---

### 4. System Settings — `src/features/super-admin/pages/SystemSettingsPage.tsx`

**Route:** `/super-admin/settings`

**Data Requirements:**
| Hook | Endpoint |
|------|----------|
| `useGetSystemSettingsQuery()` | `GET /system/settings` |
| `useUpdateSystemSettingMutation()` | `PATCH /system/settings/:key` |

**Layout:**
- Grouped settings form:
  - **General:** Site name, site description, logo URL, favicon URL, contact email
  - **Commerce:** Currency (select), tax enabled, default tax rate, min order amount, max cart items
  - **Auth:** Password min length, MFA enabled, session timeout, max login attempts
  - **Email:** SMTP settings (host, port, user, from address)
  - **Storage:** CDN URL, max upload size
- Each setting is a key-value pair from the API
- "Save Changes" per section (patch modified settings only)
- Show setting metadata: last modified by, last modified date

---

### 5. Feature Flags — `src/features/super-admin/pages/FeatureFlagsPage.tsx`

**Route:** `/super-admin/features`

**Data Requirements:**
| Hook | Endpoint |
|------|----------|
| `useGetFeatureFlagsQuery()` | `GET /system/features` |
| `useUpdateFeatureFlagMutation()` | `PATCH /system/features/:id` |
| `useCreateFeatureFlagMutation()` | `POST /system/features` |

**Layout:**
- Card grid or table:
  - Flag name, description, enabled (toggle switch), environment (all/staging/production), rollout % 
- Toggle switch for instant enable/disable (optimistic update)
- Create flag: name, key (auto-slug), description, default state
- Confirm dialog for disabling production flags

---

### 6. Audit Logs — `src/features/super-admin/pages/AuditLogsPage.tsx`

**Route:** `/super-admin/audit-logs`

**Data Requirements:**
| Hook | Endpoint |
|------|----------|
| `useGetAuditLogsQuery({ page, limit, userId, action, resource, startDate, endDate })` | `GET /audit` |

**Layout:**
- Filter bar: user (searchable select), action type (select), resource type (select), date range
- Table:
  - Columns: timestamp, user (avatar + name), action (badge: create/read/update/delete), resource type, resource ID, IP address, details
  - Expandable row: shows full `changes` object (before/after diff)
- No create/edit/delete — audit logs are immutable
- Export filtered logs to CSV

---

### 7. Operations — Import/Export

**Route:** `/super-admin/operations/import-export`

**Data Requirements:**
| Hook | Endpoint |
|------|----------|
| `useGetImportJobsQuery({ page })` | `GET /operations/jobs` |
| `useCreateImportJobMutation()` | `POST /operations/import` |

**Layout:**
- **Import:** Select entity type (products/categories/users), upload CSV/JSON (⚠️ URL only — provide URL to file), map columns, start import
- **Export:** Select entity type, filters, format (CSV/JSON), trigger export → download link
- **Job History:** table of past import/export jobs with status (pending/processing/completed/failed), progress bar, error count, download result

### Bulk Operations — `/super-admin/operations/bulk`

- Form: select operation type (e.g., "update product status", "assign role"), select targets (filter), configure action, execute
- Job tracking similar to import/export

### Job Queue — `/super-admin/operations/jobs`

- Table: all background jobs, status, progress, created/completed dates
- Actions: cancel pending, retry failed, view details/errors

---

### 8. Localization (i18n)

**Languages — `/super-admin/i18n/languages`:**
- Table: language code, name, native name, direction (LTR/RTL), active, default
- CRUD: add/edit/remove languages. Uses `Language` type, `CreateLanguageDto`.
- Toggle active status, set default (`POST /i18n/languages/:id/set-default`)
- Get active only (`GET /i18n/languages/active`), by code (`GET /i18n/languages/code/:code`)

**Translations — `/super-admin/i18n/translations`:**
- Two-panel layout:
  - Left: translation key tree (grouped by namespace: common, auth, products, orders, etc.)
  - Right: translation values for selected key across all active languages
- Search/filter by key or value
- Inline edit: click value → edit → save (uses `POST /i18n/translations/upsert`)
- Missing translations highlighted in red
- Delete translation: `DELETE /i18n/translations/:id`
- Export/import translation files (JSON)

**Currencies — `/super-admin/i18n/currencies`:**
- Table: code, name, symbol, symbolPosition, exchangeRate, decimalPlaces, isDefault, isActive
- CRUD: add/edit/remove currencies. Uses `Currency` type, `CreateCurrencyDto`.
- Set default (`POST /i18n/currencies/:id/set-default`)
- View rate history (`GET /i18n/currencies/:id/rate-history`) — line chart showing exchange rate over time
- Currency converter tool: `GET /i18n/currencies/convert?amount=&from=&to=`
- Get active only (`GET /i18n/currencies/active`), by code (`GET /i18n/currencies/code/:code`)

---

### 9. Loyalty Program

**Configuration — `/super-admin/loyalty/config`:**
- Settings: points per dollar, points value, minimum redeem, expiry days, tier thresholds
- Form with numeric inputs and save button

**Points Ledger — `/super-admin/loyalty/points`:**
- Table: user, points balance, earned, redeemed, expired, tier
- Search by user, filter by tier

**Referrals — `/super-admin/loyalty/referrals`:**
- Table: referrer, referred user, status (pending/completed/rewarded), reward amount, date
- Configuration: referral reward amount, conditions

---

### 10. Subscriptions — `/super-admin/subscriptions`

> ⚠️ Backend uses **product-based subscriptions**, NOT plan-based. There is no `/subscriptions/plans` endpoint.

**All Subscriptions:**
- Table: user, product, variant, frequency, status (active/paused/cancelled/expired), unitPrice, nextDeliveryDate, totalOrders, totalSpent
- Filters: `?status&page&limit`. Admin list via `GET /subscriptions` (requires `subscriptions.read` permission)
- Actions per row: pause (`POST /subscriptions/:id/pause`), resume (`POST /subscriptions/:id/resume`), cancel (`POST /subscriptions/:id/cancel`), renew (`POST /subscriptions/:id/renew`)

**Due Subscriptions:**
- Filtered view via `GET /subscriptions/due` — shows subscriptions due for renewal
- Action: process renewal

**Subscription Detail (expandable row or dialog):**
- Subscription info + orders history (`GET /subscriptions/:id/orders`) showing `SubscriptionOrder[]`

---

### 11. System Health — `src/features/super-admin/pages/SystemHealthPage.tsx`

**Route:** `/super-admin/health`

- API health check: ping `/` endpoint, show response time
- Database status indicator
- Memory usage (if available from API)
- Uptime
- Recent errors (from audit logs with action = 'error')
- Auto-refresh every 30 seconds

---

## Validation Criteria

- [ ] Super Admin dashboard shows platform-wide stats
- [ ] Role CRUD works for custom roles
- [ ] Permission matrix toggles save correctly
- [ ] Built-in roles cannot be deleted
- [ ] System settings save per-section
- [ ] Feature flag toggles are instant (optimistic update)
- [ ] Audit logs display with proper filters and expandable details
- [ ] Import/export job tracking shows real-time progress
- [ ] Translation editor supports inline editing and upsert
- [ ] Currency management CRUD with rate history chart
- [ ] Loyalty configuration saves correctly
- [ ] System health page auto-refreshes
- [ ] Navigation clearly distinguishes Super Admin from Admin portal
