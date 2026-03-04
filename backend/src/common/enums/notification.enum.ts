export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationType {
  ORDER_STATUS = 'order_status',
  PAYMENT_STATUS = 'payment_status',
  SHIPPING_UPDATE = 'shipping_update',
  PROMOTION = 'promotion',
  REVIEW_REQUEST = 'review_request',
  PRICE_DROP = 'price_drop',
  BACK_IN_STOCK = 'back_in_stock',
  SECURITY_ALERT = 'security_alert',
  SYSTEM = 'system',
  CHAT_MESSAGE = 'chat_message',
  SUPPORT_TICKET = 'support_ticket',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}
