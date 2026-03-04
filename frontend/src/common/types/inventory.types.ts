import type {
  StockMovementType,
  ReservationStatus,
  TransferStatus,
} from './enums';

export interface Inventory {
  id: string;
  productId: string;
  productVariantId: string | null;
  warehouseId: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  lowStockThreshold: number;
  reorderPoint: number | null;
  reorderQuantity: number | null;
  lastRestockedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  sellerId: string | null;
  name: string;
  code: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  countryCode: string;
  latitude: number | null;
  longitude: number | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  isActive: boolean;
  isDefault: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  inventoryId: string;
  type: StockMovementType;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  costPerUnit: number | null;
  note: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface StockReservation {
  id: string;
  inventoryId: string;
  productId: string;
  orderId: string | null;
  cartId: string | null;
  quantity: number;
  status: ReservationStatus;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransfer {
  id: string;
  transferNumber: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  status: TransferStatus;
  note: string | null;
  initiatedBy: string;
  approvedBy: string | null;
  approvedAt: string | null;
  shippedAt: string | null;
  receivedAt: string | null;
  cancelledAt: string | null;
  items?: InventoryTransferItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryTransferItem {
  id: string;
  transferId: string;
  productId: string;
  productVariantId: string | null;
  quantityRequested: number;
  quantityShipped: number | null;
  quantityReceived: number | null;
}

// ─── DTOs ───────────────────────────────────────────────────────────
export interface UpdateInventoryDto {
  quantityOnHand?: number;
  lowStockThreshold?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
}

export interface CreateStockMovementDto {
  inventoryId: string;
  type: StockMovementType;
  quantity: number;
  note?: string;
  referenceType?: string;
  referenceId?: string;
  costPerUnit?: number;
}

export interface CreateWarehouseDto {
  name: string;
  code: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  isActive?: boolean;
  isDefault?: boolean;
  priority?: number;
}

export type UpdateWarehouseDto = Partial<CreateWarehouseDto>;

export interface CreateTransferDto {
  fromWarehouseId: string;
  toWarehouseId: string;
  note?: string;
  items: { productId: string; productVariantId?: string; quantityRequested: number }[];
}
