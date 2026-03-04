export enum ReturnType {
  RETURN = 'return',
  EXCHANGE = 'exchange',
}

export enum ReturnStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ITEM_SHIPPED = 'item_shipped',
  ITEM_RECEIVED = 'item_received',
  INSPECTING = 'inspecting',
  REFUND_PROCESSED = 'refund_processed',
  EXCHANGED = 'exchanged',
  CLOSED = 'closed',
  PENDING = 'pending',
  COMPLETED = 'completed',
}

export enum ReturnShipmentStatus {
  PENDING_PICKUP = 'pending_pickup',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  RECEIVED = 'received',
  INSPECTING = 'inspecting',
  COMPLETED = 'completed',
  PENDING = 'pending',
}

export enum ReturnResolution {
  REFUND = 'refund',
  EXCHANGE = 'exchange',
  REPAIR = 'repair',
  STORE_CREDIT = 'store_credit',
}

export enum ReturnShipmentDirection {
  CUSTOMER_TO_WAREHOUSE = 'customer_to_warehouse',
  WAREHOUSE_TO_CUSTOMER = 'warehouse_to_customer',
}
