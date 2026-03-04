// ─── API ────────────────────────────────────────────────────────────────
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ─── Auth Storage Keys ──────────────────────────────────────────────────
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'labverse_access_token',
  REFRESH_TOKEN: 'labverse_refresh_token',
  USER: 'labverse_user',
} as const;

// ─── Pagination Defaults ────────────────────────────────────────────────
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const PAGE_SIZES = [5, 10, 20, 50, 100] as const;

// ─── App ────────────────────────────────────────────────────────────────
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'LabVerse';
export const APP_DESCRIPTION =
  import.meta.env.VITE_APP_DESCRIPTION ||
  'Multi-Vendor E-Commerce Marketplace';

// ─── Roles ──────────────────────────────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  SELLER: 'seller',
  CUSTOMER: 'customer',
  SUPPORT_AGENT: 'support_agent',
} as const;

// ─── Route Prefixes ─────────────────────────────────────────────────────
export const ROUTE_PREFIX = {
  CUSTOMER: '/',
  SELLER: '/seller',
  ADMIN: '/admin',
  SUPER_ADMIN: '/super-admin',
} as const;

// ─── Polling Intervals ──────────────────────────────────────────────────
export const CHAT_POLL_INTERVAL = 5000; // 5 seconds (REST-only chat)
export const NOTIFICATION_POLL_INTERVAL = 30000; // 30 seconds
