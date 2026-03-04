# Enums Documentation

All application enums are now organized by module in TypeScript files instead of database enums.

## Location
`src/common/enums/`

## Available Enums by Module

### 1. **User & Auth** (`user.enum.ts`)
- `UserRole` - customer, seller, admin, super_admin
- `Gender` - male, female, other, prefer_not_to_say
- `LoginStatus` - success, failed, blocked

### 2. **Seller** (`seller.enum.ts`)
- `VerificationStatus` - pending, under_review, approved, rejected, suspended
- `SellerDocType` - business_license, tax_certificate, id_card, cnic, bank_statement, address_proof
- `DocStatus` - pending, approved, rejected, expired
- `ViolationSeverity` - warning, minor, major, critical
- `ViolationPenalty` - warning, listing_suspended, account_suspended, fine, permanent_ban
- `PayoutFrequency` - daily, weekly, biweekly, monthly

### 3. **Product** (`product.enum.ts`)
- `ProductStatus` - draft, pending_review, active, inactive, out_of_stock, discontinued, rejected
- `AttributeType` - text, number, boolean, select, multi_select, color, date
- `WarrantyType` - brand, seller, marketplace, none

### 4. **Inventory** (`inventory.enum.ts`)
- `StockMovementType` - purchase, sale, return, adjustment_add, adjustment_subtract, etc.
- `ReservationStatus` - held, committed, released, expired
- `TransferStatus` - pending, approved, in_transit, completed, cancelled

### 5. **Order** (`order.enum.ts`)
- `OrderStatus` - pending_payment, pending, confirmed, processing, shipped, delivered, etc.
- `OrderItemStatus` - pending, confirmed, processing, shipped, delivered, cancelled, etc.

### 6. **Payment** (`payment.enum.ts`)
- `PaymentMethod` - cod, credit_card, debit_card, jazzcash, easypaisa, bank_transfer, wallet
- `PaymentStatus` - pending, authorized, captured, paid, failed, cancelled, refunded
- `RefundStatus` - requested, approved, rejected, processing, processed, failed
- `RefundMethod` - original_payment, wallet, bank_transfer, manual

### 7. **Return** (`return.enum.ts`)
- `ReturnType` - return, exchange
- `ReturnStatus` - requested, approved, rejected, item_shipped, inspecting, etc.
- `ReturnShipmentStatus` - pending_pickup, picked_up, in_transit, received, completed

### 8. **Dispute** (`dispute.enum.ts`)
- `DisputeType` - item_not_received, item_not_as_described, counterfeit, etc.
- `DisputeStatus` - open, under_review, escalated, resolved, closed
- `DisputeResolution` - refund_buyer, side_with_seller, partial_refund, etc.
- `DisputePriority` - low, medium, high, urgent

### 9. **Review** (`review.enum.ts`)
- `ModerationStatus` - pending, approved, rejected, flagged
- `ReportReason` - spam, inappropriate, fake_review, offensive, irrelevant

### 10. **Marketing** (`marketing.enum.ts`)
- `VoucherType` - percentage, fixed_amount, free_shipping, buy_x_get_y
- `VoucherScope` - all, specific_products, specific_categories, specific_brands
- `CampaignType` - seasonal, flash_sale, clearance, new_arrival, bundle_deal

### 11. **Shipping** (`shipping.enum.ts`)
- `ShipmentStatus` - pending, label_created, picked_up, in_transit, delivered, etc.
- `ShippingMethodType` - standard, express, same_day, next_day, economy, pickup

### 12. **Wallet** (`wallet.enum.ts`)
- `WalletTransactionType` - credit, debit, withdrawal, refund_credit, commission_deduction
- `WalletTransactionStatus` - pending, completed, failed, reversed

### 13. **Notification** (`notification.enum.ts`)
- `NotificationChannel` - in_app, email, sms, push
- `NotificationPriority` - low, normal, high, urgent

### 14. **Ticket** (`ticket.enum.ts`)
- `TicketStatus` - open, in_progress, awaiting_customer, escalated, resolved, closed
- `TicketPriority` - low, medium, high, urgent

### 15. **Loyalty** (`loyalty.enum.ts`)
- `LoyaltyTransactionType` - earned, redeemed, expired, adjusted, bonus
- `ReferralStatus` - pending, qualified, rewarded, expired
- `SubscriptionFrequency` - weekly, biweekly, monthly, bimonthly, quarterly
- `SubscriptionStatus` - active, paused, cancelled, expired

### 16. **Bulk Operations** (`bulk-operations.enum.ts`)
- `ImportJobType` - product_import, product_export, order_export, etc.
- `JobStatus` - pending, processing, completed, failed, cancelled
- `BulkOperationType` - price_update, stock_update, status_update, delete

### 17. **Audit** (`audit.enum.ts`)
- `AuditAction` - create, update, delete, login, logout, export, import, approve

### 18. **Checkout** (`checkout.enum.ts`)
- `CheckoutStep` - cart_review, address, shipping, payment, review, completed

### 19. **CMS** (`cms.enum.ts`)
- `RedirectType` - 301, 302, 307
- `TextDirection` - ltr, rtl
- `BannerPosition` - homepage_hero, homepage_mid, category_top, etc.
- `BannerLinkType` - product, category, brand, campaign, store, page

### 20. **Chat** (`chat.enum.ts`)
- `MessageType` - text, image, product_link, order_link, file, system
- `ConversationStatus` - active, archived, blocked

### 21. **Recommendation** (`recommendation.enum.ts`)
- `RecommendationType` - frequently_bought_together, similar_products, also_viewed

## Usage Examples

### Import Single Enum
```typescript
import { UserRole } from '@common/enums';

// Use in entity
@Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
role: UserRole;

// Use in validation
@IsEnum(UserRole)
role: UserRole;

// Use in code
if (user.role === UserRole.ADMIN) {
  // admin logic
}
```

### Import Multiple Enums
```typescript
import { 
  UserRole, 
  ProductStatus, 
  OrderStatus 
} from '@common/enums';
```

### Import from Specific File
```typescript
import { UserRole, Gender, LoginStatus } from '@common/enums/user.enum';
```

### Use in Entity
```typescript
import { Entity, Column } from 'typeorm';
import { OrderStatus, OrderItemStatus } from '@common/enums';

@Entity('orders')
export class Order {
  @Column({ 
    type: 'enum', 
    enum: OrderStatus, 
    default: OrderStatus.PENDING 
  })
  status: OrderStatus;
}
```

### Use in DTO
```typescript
import { IsEnum } from 'class-validator';
import { ProductStatus } from '@common/enums';

export class CreateProductDto {
  @IsEnum(ProductStatus)
  status: ProductStatus;
}
```

### Use in Service
```typescript
import { Injectable } from '@nestjs/common';
import { UserRole, OrderStatus } from '@common/enums';

@Injectable()
export class OrderService {
  async createOrder() {
    const order = {
      status: OrderStatus.PENDING,
      // ...
    };
    return order;
  }
}
```

## Benefits of TypeScript Enums over Database Enums

1. **Type Safety** - Full TypeScript type checking
2. **IDE Support** - Auto-completion and IntelliSense
3. **No Database Dependency** - Easier testing and mocking
4. **Refactoring** - Easy to rename and update
5. **Documentation** - Self-documenting code
6. **Reusability** - Can be shared across frontend and backend
7. **Performance** - No database enum lookups

## Migration Note

The database enum migration (`1700000000002-CreateEcommerceEnums.ts`) has been disabled. 
All enum values are now stored as strings in the database and validated using TypeScript enums.

## Path Alias

Use the `@common` path alias to import enums:
```typescript
import { UserRole } from '@common/enums';
```

This is configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@common/*": ["src/common/*"]
    }
  }
}
```
