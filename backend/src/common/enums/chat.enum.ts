export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  PRODUCT_LINK = 'product_link',
  ORDER_LINK = 'order_link',
  FILE = 'file',
  SYSTEM = 'system',
}

export enum MessageSenderType {
  CUSTOMER = 'customer',
  SELLER = 'seller',
  SUPPORT = 'support',
  SYSTEM = 'system',
}

export enum ConversationType {
  CUSTOMER_SELLER = 'customer_seller',
  CUSTOMER_SUPPORT = 'customer_support',
  SELLER_SUPPORT = 'seller_support',
}

export enum ConversationStatus {
  OPEN = 'open',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  BLOCKED = 'blocked',
  CLOSED = 'closed',
}
