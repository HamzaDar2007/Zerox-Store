# Known Issues — Prioritized Tracker

> **Source:** [FULL-PROJECT-AUDIT.md](FULL-PROJECT-AUDIT.md) (February 24, 2026)
>
> **Total Issues:** 140+ across 32 modules
>
> Use checkbox markers to track resolution progress.

---

## P0 — Critical: Security Vulnerabilities (15 items)

These must be fixed **before any deployment** — they allow data theft, account takeover, and privilege escalation.

### Password & Token Leaks

- [ ] **Auth — Password leaked in login response** — `auth.service.ts` ~L100: destructure `{password, ...userSafe} = user` copies all fields including `passwordHash`. Must explicitly exclude password field before returning.
- [ ] **Auth — Password leaked in register response** — `auth.service.ts` ~L63: same destructure bug as login.
- [ ] **Auth — Password leaked in getCurrentUser** — `auth.service.ts` ~L248: same destructure bug.
- [ ] **Auth — Password reset token exposed in API response** — `auth.service.ts` ~L194: `forgotPassword()` returns the reset token in the JSON response instead of sending it via email. Enables complete account takeover.
- [ ] **Auth — Password reset token logged to console** — `auth.service.ts` ~L191: `console.log(resetToken)` in production code.

### Mass-Assignment & Input Validation

- [ ] **18 modules bypass all input validation** — Controllers accept `@Body() dto: any` instead of typed DTOs, allowing any JSON to pass through `Object.assign(entity, dto)` directly to the database. Affected modules: Reviews, Disputes, Chat, Tickets, Marketing, Shipping, Tax, Subscriptions, Bundles, CMS, SEO, I18n, Operations, System, Loyalty, Notifications, Search, Audit. **Fix:** Replace `any` with the existing typed DTOs in each controller method.

### Privilege Escalation & Access Control

- [ ] **Users — Privilege escalation via update** — `users.service.ts`: Any user with `users.update` permission can set any user's role to `super_admin` via PATCH `/users/:id`. **Fix:** Strip `role` from UpdateUserDto unless caller is super_admin.
- [ ] **Users — Password change via update** — `users.service.ts`: Any user with `users.update` can change any user's password via PATCH. **Fix:** Require current password or restrict to self-service.
- [ ] **Role-Permissions — No authorization** — `role-permissions.controller.ts`: Controller has zero `@UseGuards()` decorators. Any authenticated user can modify role-permission bindings.
- [ ] **Cart — No ownership check** — `cart.service.ts`: Users can modify other users' cart items via PATCH/DELETE `/cart/items/:id`.
- [ ] **Chat — No ownership check** — `chat.service.ts`: `markAsRead` ignores userId — any user can mark any message as read.
- [ ] **Subscriptions — No ownership check** — Any authenticated user can modify any subscription.
- [ ] **Notifications — No ownership check** — Any authenticated user can read/modify any user's notifications.
- [ ] **Tickets — No ownership check** — Any authenticated user can view/modify any support ticket.

---

## P0 — Critical: Runtime Crash Bugs (22 items)

These endpoints return HTTP 500 on first call due to wrong relation names, missing NOT NULL columns, or non-existent column references.

### Orders Module
- [ ] **Orders — `findOne` crashes** — Loads `'seller'` relation which doesn't exist on Order entity. **Fix:** Remove `'seller'` from relations array or add the relation to entity.
- [ ] **Orders — `findAll` crashes** — Filters on `order.sellerId` which doesn't exist as a column. **Fix:** Use correct column name or join through order items.

### Payments Module
- [ ] **Payments — `createPayment` crashes** — Doesn't generate `paymentNumber` which is NOT NULL in DB. **Fix:** Auto-generate using DB sequence.
- [ ] **Payments — `findOnePayment` crashes** — Loads `'refunds'` relation which doesn't exist. **Fix:** Remove from relations or define the relation on entity.
- [ ] **Payments — `createRefund` crashes** — Doesn't generate `refundNumber` (NOT NULL). **Fix:** Auto-generate using DB sequence.
- [ ] **Payments — `findAllRefunds` crashes** — Filters on `refund.orderId` which doesn't exist.
- [ ] **Payments — `findOneRefund` crashes** — Loads `'order'` relation which doesn't exist.

### Cart Module
- [ ] **Cart — `createCheckoutSession` crashes** — Doesn't set `sessionToken` which is NOT NULL. **Fix:** Auto-generate UUID token.

### Categories Module
- [ ] **Categories — `findOneCategory` crashes** — Loads `'attributes'` relation (not defined on entity). **Fix:** Use correct relation name `'categoryAttributes'`.
- [ ] **Categories — `findAllAttributes` crashes** — Loads `'group'` relation (should be `'attributeGroup'`).

### Returns Module
- [ ] **Returns — `findOne` crashes** — Loads `'shipment'` singular (should be `'shipments'` plural).

### Shipping Module
- [ ] **Shipping — `findAllZones` crashes** — Loads `'methods'` relation which doesn't exist on ShippingZone entity.
- [ ] **Shipping — `getAvailableSlots` crashes** — Queries `slot.date` and `slot.zoneId` which don't exist as columns.

### Tax Module
- [ ] **Tax — `calculateTax` crashes** — Joins `'rate.zone'` (should be `'rate.taxZone'`), queries non-existent column aliases.

### CMS Module
- [ ] **CMS — `getActiveBannersByPosition` crashes** — Queries `banner.startDate`/`banner.endDate` (should be `startsAt`/`endsAt`).

### Marketing Module
- [ ] **Marketing — `findAllCampaigns` crashes** — Filters `campaign.isActive` (doesn't exist, column is `status`).
- [ ] **Marketing — `findAllVouchers` crashes** — Filters `voucher.isActive` (doesn't exist, column is `status`).

### Inventory Module
- [ ] **Inventory — `reserveStock` crashes** — Never sets `reservation.productId` (NOT NULL constraint). **Fix:** Set productId from request.

### Sellers Module
- [ ] **Sellers — `followStore`/`unfollowStore` crashes** — Increments `followerCount` (column is `totalFollowers`).

### Other Modules
- [ ] **Search — `getRecommendations` returns wrong data** — Passes `user.id` as `sourceProductId` parameter.
- [ ] **Operations — `updateBulkOperationProgress` writes wrong fields** — Maps `progress`→`successCount` and `processedCount`→`failureCount` (swapped field semantics).
- [ ] **Products — PriceHistory broken** — Sets `price` (doesn't exist), should set `oldPrice`/`newPrice`. Silently fails.

---

## P1 — High: Validation & Input Issues (60+ endpoints)

### DTOs Defined but Unused (`dto: any`)

The following modules have properly defined DTOs in their `dto/` folders but controllers use `@Body() dto: any`, completely bypassing class-validator:

| Module | Affected Endpoints | DTO Files Exist |
|--------|-------------------|-----------------|
| Reviews | create, update | CreateReviewDto, UpdateReviewDto |
| Disputes | create, addEvidence, addMessage | CreateDisputeDto, etc. |
| Chat | createConversation, sendMessage | CreateConversationDto, etc. |
| Tickets | create, update, addMessage, updateStatus, assign, createCategory | All DTOs exist |
| Marketing | all 6 create/update | Campaign, FlashSale, Voucher DTOs |
| Shipping | all create/update | Zone, Method, Rate, Carrier DTOs |
| Tax | all create/update | Zone, Rate, Class DTOs |
| Subscriptions | create, update | CreateSubscriptionDto, etc. |
| Bundles | create, update | CreateBundleDto, etc. |
| CMS | all create/update | Page, Banner DTOs |
| SEO | all create/update | SeoMetadata, UrlRedirect DTOs |
| I18n | all create/update | Language, Currency, Translation DTOs |
| Operations | all create/update | BulkOperation, ImportExportJob DTOs |
| System | all create/update | Setting, FeatureFlag DTOs |
| Loyalty | earn/redeem points, create/update tier | All DTOs exist |
| Notifications | createTemplate, updateTemplate, updatePreference | All DTOs exist |

**Fix pattern:** In each controller, change `@Body() dto: any` to `@Body() dto: CreateXxxDto` (the DTO classes already exist).

---

## P2 — Medium: Missing Features (22 items)

These features have entity definitions and/or DTOs but no working implementation:

- [ ] **Address CRUD** — Entity + DTOs exist in users module but no controller endpoints
- [ ] **Login history tracking** — `LoginHistory` entity exists but never written to
- [ ] **User soft delete** — `@DeleteDateColumn` exists but `remove()` does hard delete
- [ ] **Slug auto-generation** — DTOs document slug fields but no auto-generation logic
- [ ] **Attribute Option CRUD** — Entity exists in categories, no endpoints
- [ ] **Attribute Group CRUD** — Entity exists in categories, no endpoints
- [ ] **Category-Attribute assignment** — `CategoryAttribute` entity exists, no endpoints
- [ ] **Seller verification endpoint** — Service method exists but not exposed via controller
- [ ] **Seller violations CRUD** — `SellerViolation` entity exists, no endpoints
- [ ] **Wallet transaction creation** — `WalletTransaction` entity exists, no create endpoint
- [ ] **Campaign product management** — `CampaignProduct` entity exists, no endpoints
- [ ] **Flash sale product management** — `FlashSaleProduct` entity exists, no endpoints
- [ ] **Voucher update endpoint** — `UpdateVoucherDto` exists but no PATCH endpoint
- [ ] **Flash sale update endpoint** — `UpdateFlashSaleDto` exists but no PATCH endpoint
- [ ] **Return shipment management** — `ReturnShipment` entity exists, no endpoints
- [ ] **Order snapshot creation** — `OrderSnapshot` entity exists, never used
- [ ] **Product recommendation CRUD** — Only GET endpoint exists
- [ ] **Email sending for password reset** — Token returned in API response instead of emailed
- [ ] **File upload integration** — `SupabaseService` exists but not wired into any module
- [ ] **WebSocket/real-time chat** — Socket.IO dependency installed, no gateway implemented
- [ ] **2FA implementation** — Entity columns exist (e.g., `twoFactorSecret`) but no logic
- [ ] **Account locking on failed logins** — `loginAttempts`/`lockedUntil` columns exist, unused

---

## P2 — Medium: Logic Errors (20+ items)

- [ ] **Auth — Login ignores `isActive` flag** — Deactivated users can still log in
- [ ] **Auth — Login ignores `lockedUntil`** — Locked users can still log in
- [ ] **Auth — Logout requires no authentication** — Anyone can invalidate tokens
- [ ] **RolesGuard logic flaw** — `Object.values(RoleEnum).includes()` is overly permissive
- [ ] **Products — `user.id` used as `sellerId`** — When creating products, the user ID is assigned as seller ID (incorrect for users who aren't sellers)
- [ ] **Products — `viewCount` stale** — Slug-based lookup doesn't increment view counter atomically
- [ ] **Exception filter conflict** — `GlobalExceptionFilter` (APP_FILTER) + `HttpExceptionFilter` both handle HttpException
- [ ] **Response double-wrapping risk** — Services return `{success, message, data}`, ResponseInterceptor also wraps in same format
- [ ] **Number generation race conditions** — Orders, returns, disputes, tickets, transfers all use `count()` for sequence numbers (not atomic)
- [ ] **Two conflicting role enum systems** — `RoleEnum` (admin/guest/client/employee) vs `UserRole` (customer/seller/admin/super_admin)
- [ ] **UUID validation inconsistency** — Mix of `@IsUUID('4')`, `@IsUuidString()`, `@IsUUID()`, custom regex across DTOs
- [ ] **Auth — `@ApiBearerAuth` on unauthenticated endpoints** — Misleading Swagger UI on public auth endpoints
- [ ] **Security util — `sanitizeString` too aggressive** — Strips quotes and braces, breaking legitimate inputs

---

## P3 — Low: Dead Code & Cleanup (40+ items)

### Unused DTOs (~20+)
- [ ] `CreateCartDto`, `UpdateCartDto` — Cart uses inline objects
- [ ] `CreateAddressDto`, `UpdateAddressDto` — No address endpoints exist
- [ ] `AssignPermissionsDto` — Referenced nowhere
- [ ] `UpdateDisputeDto` — Controller uses `any`
- [ ] Various other create/update DTOs that exist but controllers use `any` (overlaps with P1)

### Unused Service Methods (~15+)
- [ ] `auth.service.ts` — `validateUser`, `getCurrentUser`, `getCurrentUserByEmail`
- [ ] `orders.service.ts` — `getSellerOrders`, `addItem`, `removeItem`
- [ ] `cart.service.ts` — `getCartSummary`
- [ ] Various other helper methods with no callers

### Unused Entities (2)
- [ ] `UserPermission` — Deprecated, no longer part of the auth model
- [ ] `RolePermission` — Deprecated, role-permission is direct 1-to-many

### Unused Infrastructure
- [ ] `uuid-validation.pipe.ts` — Unused pipe
- [ ] `validation.pipe.ts` — Replaced by `global-validation.pipe.ts`
- [ ] `validation-exception.filter.ts` — Not registered anywhere
- [ ] `security-validation.middleware.ts` — Imported but not applied

### Miscellaneous
- [ ] `console.error` in `users.service.ts` — Should use logger
- [ ] Multiple unused imports across codebase
- [ ] Missing `updatedAt` on some entities (Notification, Language, LoyaltyTier)
- [ ] Some seed scripts referenced in `package.json` (`seed.ts`, `permissions-seed.ts`) don't exist

---

## Resolution Priority

| Priority | Items | Action Required |
|----------|-------|-----------------|
| **P0 Security** | 15 | Must fix before any user-facing deployment |
| **P0 Crashes** | 22 | Must fix before any user-facing deployment |
| **P1 Validation** | 60+ endpoints | Wire existing DTOs — medium effort, high impact |
| **P2 Features** | 22 | Add endpoints/logic for existing entities |
| **P2 Logic** | 20+ | Individual bug fixes |
| **P3 Cleanup** | 40+ | Delete dead code, clean up imports |

---

*Last updated: March 1, 2026 — Extracted from [FULL-PROJECT-AUDIT.md](FULL-PROJECT-AUDIT.md)*
