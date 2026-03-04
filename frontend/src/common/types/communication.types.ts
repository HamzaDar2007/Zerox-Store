import type {
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  ConversationStatus,
  MessageType,
  MessageSenderType,
} from './enums';

// ─── Notifications ──────────────────────────────────────────────────
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  status: NotificationStatus;
  readAt: string | null;
  sentAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface NotificationTemplate {
  id: string;
  code: string;
  name: string;
  type: string;
  channels: NotificationChannel[];
  subject: string | null;
  body: string | null;
  htmlBody: string | null;
  smsBody: string | null;
  pushTitle: string | null;
  pushBody: string | null;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  type: string;
  channel: NotificationChannel;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Chat ───────────────────────────────────────────────────────────
export interface Conversation {
  id: string;
  type: string | null;
  buyerId: string;
  sellerId: string;
  customerId: string | null;
  orderId: string | null;
  subject: string | null;
  status: ConversationStatus;
  lastMessageAt: string | null;
  customerUnreadCount: number;
  storeUnreadCount: number;
  messages?: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: MessageSenderType;
  type: MessageType;
  content: string;
  attachments: Record<string, unknown>[] | null;
  isRead: boolean;
  readAt: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── DTOs ───────────────────────────────────────────────────────────
export interface CreateConversationDto {
  sellerId: string;
  subject?: string;
  orderId?: string;
  message: string;
}

export interface SendMessageDto {
  content: string;
  type?: MessageType;
  attachments?: Record<string, unknown>[];
}

export interface UpdateNotificationPreferencesDto {
  preferences: { type: string; channel: NotificationChannel; isEnabled: boolean }[];
}
