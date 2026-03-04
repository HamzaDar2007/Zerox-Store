export enum StockMovementType {
  PURCHASE = 'purchase',
  SALE = 'sale',
  RETURN = 'return',
  ADJUSTMENT_ADD = 'adjustment_add',
  ADJUSTMENT_SUBTRACT = 'adjustment_subtract',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  RESERVATION = 'reservation',
  RESERVATION_RELEASE = 'reservation_release',
  DAMAGE = 'damage',
  EXPIRED = 'expired',
}

export enum ReservationStatus {
  HELD = 'held',
  COMMITTED = 'committed',
  RELEASED = 'released',
  EXPIRED = 'expired',
}

export enum TransferStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  IN_TRANSIT = 'in_transit',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
