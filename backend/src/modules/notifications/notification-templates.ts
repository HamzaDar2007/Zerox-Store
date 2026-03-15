/**
 * Global Notification Templates
 *
 * Centralized templates for all system notifications.
 * Each template defines the channel, type, title, body template, and optional action URL pattern.
 * Body templates use {{variable}} placeholders that get replaced at runtime.
 */

export interface NotificationTemplate {
  channel: string;
  type: string;
  title: string;
  body: string;
  actionUrl?: string;
}

export const NotificationTemplates: Record<string, NotificationTemplate> = {
  // ─── Auth ──────────────────────────────────────────────────────────
  WELCOME: {
    channel: 'in_app',
    type: 'auth.welcome',
    title: 'Welcome to LabVerse!',
    body: 'Hi {{userName}}, your account has been created successfully. Start exploring our marketplace!',
    actionUrl: '/dashboard',
  },
  PASSWORD_CHANGED: {
    channel: 'in_app',
    type: 'auth.password_changed',
    title: 'Password Changed',
    body: 'Your password was changed successfully. If you did not make this change, contact support immediately.',
    actionUrl: '/settings/security',
  },
  LOGIN_NEW_DEVICE: {
    channel: 'in_app',
    type: 'auth.new_device',
    title: 'New Login Detected',
    body: 'A new login was detected from {{ipAddress}}. If this was not you, please change your password.',
    actionUrl: '/settings/security',
  },

  // ─── Orders ────────────────────────────────────────────────────────
  ORDER_PLACED: {
    channel: 'in_app',
    type: 'order.placed',
    title: 'Order Placed Successfully',
    body: 'Your order #{{orderId}} has been placed. We will notify you when it ships.',
    actionUrl: '/orders/{{orderId}}',
  },
  ORDER_STATUS_UPDATED: {
    channel: 'in_app',
    type: 'order.status_updated',
    title: 'Order Status Updated',
    body: 'Your order #{{orderId}} status has been updated to "{{status}}".',
    actionUrl: '/orders/{{orderId}}',
  },
  ORDER_SHIPPED: {
    channel: 'in_app',
    type: 'order.shipped',
    title: 'Order Shipped',
    body: 'Your order #{{orderId}} has been shipped! Track your delivery for real-time updates.',
    actionUrl: '/orders/{{orderId}}/tracking',
  },
  ORDER_DELIVERED: {
    channel: 'in_app',
    type: 'order.delivered',
    title: 'Order Delivered',
    body: 'Your order #{{orderId}} has been delivered. We hope you enjoy your purchase!',
    actionUrl: '/orders/{{orderId}}',
  },

  // ─── Payments ──────────────────────────────────────────────────────
  PAYMENT_RECEIVED: {
    channel: 'in_app',
    type: 'payment.received',
    title: 'Payment Received',
    body: 'Payment of {{amount}} {{currency}} for order #{{orderId}} has been received.',
    actionUrl: '/orders/{{orderId}}',
  },
  PAYMENT_FAILED: {
    channel: 'in_app',
    type: 'payment.failed',
    title: 'Payment Failed',
    body: 'Payment for order #{{orderId}} failed. Please try again or use a different payment method.',
    actionUrl: '/orders/{{orderId}}/payment',
  },

  // ─── Products & Sellers ────────────────────────────────────────────
  PRODUCT_APPROVED: {
    channel: 'in_app',
    type: 'product.approved',
    title: 'Product Approved',
    body: 'Your product "{{productName}}" has been approved and is now live on the marketplace.',
    actionUrl: '/seller/products/{{productId}}',
  },
  NEW_REVIEW: {
    channel: 'in_app',
    type: 'review.new',
    title: 'New Review on Your Product',
    body: '{{reviewerName}} left a {{rating}}-star review on "{{productName}}".',
    actionUrl: '/seller/products/{{productId}}/reviews',
  },
  SELLER_APPROVED: {
    channel: 'in_app',
    type: 'seller.approved',
    title: 'Seller Account Approved',
    body: 'Your seller account has been approved. You can now start listing products!',
    actionUrl: '/seller/dashboard',
  },

  // ─── Inventory ─────────────────────────────────────────────────────
  LOW_STOCK: {
    channel: 'in_app',
    type: 'inventory.low_stock',
    title: 'Low Stock Alert',
    body: 'Product "{{productName}}" (SKU: {{sku}}) is running low with only {{quantity}} units left.',
    actionUrl: '/seller/inventory',
  },

  // ─── Returns & Refunds ─────────────────────────────────────────────
  RETURN_REQUESTED: {
    channel: 'in_app',
    type: 'return.requested',
    title: 'Return Request Submitted',
    body: 'Your return request for order #{{orderId}} has been submitted. We will review it shortly.',
    actionUrl: '/orders/{{orderId}}/returns',
  },
  RETURN_APPROVED: {
    channel: 'in_app',
    type: 'return.approved',
    title: 'Return Request Approved',
    body: 'Your return request for order #{{orderId}} has been approved. Please ship the items back.',
    actionUrl: '/orders/{{orderId}}/returns',
  },
  REFUND_PROCESSED: {
    channel: 'in_app',
    type: 'refund.processed',
    title: 'Refund Processed',
    body: 'Your refund of {{amount}} {{currency}} for order #{{orderId}} has been processed.',
    actionUrl: '/orders/{{orderId}}',
  },

  // ─── Subscriptions ─────────────────────────────────────────────────
  SUBSCRIPTION_CREATED: {
    channel: 'in_app',
    type: 'subscription.created',
    title: 'Subscription Activated',
    body: 'Your subscription to "{{planName}}" has been activated successfully.',
    actionUrl: '/subscriptions',
  },
  SUBSCRIPTION_CANCELLED: {
    channel: 'in_app',
    type: 'subscription.cancelled',
    title: 'Subscription Cancelled',
    body: 'Your subscription to "{{planName}}" has been cancelled.',
    actionUrl: '/subscriptions',
  },
  SUBSCRIPTION_RENEWAL: {
    channel: 'in_app',
    type: 'subscription.renewal',
    title: 'Subscription Renewed',
    body: 'Your subscription to "{{planName}}" has been renewed for another {{interval}}.',
    actionUrl: '/subscriptions',
  },

  // ─── Chat ──────────────────────────────────────────────────────────
  NEW_MESSAGE: {
    channel: 'in_app',
    type: 'chat.new_message',
    title: 'New Message',
    body: '{{senderName}} sent you a message: "{{preview}}"',
    actionUrl: '/chat/{{conversationId}}',
  },

  // ─── Admin ─────────────────────────────────────────────────────────
  USER_ROLE_CHANGED: {
    channel: 'in_app',
    type: 'admin.role_changed',
    title: 'Role Updated',
    body: 'Your account role has been updated to "{{roleName}}".',
    actionUrl: '/dashboard',
  },
  ACCOUNT_DEACTIVATED: {
    channel: 'in_app',
    type: 'admin.account_deactivated',
    title: 'Account Deactivated',
    body: 'Your account has been deactivated. Contact support for more information.',
  },
};

/**
 * Interpolate template variables with actual values.
 * Replaces {{key}} placeholders with values from the data object.
 */
export function renderTemplate(
  template: NotificationTemplate,
  data: Record<string, string | number>,
): {
  channel: string;
  type: string;
  title: string;
  body: string;
  actionUrl?: string;
} {
  const interpolate = (str: string) =>
    str.replace(/\{\{(\w+)\}\}/g, (_, key) => String(data[key] ?? ''));

  return {
    channel: template.channel,
    type: template.type,
    title: interpolate(template.title),
    body: interpolate(template.body),
    actionUrl: template.actionUrl ? interpolate(template.actionUrl) : undefined,
  };
}
