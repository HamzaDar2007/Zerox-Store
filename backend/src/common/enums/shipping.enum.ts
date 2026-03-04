export enum ShipmentStatus {
  PENDING = 'pending',
  LABEL_CREATED = 'label_created',
  PICKED_UP = 'picked_up',
  DISPATCHED = 'dispatched',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED_DELIVERY = 'failed_delivery',
  RETURNED_TO_SENDER = 'returned_to_sender',
  SHIPPED = 'shipped',
}

export enum ShippingMethodType {
  STANDARD = 'standard',
  EXPRESS = 'express',
  SAME_DAY = 'same_day',
  NEXT_DAY = 'next_day',
  ECONOMY = 'economy',
  PICKUP = 'pickup',
  FREIGHT = 'freight',
}

export enum ShippingRateType {
  FLAT = 'flat',
  WEIGHT_BASED = 'weight_based',
  PRICE_BASED = 'price_based',
  ITEM_BASED = 'item_based',
  FREE = 'free',
}
