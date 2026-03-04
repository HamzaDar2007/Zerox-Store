import type {
  OrderStatus,
  OrderItemStatus,
  ShipmentStatus,
  CheckoutStep,
} from './enums';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  storeId: string;
  status: OrderStatus;
  currencyCode: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  voucherId: string | null;
  voucherCode: string | null;
  shippingAddress: Record<string, unknown>;
  billingAddress: Record<string, unknown> | null;
  shippingMethod: string | null;
  paymentMethod: string | null;
  customerNotes: string | null;
  sellerNotes: string | null;
  internalNotes: string | null;
  isGift: boolean;
  giftMessage: string | null;
  giftWrapRequested: boolean;
  loyaltyPointsEarned: number;
  loyaltyPointsUsed: number;
  loyaltyDiscount: number;
  estimatedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  sourcePlatform: string;
  placedAt: string | null;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  items?: OrderItem[];
  statusHistory?: OrderStatusHistory[];
  shipments?: Shipment[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  productSnapshot: Record<string, unknown>;
  quantity: number;
  unitPrice: number;
  originalPrice: number | null;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: OrderItemStatus;
  isGift: boolean;
  fulfilledQuantity: number;
  returnedQuantity: number;
  refundedQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  previousStatus: OrderStatus | null;
  newStatus: OrderStatus;
  changedBy: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  shipmentNumber: string;
  carrierId: string | null;
  carrierName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  status: ShipmentStatus;
  shippingCost: number;
  weightKg: number | null;
  dimensions: Record<string, unknown> | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  estimatedDeliveryAt: string | null;
  deliveryAddress: Record<string, unknown>;
  deliveryInstructions: string | null;
  items?: ShipmentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentItem {
  id: string;
  shipmentId: string;
  orderItemId: string;
  quantity: number;
  createdAt: string;
}

export interface CheckoutSession {
  id: string;
  userId: string | null;
  cartId: string;
  sessionToken: string;
  step: CheckoutStep;
  shippingAddressId: string | null;
  billingAddressId: string | null;
  shippingMethodId: string | null;
  paymentMethod: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  loyaltyPointsUsed: number;
  loyaltyDiscount: number;
  giftWrapRequested: boolean;
  giftMessage: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── DTOs ───────────────────────────────────────────────────────────
export interface CreateOrderDto {
  cartId?: string;
  shippingAddressId: string;
  billingAddressId?: string;
  shippingMethodId?: string;
  paymentMethod: string;
  customerNotes?: string;
  isGift?: boolean;
  giftMessage?: string;
  giftWrapRequested?: boolean;
  loyaltyPointsUsed?: number;
  voucherCode?: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  notes?: string;
}

export interface CreateCheckoutDto {
  cartId: string;
  shippingAddressId?: string;
}

export interface UpdateCheckoutDto {
  step?: CheckoutStep;
  shippingAddressId?: string;
  billingAddressId?: string;
  shippingMethodId?: string;
  paymentMethod?: string;
  loyaltyPointsUsed?: number;
  giftWrapRequested?: boolean;
  giftMessage?: string;
}
