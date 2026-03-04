# 07 — Admin Portal

> **Contract Type:** Pages, Components, Layouts for Admin Dashboard
> **Dependencies:** `00-ARCHITECTURE.md`, `02-API-CONTRACTS.md`, `03-STORE-AND-STATE.md`, `04-AUTH-AND-GUARDS.md`
> **Routes:** `/admin/*` (requires `admin` or `super_admin` role)
> **Generates:** `src/features/admin/`, `src/layouts/AdminLayout.tsx`

---

## Admin Layout

### `src/layouts/AdminLayout.tsx`

Same shell pattern as `SellerLayout` — collapsible sidebar + topbar + content area.

```typescript
import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';

import { AdminSidebar } from '@features/admin/components/AdminSidebar';
import { AdminTopbar } from '@features/admin/components/AdminTopbar';
import { PageSkeleton } from '@components/skeletons/PageSkeleton';
import { useAppSelector } from '@store';
import { cn } from '@lib/utils';

export function AdminLayout() {
  const sidebarCollapsed = useAppSelector((s) => s.ui.sidebarCollapsed);

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className={cn('flex flex-1 flex-col overflow-hidden', sidebarCollapsed ? 'ml-16' : 'ml-64')}>
        <AdminTopbar />
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

### `src/features/admin/components/AdminSidebar.tsx`

```typescript
const adminNavItems = [
  { label: 'Dashboard', icon: 'LayoutDashboard', path: '/admin' },
  { 
    label: 'Users', icon: 'Users', path: '/admin/users',
    children: [
      { label: 'All Users', path: '/admin/users' },
      { label: 'Customers', path: '/admin/users?role=customer' },
      { label: 'Sellers', path: '/admin/users?role=seller' },
    ],
  },
  {
    label: 'Catalog', icon: 'Package', path: '/admin/catalog',
    children: [
      { label: 'Products', path: '/admin/products' },
      { label: 'Categories', path: '/admin/categories' },
      { label: 'Brands', path: '/admin/brands' },
      { label: 'Attributes', path: '/admin/attributes' },
    ],
  },
  { label: 'Orders', icon: 'ShoppingBag', path: '/admin/orders' },
  {
    label: 'Sellers', icon: 'Store', path: '/admin/sellers',
    children: [
      { label: 'All Sellers', path: '/admin/sellers' },
      { label: 'Pending Verification', path: '/admin/sellers?status=pending' },
      { label: 'Violations', path: '/admin/sellers/violations' },
    ],
  },
  {
    label: 'Marketing', icon: 'Megaphone', path: '/admin/marketing',
    children: [
      { label: 'Vouchers', path: '/admin/marketing/vouchers' },
      { label: 'Campaigns', path: '/admin/marketing/campaigns' },
      { label: 'Flash Sales', path: '/admin/marketing/flash-sales' },
    ],
  },
  {
    label: 'Content', icon: 'FileText', path: '/admin/content',
    children: [
      { label: 'Pages', path: '/admin/content/pages' },
      { label: 'Banners', path: '/admin/content/banners' },
      { label: 'SEO', path: '/admin/content/seo' },
    ],
  },
  { label: 'Reviews', icon: 'Star', path: '/admin/reviews' },
  { label: 'Support', icon: 'Headphones', path: '/admin/support',
    children: [
      { label: 'Tickets', path: '/admin/support/tickets' },
      { label: 'Disputes', path: '/admin/support/disputes' },
      { label: 'Returns', path: '/admin/support/returns' },
    ],
  },
  {
    label: 'Shipping', icon: 'Truck', path: '/admin/shipping',
    children: [
      { label: 'Zones', path: '/admin/shipping?tab=zones' },
      { label: 'Methods', path: '/admin/shipping?tab=methods' },
      { label: 'Carriers', path: '/admin/shipping?tab=carriers' },
      { label: 'Rates', path: '/admin/shipping?tab=rates' },
      { label: 'Delivery Slots', path: '/admin/shipping?tab=slots' },
    ],
  },
  {
    label: 'Tax', icon: 'Receipt', path: '/admin/tax',
    children: [
      { label: 'Tax Zones', path: '/admin/tax?tab=zones' },
      { label: 'Tax Rates', path: '/admin/tax?tab=rates' },
      { label: 'Tax Classes', path: '/admin/tax?tab=classes' },
    ],
  },
  { label: 'Bundles', icon: 'Package2', path: '/admin/bundles' },
  { label: 'Payments', icon: 'CreditCard', path: '/admin/payments' },
  { label: 'Notifications', icon: 'Bell', path: '/admin/notifications' },
  { label: 'Reports', icon: 'BarChart3', path: '/admin/reports' },
];

/**
 * Collapsible sidebar with nested sub-items.
 * Sub-items expand with accordion animation (Collapsible from shadcn).
 * Active state: highlight current nav item + expand parent if sub-item active.
 * Tooltip on icon when collapsed.
 */
```

---

## Route Configuration

```typescript
// Inside router.tsx — nested under AdminLayout
{
  path: '/admin',
  element: <AdminLayout />,
  children: [
    { index: true, element: <AdminDashboard /> },
    // Users
    { path: 'users', element: <AdminUsers /> },
    { path: 'users/:id', element: <AdminUserDetail /> },
    // Catalog
    { path: 'products', element: <AdminProducts /> },
    { path: 'products/:id', element: <AdminProductDetail /> },
    { path: 'categories', element: <AdminCategories /> },
    { path: 'brands', element: <AdminBrands /> },
    { path: 'attributes', element: <AdminAttributes /> },
    // Orders
    { path: 'orders', element: <AdminOrders /> },
    { path: 'orders/:id', element: <AdminOrderDetail /> },
    // Sellers
    { path: 'sellers', element: <AdminSellers /> },
    { path: 'sellers/:id', element: <AdminSellerDetail /> },
    { path: 'sellers/violations', element: <AdminViolations /> },
    // Marketing
    { path: 'marketing/vouchers', element: <AdminVouchers /> },
    { path: 'marketing/campaigns', element: <AdminCampaigns /> },
    { path: 'marketing/flash-sales', element: <AdminFlashSales /> },
    // Content
    { path: 'content/pages', element: <AdminCmsPages /> },
    { path: 'content/banners', element: <AdminBanners /> },
    { path: 'content/seo', element: <AdminSeo /> },
    // Support
    { path: 'reviews', element: <AdminReviews /> },
    { path: 'support/tickets', element: <AdminTickets /> },
    { path: 'support/disputes', element: <AdminDisputes /> },
    { path: 'support/returns', element: <AdminReturns /> },
    // Operations
    { path: 'shipping', element: <AdminShipping /> },
    { path: 'tax', element: <AdminTax /> },
    { path: 'bundles', element: <AdminBundles /> },
    { path: 'bundles/:id', element: <AdminBundleDetail /> },
    { path: 'payments', element: <AdminPayments /> },
    { path: 'notifications', element: <AdminNotifications /> },
    { path: 'reports', element: <AdminReports /> },
  ],
}
```

---

## Page Contracts

### 1. Dashboard — `src/features/admin/pages/DashboardPage.tsx`

**Route:** `/admin` (index)

**Data Requirements:**
| Hook | Purpose |
|------|---------|
| `useGetUsersQuery({ limit: 1 })` | Total user count from `total` |
| `useGetOrdersQuery({ limit: 1 })` | Total order count + recent |
| `useGetProductsQuery({ limit: 1 })` | Total product count |
| `useGetSellersQuery({ limit: 1 })` | Total seller count |

**Layout:**

```
┌────────┬────────┬────────┬────────┬────────┬────────┐
│ Users  │ Sellers│Products│Orders  │Revenue │Tickets │
│ 1,234  │ 89     │ 3,456  │ 987    │$45,678 │ 12     │
│ +8%    │ +3%    │ +15%   │ +12%   │ +20%   │ -5%    │
├────────┴────────┴────────┴────────┴────────┴────────┤
│ ┌───────────────────────────┐ ┌─────────────────────┐│
│ │ Revenue Over Time (Line)  │ │ Orders by Status    ││
│ │ 30d / 90d / 1y toggles   │ │ (Donut Chart)       ││
│ └───────────────────────────┘ └─────────────────────┘│
├──────────────────────────────────────────────────────┤
│ ┌───────────────────────────┐ ┌─────────────────────┐│
│ │ Recent Orders (5 rows)    │ │ Pending Actions     ││
│ │ Order table               │ │ • 5 seller verif.   ││
│ │ [View All →]              │ │ • 12 open tickets   ││
│ └───────────────────────────┘ │ • 3 flagged reviews ││
│                               │ [View All →]        ││
│                               └─────────────────────┘│
├──────────────────────────────────────────────────────┤
│ Top Sellers (bar chart) │ Top Products (bar chart)   │
└──────────────────────────────────────────────────────┘
```

---

### 2. User Management — `src/features/admin/pages/UsersPage.tsx`

**Route:** `/admin/users`

**Data Requirements:**
| Hook | Endpoint |
|------|----------|
| `useGetUsersQuery({ page, limit, role, search })` | `GET /users` |
| `useCreateUserMutation()` | `POST /users` |
| `useUpdateUserMutation()` | `PATCH /users/:id` |
| `useDeleteUserMutation()` | `DELETE /users/:id` |

**Layout:**
- Header: "User Management" + `[+ Create User]` button
- Filter bar: search, role dropdown (all/customer/seller/admin/super_admin), status toggle (active/inactive)
- Data table:
  - Columns: avatar, name, email, role (badge), status, created date, last login, actions
  - Actions: View detail, Edit (modal/drawer), Disable/Enable, Delete
- Create User: Dialog/Drawer with form (firstName, lastName, email, password, role)

### User Detail — `src/features/admin/pages/UserDetailPage.tsx`

**Route:** `/admin/users/:id`

- Tabs: Profile, Addresses, Orders, Login History
- Profile tab: view/edit user info, role assignment, account status
- Addresses tab: list user addresses
- Orders tab: filtered orders for this user
- Login history tab: IP, device, timestamp table

---

### 3. Product Management — `src/features/admin/pages/ProductsPage.tsx`

**Route:** `/admin/products`

Same data table pattern as seller products, but:
- Shows ALL products across all sellers
- Additional column: Seller/Store name
- Additional filters: seller, status (includes `flagged`)
- Admin actions: Approve/Reject, Flag, Featured toggle, Delete
- Bulk actions: Approve selected, Reject selected, Delete selected

### Product Detail — `src/features/admin/pages/ProductDetailPage.tsx`

**Route:** `/admin/products/:id`

- Full product view (read-only fields from seller)
- Admin-only actions: approve, reject (with reason), feature/unfeature, change status
- View seller info
- View reviews for this product
- Inventory overview

---

### 4. Category Management — `src/features/admin/pages/CategoriesPage.tsx`

**Route:** `/admin/categories`

**Data Requirements:**
| Hook | Endpoint |
|------|----------|
| `useGetCategoriesQuery()` | `GET /categories` |
| `useCreateCategoryMutation()` | `POST /categories` |
| `useUpdateCategoryMutation()` | `PATCH /categories/:id` |
| `useDeleteCategoryMutation()` | `DELETE /categories/:id` |

**Layout:**
- Tree view for hierarchical categories (collapsible nodes)
- Each node: name, slug, product count, status, drag handle
- Actions per node: Edit, Add subcategory, Toggle active, Delete
- Create/Edit: Dialog with name, slug, description, parent (select), image URL, display order
- Drag-and-drop reordering (optional — can use display order number instead)

---

### 5. Brand Management — `src/features/admin/pages/BrandsPage.tsx`

**Route:** `/admin/brands`

Standard CRUD data table:
- Columns: logo, name, slug, product count, status, actions
- Create/Edit dialog: name, slug, description, logo URL, website URL

---

### 6. Orders Management — `src/features/admin/pages/OrdersPage.tsx`

**Route:** `/admin/orders`

Same table as seller orders, but:
- Shows ALL orders across all sellers
- Additional columns: seller name, payment method, payment status
- Admin actions: Force cancel, Force refund, Override status
- Export: CSV download of filtered orders

### Order Detail — `src/features/admin/pages/OrderDetailPage.tsx`

- Full order view with all items, shipping, payment
- Admin actions: override status, force refund, add admin note
- Timeline: all status changes with timestamps

---

### 7. Seller Management — `src/features/admin/pages/SellersPage.tsx`

**Route:** `/admin/sellers`

**Data Requirements:**
| Hook | Endpoint |
|------|----------|
| `useGetSellersQuery({ page, limit, status, search })` | `GET /sellers` |
| `useUpdateSellerMutation()` | `PATCH /sellers/:id` |

**Layout:**
- Tabs: All, Pending Verification, Active, Suspended
- Data table:
  - Columns: store name, owner, email, products count, revenue, status, joined date, actions
  - Actions: View detail, Verify/Reject (for pending), Suspend/Unsuspend
- Pending verification tab: requires document review → approve/reject with reason

### Seller Detail — `src/features/admin/pages/SellerDetailPage.tsx`

- Tabs: Overview, Products, Orders, Documents, Wallet, Violations
- Overview: store info, business details, performance metrics
- Documents: uploaded document URLs, verification status, approve/reject
- Violations: list of violations, create new violation (type, severity, description)

---

### 8. Marketing — Vouchers, Campaigns, Flash Sales

Each follows the same CRUD data table + create/edit dialog pattern:

**Vouchers (`/admin/marketing/vouchers`):**
- Table: code, type (percentage/fixed), discount value, usage count/limit, start/end dates, status
- Create form: code, type, value, min order amount, max uses, start date, end date, applicable categories/products

**Campaigns (`/admin/marketing/campaigns`):**
- Table: name, type, status, start/end dates, budget, impressions
- Create form: name, description, type, budget, target audience, start/end dates

**Flash Sales (`/admin/marketing/flash-sales`):**
- Table: name, status, start/end time, product count, discount %
- Create form: name, start datetime, end datetime, product selection + discount per product

---

### 9. CMS Pages — `src/features/admin/pages/CmsPagesPage.tsx`

**Route:** `/admin/content/pages`

- Table: title, slug, status (draft/published), last updated, author
- Create/Edit: title, slug, content (rich text editor or markdown), status, SEO fields

### Banners — `src/features/admin/pages/BannersPage.tsx`

**Route:** `/admin/content/banners`

- Table: image preview, title, position (home_hero, sidebar, etc.), link, active, display order
- Create/Edit: title, image URL, link URL, position (select), display order, start/end dates

---

### 10. Reviews Moderation — `src/features/admin/pages/ReviewsPage.tsx`

**Route:** `/admin/reviews`

- Table: product, customer, rating, excerpt, status, reported, date
- Filters: status (pending/approved/rejected/reported), rating, date range
- Actions: approve, reject (with reason), delete
- Reported reviews: flagged review details, report reason, action buttons

---

### 11. Support — Tickets, Disputes, Returns

**Tickets (`/admin/support/tickets`):**
- Table: ticket ID, subject, customer, status (open/in_progress/resolved/closed), priority, category, created date. Filters: `?status&priority&userId`
- Detail: message thread (uses field `message` not `content`), assign to agent (`PATCH /tickets/:id/assign`), update status (`PATCH /tickets/:id/status`), add internal note
- **Ticket Categories** tab: CRUD for `TicketCategory` (name, description, parentId, isActive, sortOrder). Uses `GET /tickets/categories/all`, `POST /tickets/categories`

**Disputes (`/admin/support/disputes`):**
- Table: disputeNumber, order ID, type, status, customer, seller, disputedAmount, created date. Filters: `?status&orderId&userId`
- Detail: evidence list (from both parties), message thread (`GET/POST /disputes/:id/messages`), status update with resolution (`PATCH /disputes/:id/status` with `UpdateDisputeStatusDto`)

**Returns (`/admin/support/returns`):**
- Table: returnNumber, order ID, reason, type (return/exchange), status, quantity, refundAmount, customer, created date. Filters: `?status&orderId&userId`
- Detail: return images, shipment tracking, status update (`PATCH /returns/:id/status` with `UpdateReturnStatusDto`), approve/reject
- **Return Reasons** tab: CRUD for `ReturnReason` (name, description, isActive, requiresImages, sortOrder). Uses `GET /return-reasons`, `POST /return-reasons`, `PATCH /return-reasons/:id`

---

### 12. Shipping — `src/features/admin/pages/ShippingPage.tsx`

**Route:** `/admin/shipping`

- Tabs: Zones, Methods, Carriers, Rates, Delivery Slots (tab selected via `?tab=` query param)
- **Zones:** CRUD table — name, countries[], states[], postcodes[], isDefault. Uses `ShippingZone` type.
- **Methods:** CRUD table — name, code, type (standard/express/same_day/etc.), estimatedDaysMin/Max, isActive. Uses `ShippingMethod` type.
- **Carriers:** CRUD table — name, code, logo URL, trackingUrlTemplate, isActive. Uses `ShippingCarrier` type.
- **Rates:** CRUD table — method, zone, rateType (flat/weight_based/price_based/etc.), baseRate, perKgRate, freeShippingThreshold. Uses `ShippingRate` type.
- **Delivery Slots:** CRUD table — name, startTime, endTime, daysOfWeek, maxOrders, additionalFee, isActive. Uses `DeliverySlot` type.
- **Calculate Shipping:** Test form — select zone, enter weight + totalAmount → call `POST /shipping/calculate`.

---

### 12b. Tax — `src/features/admin/pages/TaxPage.tsx`

**Route:** `/admin/tax`

- Tabs: Tax Zones, Tax Rates, Tax Classes (tab selected via `?tab=` query param)
- **Tax Zones:** CRUD table — name, countries[], states[], postcodes[], isDefault. Uses `TaxZone` type.
- **Tax Rates:** CRUD table — zone, class, name, rate (%), priority, isCompound, includesShipping, isActive. Uses `TaxRate` type.
- **Tax Classes:** CRUD table — name, description, isDefault. Uses `TaxClass` type.
- **Calculate Tax:** Test form — amount, countryCode, stateCode?, taxClassId? → call `POST /tax/calculate`.

---

### 12c. Bundles — `src/features/admin/pages/BundlesPage.tsx`

**Route:** `/admin/bundles`

- DataTable: name, slug, price, compareAtPrice, discount, isActive, item count, dates
- Actions: create, edit, toggle active, delete
- Detail page (`/admin/bundles/:id`): bundle info form + items management (add/remove products, set quantities, reorder)

---

### 13. Payments — `src/features/admin/pages/PaymentsPage.tsx`

**Route:** `/admin/payments`

- Table: all payments across all orders
- Columns: payment ID, order ID, amount, method, status, date
- Refund management: view/process refunds
- Payment method statistics

---

### 14. Notifications — `src/features/admin/pages/NotificationsPage.tsx`

**Route:** `/admin/notifications`

- Tabs: Templates, Send
- Templates: CRUD for notification templates (name, channel, subject, body with variables)
- Send: form to compose and send notification (select template, target users/roles, schedule)

---

### 15. Reports — `src/features/admin/pages/ReportsPage.tsx`

**Route:** `/admin/reports`

Client-side aggregated reports from existing data:

- **Sales Report:** Revenue over time, by category, by seller. Date range filter.
- **User Report:** New registrations over time, active users, by role.
- **Product Report:** Top selling, most viewed, lowest rated, out of stock.
- **Seller Report:** Performance ranking, commission summary.
- Export to CSV functionality per report.

---

## Validation Criteria

- [ ] Admin dashboard shows KPI cards with live data
- [ ] All CRUD operations work for: users, categories, brands, attributes, vouchers, campaigns, flash sales, CMS pages, banners
- [ ] User management supports create, role assignment, disable/enable
- [ ] Seller verification workflow: review documents → approve/reject
- [ ] Order management allows status override and force actions
- [ ] Review moderation: approve, reject, handle reports
- [ ] Support ticket thread display with replies
- [ ] Dispute resolution form works correctly
- [ ] Sidebar with nested items collapses/expands properly
- [ ] All tables support pagination, search, sort, and column filters
- [ ] Bulk actions work with selected rows
- [ ] Report charts render correctly with Recharts
- [ ] Shipping page shows all 5 tabs (zones, methods, carriers, rates, delivery slots) with CRUD
- [ ] Tax page shows 3 tabs (zones, rates, classes) with CRUD and calculate test form
- [ ] Bundles page supports CRUD with nested item management
- [ ] Ticket categories CRUD works from Support > Tickets tab
- [ ] Return reasons CRUD works from Support > Returns tab
- [ ] Dispute resolution uses status update endpoint (not /resolve)
