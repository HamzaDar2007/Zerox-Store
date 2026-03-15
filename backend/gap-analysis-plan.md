# 🔍 E-Commerce Platform — Gap Analysis & Remediation Plan

**Generated:** March 12, 2026
**Scope:** Full audit of database design document vs actual TypeORM implementation
**Codebase:** 112 entities | 33 modules | 138 DTOs | 23 enum files

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Scope Creep: Document vs Implementation](#2-scope-creep-document-vs-implementation)
3. [Critical Data Integrity Flaws (P0)](#3-critical-data-integrity-flaws-p0)
4. [Missing Foreign Key Relationships (P0)](#4-missing-foreign-key-relationships-p0)
5. [Missing Constraints (P0)](#5-missing-constraints-p0)
6. [Missing Enum Definitions (P0)](#6-missing-enum-definitions-p0)
7. [Architectural Conflicts (P1)](#7-architectural-conflicts-p1)
8. [Denormalized Fields Without Validation (P1)](#8-denormalized-fields-without-validation-p1)
9. [Deprecated / Dead Code (P1)](#9-deprecated--dead-code-p1)
10. [Security Findings](#10-security-findings)
11. [Document vs Code Field Mismatches](#11-document-vs-code-field-mismatches)
12. [Design Improvements (P2)](#12-design-improvements-p2)
13. [Cleanup Items (P3)](#13-cleanup-items-p3)
14. [Implementation Checklist](#14-implementation-checklist)
15. [Verification Steps](#15-verification-steps)

---

## 1. Executive Summary

The original design document specified **28 tables across 10 modules**. The actual implementation has grown to **112 entities across 33 modules** — a **4x scope expansion** without any document update.

This audit uncovered:
- **11 missing FK relationships** that can cause orphaned data
- **3 missing unique constraints** that allow duplicate records
- **3 missing TypeScript enum files** that cause compile issues
- **2 architectural conflicts** (dual stock mgmt, dual role system)
- **10+ denormalized count fields** without validation triggers
- **2 deprecated entity files** with malformed column types
- **5 security concerns** (medium severity)

### Impact Assessment

| Severity | Count | Risk |
|----------|-------|------|
| 🔴 P0 — Critical | 6 issues | Data corruption, compile failures |
| 🟠 P1 — High | 7 issues | Reliability, inconsistent state |
| 🟡 P2 — Medium | 7 issues | Design debt, performance |
| 🟢 P3 — Low | 4 issues | Code cleanliness |

---

## 2. Scope Creep: Document vs Implementation

### Modules in Document (10):
Auth & Users, Sellers & Stores, Categories & Brands, Products, Cart, Orders, Payments & Refunds, Reviews, Marketing, Notifications

### Additional Modules in Code (23):
| Module | Entities | Purpose |
|--------|----------|---------|
| audit | 2 | Audit logs, user activity tracking |
| bundles | 2 | Product bundles with discounts |
| chat | 2 | Conversations, messages |
| cms | 2 | Banners, static pages |
| disputes | 3 | Order disputes with evidence |
| i18n | 4 | Languages, currencies, translations |
| inventory | 6 | Warehouses, stock movements, reservations, transfers |
| loyalty | 5 | Points, tiers, transactions, referrals |
| operations | 2 | Bulk operations, import/export jobs |
| returns | 4 | Return requests, reasons, images, shipments |
| scheduler | 0 | Scheduled job runner (service only) |
| search | 4 | History, recommendations, comparisons, recently viewed |
| seo | 2 | SEO metadata, URL redirects |
| shared | 0 | Shared module (empty) |
| shipping | 5 | Carriers, methods, zones, rates, delivery slots |
| subscriptions | 2 | Recurring orders with Stripe |
| system | 2 | Feature flags, system settings |
| tax | 4 | Tax classes, zones, rates, order tax lines |
| tickets | 3 | Support tickets with messaging |

### Extra Entities Added to Documented Modules:
| Module | Document Tables | Added Entities |
|--------|----------------|----------------|
| Auth & Users | 5 | user_roles, login_history, user_permissions (deprecated) |
| Sellers | 2 | seller_documents, seller_violations, store_followers |
| Categories | 2 | attributes, attribute_groups, attribute_options, brand_categories, category_attributes |
| Products | 3 | product_attributes, product_questions, product_answers, price_history |
| Cart | 2 | checkout_sessions, wishlists |
| Orders | 3 | order_status_history, order_snapshots, shipment_items |
| Payments | 2 | payment_attempts, saved_payment_methods |
| Reviews | 1 | review_helpfulness, review_reports |
| Marketing | 4 | voucher_conditions, voucher_products, voucher_usages, flash_sale_products |
| Notifications | 1 | notification_preferences, notification_templates |

**Action Required:** The design document has been updated (see `document.md`). Review new modules and decide which to keep vs prune.

---

## 3. Critical Data Integrity Flaws (P0)

### 3.1 StockReservation — No Mutual Exclusion

**File:** `backend/src/modules/inventory/entities/stock-reservation.entity.ts`

Both `orderId` and `cartId` are nullable with no CHECK constraint ensuring exactly one is set. This means a reservation can exist with neither an order nor a cart reference.

**Fix:** Add migration with CHECK constraint:
```sql
ALTER TABLE stock_reservations
ADD CONSTRAINT chk_reservation_reference
CHECK (
  (order_id IS NOT NULL)::int + (cart_id IS NOT NULL)::int = 1
);
```

### 3.2 Dual Stock Management — Two Sources of Truth

The `products` table has a `stock` column (INTEGER, default 0) AND there's a full `inventory` module with `inventory.quantity_on_hand`, `inventory.quantity_available`, etc.

**Risk:** If stock is decremented in `products.stock` but not in `inventory.quantity_available` (or vice versa), the system will show inconsistent availability.

**Fix Options:**
- Option A: Remove `products.stock` and use Inventory module exclusively (cleaner)
- Option B: Keep `products.stock` as a denormalized cache with triggers syncing from Inventory
- Option C: Remove Inventory module and keep simple `products.stock` (simpler)

### 3.3 Inventory quantityAvailable Not Validated

**File:** `backend/src/modules/inventory/entities/inventory.entity.ts`

`quantityAvailable` is stored as a separate column but should always equal `quantityOnHand - quantityReserved`. No database-level check constraint enforces this.

**Fix:**
```sql
ALTER TABLE inventory
ADD CONSTRAINT chk_quantity_available
CHECK (quantity_available = quantity_on_hand - quantity_reserved);
```

---

## 4. Missing Foreign Key Relationships (P0)

These columns exist in entities but have **no `@ManyToOne` relationship** or `@JoinColumn` — meaning TypeORM won't create FK constraints and the database won't enforce referential integrity.

| # | Entity | Column | Should FK To | File |
|---|--------|--------|-------------|------|
| 1 | Cart | `voucher_id` | Voucher | `cart/entities/cart.entity.ts` |
| 2 | CheckoutSession | `shipping_address_id` | Address | `cart/entities/checkout-session.entity.ts` |
| 3 | CheckoutSession | `billing_address_id` | Address | `cart/entities/checkout-session.entity.ts` |
| 4 | CheckoutSession | `shipping_method_id` | ShippingMethod | `cart/entities/checkout-session.entity.ts` |
| 5 | Seller | `verified_by` | User | `sellers/entities/seller.entity.ts` |
| 6 | FlashSaleProduct | `variant_id` | ProductVariant | `marketing/entities/flash-sale-product.entity.ts` |
| 7 | StockReservation | `order_id` | Order | `inventory/entities/stock-reservation.entity.ts` |
| 8 | StockReservation | `cart_id` | Cart | `inventory/entities/stock-reservation.entity.ts` |
| 9 | ReturnRequest | `reviewed_by` | User | `returns/entities/return-request.entity.ts` |
| 10 | User | `preferred_language_id` | Language | `users/entities/user.entity.ts` |
| 11 | User | `preferred_currency_id` | Currency | `users/entities/user.entity.ts` |

**Fix for each:** Add `@ManyToOne` relationship + `@JoinColumn` decorator.

---

## 5. Missing Constraints (P0)

| # | Entity | Columns | Constraint Needed | Risk |
|---|--------|---------|-------------------|------|
| 1 | UserRole | `(user_id, role_id)` | UNIQUE | Duplicate role assignments |
| 2 | Permission | `(role_id, module, action)` | UNIQUE | Duplicate permission entries |
| 3 | Seller | `user_id` | UNIQUE | Multiple seller profiles per user |

**Fix:** Add `@Unique` decorators to entity classes:
```typescript
// user-role.entity.ts
@Unique(['userId', 'roleId'])

// permission.entity.ts
@Unique(['roleId', 'module', 'action'])

// seller.entity.ts — already has @OneToOne but no unique on column
@Column({ name: 'user_id', type: 'uuid', unique: true })
```

---

## 6. Missing Enum Definitions (P0)

These enums are referenced in migrations (DB-level enum types created) but have **no corresponding TypeScript enum file**, causing potential compile/runtime issues.

| # | Enum Name | Used In | Migration That Creates It |
|---|-----------|---------|--------------------------|
| 1 | `CheckoutStep` | `checkout_sessions.step` | `1700000000010-CreateEcommerceCartCheckout.ts` |
| 2 | `ShipmentStatus` | `shipments.status` | `1700000000011-CreateEcommerceOrders.ts` |
| 3 | `ShippingMethodType` | `shipments.shipping_method` | `1700000000011-CreateEcommerceOrders.ts` |

**Fix:** Create enum files:

```typescript
// backend/src/common/enums/checkout.enum.ts — add:
export enum CheckoutStep {
  CART_REVIEW = 'cart_review',
  SHIPPING_ADDRESS = 'shipping_address',
  SHIPPING_METHOD = 'shipping_method',
  PAYMENT = 'payment',
  REVIEW = 'review',
  CONFIRMATION = 'confirmation',
}

// backend/src/common/enums/shipping.enum.ts — add:
export enum ShipmentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  DISPATCHED = 'dispatched',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETURNED = 'returned',
}

export enum ShippingMethodType {
  STANDARD = 'standard',
  EXPRESS = 'express',
  SAME_DAY = 'same_day',
  FREE = 'free',
  PICKUP = 'pickup',
}
```

---

## 7. Architectural Conflicts (P1)

### 7.1 Dual Role System

**Conflict:** User entity has a `role` ENUM column (`customer | seller | admin | super_admin`) AND there's a separate `user_roles` junction table + `roles` table.

**Impact:** Guards in `roles.guard.ts` check `user.role` (the enum). The `user_roles` table is populated but may not be checked consistently.

**Recommendation:** Pick one approach:
- **Option A:** Keep `users.role` enum for simple primary role + use `user_roles` for additional secondary roles
- **Option B:** Remove `users.role` enum and use `user_roles` exclusively (more flexible but slower queries)

### 7.2 Stores — OneToOne vs OneToMany

**Document says:** `sellers ↔ stores` is OneToOne (1 store per seller)
**Code says:** `Seller.stores` is `@OneToMany` and `Store.seller` is `@ManyToOne` (multiple stores per seller)

**Impact:** If business requires single store per seller, add UNIQUE constraint on `stores.seller_id`.

### 7.3 Missing WalletTransaction Entity File

`SellerWallet` has `@OneToMany(() => WalletTransaction, ...)` but no `wallet-transaction.entity.ts` file exists in the sellers module. The migration creates the `wallet_transactions` table. Entity may be auto-generated or missing.

**Fix:** Create `backend/src/modules/sellers/entities/wallet-transaction.entity.ts` matching the migration schema.

---

## 8. Denormalized Fields Without Validation (P1)

These fields store aggregated/computed values but have no triggers, listeners, or application-level sync ensuring they stay accurate.

| # | Entity | Field | Should Be Computed From |
|---|--------|-------|------------------------|
| 1 | Inventory | `quantity_available` | `quantity_on_hand - quantity_reserved` |
| 2 | Voucher | `used_count` | `COUNT(voucher_usages WHERE voucher_id = ?)` |
| 3 | Review | `helpful_count` | `COUNT(review_helpfulness WHERE is_helpful = true)` |
| 4 | Review | `not_helpful_count` | `COUNT(review_helpfulness WHERE is_helpful = false)` |
| 5 | CampaignProduct | `sold_count` | Order data aggregation |
| 6 | FlashSaleProduct | `sold_count` | Order data aggregation |
| 7 | ProductBundle | `bundle_price` | Calculated from bundle items |
| 8 | ProductBundle | `original_total_price` | Sum of item base prices |
| 9 | Subscription | `total_orders` | `COUNT(subscription_orders)` |
| 10 | Subscription | `total_spent` | `SUM(subscription_orders.amount)` |
| 11 | LoyaltyPoints | `available_balance` | `total_earned - total_redeemed - total_expired` |
| 12 | Seller | `total_products, total_orders, total_revenue` | Aggregated from products/orders |
| 13 | Store | `total_sales, total_followers, total_reviews` | Aggregated from related tables |

**Fix Options:**
- Add PostgreSQL triggers to auto-update on INSERT/UPDATE/DELETE of source tables
- Use TypeORM `@AfterInsert`, `@AfterUpdate`, `@AfterRemove` subscribers
- Accept denormalization but add periodic reconciliation jobs in scheduler module

---

## 9. Deprecated / Dead Code (P1)

| # | File | Entity | Issue |
|---|------|--------|-------|
| 1 | `users/entities/user-permission.entity.ts` | UserPermission | Deprecated, malformed column types (no type specified), not in migrations |
| 2 | `role-permissions/entities/role-permission.entity.ts` | RolePermission | Deprecated, malformed column types, not in migrations |

**Fix:** Delete both files and remove from module imports. The `permissions` table with `role_id` handles all RBAC.

---

## 10. Security Findings

### Strengths ✅
| Area | Implementation |
|------|---------------|
| Password hashing | bcrypt with 10 salt rounds |
| JWT tokens | 15-min access + 7-day refresh with rotation |
| Account lockout | 5 failed attempts → 15-min lock |
| Rate limiting | express-rate-limit + NestJS throttler (100-300 req/min) |
| Security headers | Helmet with CSP, HSTS, X-Frame-Options |
| CORS | Whitelist approach (not wildcard) |
| Validation | Global pipe with whitelist + forbidNonWhitelisted |
| Input sanitization | HTML/NoSQL injection protection via SecurityUtil |
| SQL injection | All queries parameterized (TypeORM + $1 params) |
| Error handling | Global exception filter, no stack traces leaked |

### Concerns ⚠️

| # | Issue | Severity | Detail | Fix |
|---|-------|----------|--------|-----|
| 1 | CSP unsafe-inline | MEDIUM | `'unsafe-inline'` for scripts/styles reduces XSS protection | Remove unsafe-inline, use nonces |
| 2 | No per-endpoint auth rate limiting | MEDIUM | `/auth/login` and `/auth/register` share global rate limit only | Add `@Throttle(5, 60)` to auth endpoints |
| 3 | SavedPaymentMethod.gateway_token | MEDIUM | Payment tokens stored as plain varchar | Encrypt at rest using pgcrypto or app-level encryption |
| 4 | Admin guard bypass without audit | LOW | Super Admin/Admin bypass all permission checks | Add audit log entry when admin bypasses |
| 5 | JWT secret in .env | LOW | Dev secret visible in version control | Ensure `.env` is in `.gitignore`, use secrets manager in prod |

---

## 11. Document vs Code Field Mismatches

### Fields Changed Significantly

| Table | Document Version | Actual Implementation |
|-------|-----------------|----------------------|
| `users.role` | Single ENUM (customer\|seller\|admin) | ENUM (customer\|seller\|admin\|super_admin) + separate `user_roles` table |
| `users` | 12 columns | 26 columns (added 2FA, login tracking, preferences, etc.) |
| `addresses.is_default` | Single boolean | Split into `is_default_shipping` + `is_default_billing` + lat/lng/delivery_instructions |
| `sellers.cnic_image` | Single field | Split into `cnic_front_image` + `cnic_back_image` |
| `sellers` | 13 columns | 26 columns (added banking IBAN/SWIFT, vacation mode, performance metrics) |
| `stores → sellers` | OneToOne | OneToMany (multiple stores per seller) |
| `products.is_active` | Boolean | Replaced with `status` ENUM (8 states) |
| `products` | 18 columns | 34 columns (added dimensions, warranty, SEO, digital product flags) |
| `orders.address_id` | Single FK | JSONB `shipping_address` + `billing_address` snapshots |
| `orders` | 14 columns | 35 columns (added gift, loyalty, delivery tracking, source platform) |
| `order_items` | 13 columns | 15 columns (uses `product_snapshot` JSONB, quantity tracking) |
| `shipments` | 8 columns | 18 columns (added dimensions, cost, delivery address snapshot) |
| `payments.order_id` | UNIQUE (one payment per order) | Not unique (multiple payments per order possible) |
| `refunds` | Linked to order + order_item + payment + user | Linked to payment only (simplified) |
| `reviews.body` | Single TEXT | Split into `content` + `pros[]` + `cons[]` + moderation workflow |
| `reviews` constraint | UNIQUE(user_id, order_item_id) | UNIQUE(user_id, product_id) |
| `flash_sales` | Single table | Split into `flash_sales` (parent) + `flash_sale_products` (child) |
| `vouchers` | 15 columns | 21 columns + `voucher_conditions` + `voucher_products` tables |
| `notifications.is_read` | Boolean | Replaced with `status` ENUM + `channel` ENUM + multi-channel support |

---

## 12. Design Improvements (P2)

| # | Area | Issue | Recommendation |
|---|------|-------|----------------|
| 1 | VoucherCondition.condition_type | varchar instead of enum | Create `VoucherConditionType` enum |
| 2 | NotificationPreference.type | varchar instead of enum | Use `NotificationType` enum |
| 3 | NotificationTemplate.type | varchar instead of enum | Use `NotificationType` enum |
| 4 | SavedPaymentMethod.payment_method | varchar instead of enum | Use `PaymentMethod` enum |
| 5 | SubscriptionOrder.status | varchar instead of enum | Create `SubscriptionOrderStatus` enum |
| 6 | BundleItem | No timestamps | Add `created_at` |
| 7 | InventoryTransferItem | No timestamps | Add `created_at` |

---

## 13. Cleanup Items (P3)

| # | Issue | File |
|---|-------|------|
| 1 | ReturnReason: property `requiresImages` vs column `requires_image` (plural vs singular) | `returns/entities/return-reason.entity.ts` |
| 2 | InventoryTransfer: property `receivedAt` maps to column `completed_at` | `inventory/entities/inventory-transfer.entity.ts` |
| 3 | Dispute: `customerId` column named `opened_by`, `sellerId` column named `against_user_id` | `disputes/entities/dispute.entity.ts` |
| 4 | RefreshToken entity exported with dual names (Session + RefreshToken) | `auth/entities/refresh-token.entity.ts` |

---

## 14. Implementation Checklist

### Phase 1: P0 — Critical Fixes
- [ ] Add 11 missing FK relationships (Section 4)
- [ ] Add 3 missing unique constraints (Section 5)
- [ ] Create 3 missing TypeScript enum files (Section 6)
- [ ] Add CHECK constraint on StockReservation mutual exclusion (Section 3.1)
- [ ] Resolve dual stock management strategy (Section 3.2)
- [ ] Add inventory quantity validation constraint (Section 3.3)

### Phase 2: P1 — High Priority
- [ ] Decide on dual role system approach (Section 7.1)
- [ ] Create missing WalletTransaction entity (Section 7.3)
- [ ] Add triggers/subscribers for denormalized counts (Section 8)
- [ ] Delete deprecated UserPermission + RolePermission entities (Section 9)
- [ ] Add per-endpoint rate limiting on auth routes (Section 10)
- [ ] Encrypt SavedPaymentMethod.gateway_token (Section 10)
- [ ] Decide stores OneToOne vs OneToMany (Section 7.2)

### Phase 3: P2 — Medium Priority
- [ ] Convert varchar-as-enum fields to actual enums (Section 12)
- [ ] Add timestamps to BundleItem and InventoryTransferItem
- [ ] Add indexes on frequently queried fields
- [ ] Remove CSP unsafe-inline

### Phase 4: P3 — Cleanup
- [ ] Fix naming inconsistencies (Section 13)
- [ ] Audit all 84 extra entities for necessity

---

## 15. Verification Steps

After implementing fixes, run these checks:

```bash
# 1. TypeScript compilation (catches missing enums)
npm run build

# 2. Run migrations against clean DB
npm run migration:run

# 3. Check for duplicate UserRole entries
SELECT user_id, role_id, COUNT(*) FROM user_roles GROUP BY user_id, role_id HAVING COUNT(*) > 1;

# 4. Check for orphaned Cart.voucher_id
SELECT c.id FROM carts c WHERE c.voucher_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM vouchers v WHERE v.id = c.voucher_id);

# 5. Check StockReservation integrity
SELECT * FROM stock_reservations WHERE order_id IS NULL AND cart_id IS NULL;

# 6. Check products.stock vs inventory divergence
SELECT p.id, p.stock, COALESCE(SUM(i.quantity_available), 0) as inv_stock
FROM products p LEFT JOIN inventory i ON i.product_id = p.id
GROUP BY p.id, p.stock
HAVING p.stock != COALESCE(SUM(i.quantity_available), 0);

# 7. Test auth rate limiting
for i in {1..20}; do curl -s -o /dev/null -w "%{http_code}\n" -X POST localhost:3001/auth/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"wrong"}'; done

# 8. Verify SavedPaymentMethod tokens not exposed
curl -H "Authorization: Bearer <token>" localhost:3001/payments/saved-methods | jq '.data[].gatewayToken'
```

---

**Document last updated:** March 12, 2026
**Next review:** After Phase 1 implementation
