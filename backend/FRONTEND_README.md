# LabVerse E-Commerce Platform — Complete Frontend Development Guide

> **The ultimate reference for building the complete React frontend for the LabVerse E-Commerce platform.**
> A frontend developer can build the entire application from scratch using only this document.

---

## Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. System Architecture](#2-system-architecture)
- [3. Project Structure](#3-project-structure)
- [4. Prerequisites & Installation](#4-prerequisites--installation)
- [5. Backend API Integration Setup](#5-backend-api-integration-setup)
- [6. Authentication & Authorization Implementation](#6-authentication--authorization-implementation)
- [7. Complete Page & Component Reference — Every Portal](#7-complete-page--component-reference--every-portal)
  - [7.1 Portal 1 — Customer-Facing Store](#71-portal-1--customer-facing-store)
  - [7.2 Portal 2 — Seller Dashboard](#72-portal-2--seller-dashboard)
  - [7.3 Portal 3 — Admin Panel](#73-portal-3--admin-panel)
  - [7.4 Portal 4 — Super Admin Panel](#74-portal-4--super-admin-panel)
- [8. Complete API Service Layer Reference](#8-complete-api-service-layer-reference)
- [9. State Management Guide](#9-state-management-guide)
- [10. Routing Structure](#10-routing-structure)
- [11. Reusable Components Library](#11-reusable-components-library)
- [12. Form Validation Reference](#12-form-validation-reference)
- [13. Complete Business Flow Implementations](#13-complete-business-flow-implementations)
- [14. Error Handling & Loading States](#14-error-handling--loading-states)
- [15. Security Best Practices](#15-security-best-practices)
- [16. Performance Optimization](#16-performance-optimization)
- [17. Deployment](#17-deployment)

---

## 1. Project Overview

### Project Name

**LabVerse E-Commerce Frontend**

### Description

A comprehensive, multi-portal React frontend for the LabVerse E-Commerce platform. The application provides four distinct portals:

1. **Customer-Facing Store** — Browse products, place orders, track shipments, manage reviews, loyalty, and wishlists.
2. **Seller Dashboard** — Manage products, inventory, orders, stores, wallet, returns, and disputes.
3. **Admin Panel** — Moderate users, products, orders, marketing, CMS, SEO, shipping, tax, tickets, and more.
4. **Super Admin Panel** — Full system control including role/permission management, system settings, feature flags, and audit logs.

### Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool |
| React Router | 6.x | Client-side routing |
| Zustand | 4.x | Global state management |
| TanStack React Query | 5.x | Server state, caching, background refetch |
| Axios | 1.x | HTTP client |
| React Hook Form | 7.x | Form state management |
| Zod | 3.x | Schema validation |
| TailwindCSS | 3.x | Utility-first CSS |
| shadcn/ui | latest | Component library (Radix UI primitives + Tailwind) |
| Lucide React | latest | Icon library |
| date-fns | 3.x | Date utilities |
| Recharts | 2.x | Dashboard charts |
| Sonner | latest | Toast notifications |

### Backend Connection

The frontend connects to the LabVerse NestJS backend API via REST. The backend runs on `http://localhost:3001` in development (configurable via environment variable). All API responses are wrapped in a standard envelope:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2026-02-26T12:00:00.000Z"
}
```

Authentication uses JWT Bearer tokens. The `Authorization: Bearer <accessToken>` header is attached to authenticated requests via an Axios interceptor. Token refresh is handled automatically.

---

## 2. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LabVerse Frontend                         │
├───────────┬───────────┬─────────────┬──────────────────────┤
│ Customer  │  Seller   │   Admin     │   Super Admin        │
│ Store     │ Dashboard │   Panel     │   Panel              │
├───────────┴───────────┴─────────────┴──────────────────────┤
│                  Shared Components                          │
│        (UI Kit, Forms, Tables, Modals, Charts)              │
├────────────────────────────────────────────────────────────┤
│                   Service Layer (Axios)                     │
│   authService, productService, orderService, etc.          │
├────────────────────────────────────────────────────────────┤
│              State Management (Zustand + React Query)       │
│   authStore, cartStore, notificationStore, etc.            │
├────────────────────────────────────────────────────────────┤
│                 React Router v6                             │
│   Role-based route guards, nested layouts, lazy loading    │
└────────────────────────────────────────────────────────────┘
                           │
                   REST API (Axios)
                           │
┌────────────────────────────────────────────────────────────┐
│              LabVerse NestJS Backend API                    │
│              http://localhost:3001                          │
│              Swagger: /api/docs                            │
└────────────────────────────────────────────────────────────┘
```

### Portal Separation

Each portal is a separate route namespace with its own layout:

| Portal | Route Prefix | Access |
|---|---|---|
| Customer Store | `/` | Public + `customer` role |
| Seller Dashboard | `/seller/*` | `seller` role |
| Admin Panel | `/admin/*` | `admin` role |
| Super Admin Panel | `/super-admin/*` | `super_admin` role |

### Authentication & Token Flow

1. User logs in → backend returns `accessToken` + `refreshToken`.
2. `accessToken` is stored in memory (Zustand store). `refreshToken` is stored in `localStorage` (or `httpOnly` cookie in production).
3. Every API call attaches `Authorization: Bearer <accessToken>`.
4. If a 401 response is received, the Axios interceptor calls `POST /auth/refresh` with the `refreshToken`, stores the new tokens, and retries the original request.
5. On logout, `POST /auth/logout` is called with the `refreshToken`, and all local state is cleared.

### User Roles (from backend `UserRole` enum)

```typescript
enum UserRole {
  CUSTOMER = 'customer',
  SELLER = 'seller',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}
```

Both `admin` and `super_admin` bypass all permission checks on the backend. For `customer` and `seller`, fine-grained permissions apply.

---

## 3. Project Structure

```
labverse-frontend/
├── public/
│   ├── favicon.ico
│   └── assets/
├── src/
│   ├── main.tsx                        # App entry point
│   ├── App.tsx                         # Root component with Router
│   ├── vite-env.d.ts                   # Vite type declarations
│   │
│   ├── config/
│   │   ├── env.ts                      # Environment variables
│   │   └── constants.ts                # App-wide constants
│   │
│   ├── lib/
│   │   ├── axios.ts                    # Axios instance with interceptors
│   │   ├── query-client.ts             # React Query client config
│   │   └── utils.ts                    # cn() and general utilities
│   │
│   ├── types/
│   │   ├── api.types.ts                # API response wrapper types
│   │   ├── auth.types.ts               # Auth related types
│   │   ├── user.types.ts               # User, Address types
│   │   ├── product.types.ts            # Product, Variant, Image types
│   │   ├── category.types.ts           # Category, Brand, Attribute types
│   │   ├── seller.types.ts             # Seller, Store types
│   │   ├── order.types.ts              # Order, OrderItem, Shipment types
│   │   ├── payment.types.ts            # Payment, Refund types
│   │   ├── cart.types.ts               # Cart, CartItem, Checkout types
│   │   ├── review.types.ts             # Review types
│   │   ├── marketing.types.ts          # Campaign, FlashSale, Voucher types
│   │   ├── shipping.types.ts           # Zone, Method, Carrier, Rate types
│   │   ├── tax.types.ts                # TaxZone, TaxRate, TaxClass types
│   │   ├── inventory.types.ts          # Warehouse, Inventory types
│   │   ├── loyalty.types.ts            # Points, Tier, Referral types
│   │   ├── notification.types.ts       # Notification types
│   │   ├── dispute.types.ts            # Dispute types
│   │   ├── return.types.ts             # Return types
│   │   ├── ticket.types.ts             # Ticket types
│   │   ├── chat.types.ts               # Conversation, Message types
│   │   ├── cms.types.ts                # Page, Banner types
│   │   ├── seo.types.ts                # SEO Metadata, Redirect types
│   │   ├── bundle.types.ts             # Bundle types
│   │   ├── subscription.types.ts       # Subscription types
│   │   ├── i18n.types.ts               # Language, Currency types
│   │   ├── system.types.ts             # Settings, FeatureFlag types
│   │   ├── operations.types.ts         # BulkOp, ImportExport types
│   │   ├── audit.types.ts              # AuditLog, ActivityLog types
│   │   └── enums.ts                    # All enum mirrors
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── role.service.ts
│   │   ├── permission.service.ts
│   │   ├── role-permission.service.ts
│   │   ├── category.service.ts
│   │   ├── brand.service.ts
│   │   ├── attribute.service.ts
│   │   ├── seller.service.ts
│   │   ├── store.service.ts
│   │   ├── product.service.ts
│   │   ├── inventory.service.ts
│   │   ├── warehouse.service.ts
│   │   ├── cart.service.ts
│   │   ├── wishlist.service.ts
│   │   ├── checkout.service.ts
│   │   ├── order.service.ts
│   │   ├── shipment.service.ts
│   │   ├── payment.service.ts
│   │   ├── refund.service.ts
│   │   ├── payment-method.service.ts
│   │   ├── return.service.ts
│   │   ├── dispute.service.ts
│   │   ├── review.service.ts
│   │   ├── marketing.service.ts
│   │   ├── loyalty.service.ts
│   │   ├── shipping.service.ts
│   │   ├── tax.service.ts
│   │   ├── bundle.service.ts
│   │   ├── notification.service.ts
│   │   ├── ticket.service.ts
│   │   ├── chat.service.ts
│   │   ├── cms.service.ts
│   │   ├── seo.service.ts
│   │   ├── subscription.service.ts
│   │   ├── search.service.ts
│   │   ├── i18n.service.ts
│   │   ├── audit.service.ts
│   │   ├── operations.service.ts
│   │   └── system.service.ts
│   │
│   ├── stores/
│   │   ├── auth.store.ts               # Auth state (user, tokens)
│   │   ├── cart.store.ts               # Cart state
│   │   ├── wishlist.store.ts           # Wishlist state
│   │   └── notification.store.ts       # Notification count
│   │
│   ├── hooks/
│   │   ├── use-auth.ts                 # Auth hook wrapping store
│   │   ├── use-permissions.ts          # Permission check hook
│   │   ├── use-debounce.ts             # Debounce hook
│   │   ├── use-pagination.ts           # Pagination state hook
│   │   └── use-media-query.ts          # Responsive hook
│   │
│   ├── components/
│   │   ├── ui/                         # shadcn/ui primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── checkbox.tsx
│   │   │   └── ...
│   │   ├── shared/
│   │   │   ├── DataTable.tsx           # Sortable, filterable data table
│   │   │   ├── Pagination.tsx          # Page controls
│   │   │   ├── LoadingSpinner.tsx      # Spinner component
│   │   │   ├── EmptyState.tsx          # No data display
│   │   │   ├── ErrorBoundary.tsx       # Error boundary wrapper
│   │   │   ├── ConfirmDialog.tsx       # Confirm action modal
│   │   │   ├── StatusBadge.tsx         # Color-coded status display
│   │   │   ├── PriceDisplay.tsx        # Currency formatted price
│   │   │   ├── StarRating.tsx          # Star rating input/display
│   │   │   ├── ImageGallery.tsx        # Product image gallery
│   │   │   ├── FileUpload.tsx          # File upload component
│   │   │   ├── Breadcrumb.tsx          # Breadcrumb navigation
│   │   │   ├── SearchInput.tsx         # Search with debounce
│   │   │   ├── DatePicker.tsx          # Date selection
│   │   │   ├── RichTextEditor.tsx      # WYSIWYG editor
│   │   │   └── FormField.tsx           # Form field wrapper
│   │   ├── layouts/
│   │   │   ├── CustomerLayout.tsx      # Store layout (header, footer)
│   │   │   ├── SellerLayout.tsx        # Seller sidebar layout
│   │   │   ├── AdminLayout.tsx         # Admin sidebar layout
│   │   │   ├── SuperAdminLayout.tsx    # Super admin layout
│   │   │   └── AuthLayout.tsx          # Login/register layout
│   │   └── guards/
│   │       ├── ProtectedRoute.tsx      # Auth guard
│   │       ├── RoleGuard.tsx           # Role-based guard
│   │       └── PermissionGuard.tsx     # Permission-based guard
│   │
│   └── pages/
│       ├── auth/
│       │   ├── LoginPage.tsx
│       │   ├── RegisterPage.tsx
│       │   ├── ForgotPasswordPage.tsx
│       │   └── ResetPasswordPage.tsx
│       ├── customer/
│       │   ├── HomePage.tsx
│       │   ├── ProductListPage.tsx
│       │   ├── ProductDetailPage.tsx
│       │   ├── CategoryPage.tsx
│       │   ├── BrandPage.tsx
│       │   ├── SearchResultsPage.tsx
│       │   ├── CartPage.tsx
│       │   ├── WishlistPage.tsx
│       │   ├── CheckoutPage.tsx
│       │   ├── OrderConfirmationPage.tsx
│       │   ├── MyOrdersPage.tsx
│       │   ├── OrderDetailPage.tsx
│       │   ├── ProfilePage.tsx
│       │   ├── AddressesPage.tsx
│       │   ├── MyReviewsPage.tsx
│       │   ├── MyReturnsPage.tsx
│       │   ├── MyDisputesPage.tsx
│       │   ├── LoyaltyPage.tsx
│       │   ├── ReferralsPage.tsx
│       │   ├── NotificationsPage.tsx
│       │   ├── TicketsPage.tsx
│       │   ├── ChatPage.tsx
│       │   └── SubscriptionsPage.tsx
│       ├── seller/
│       │   ├── DashboardPage.tsx
│       │   ├── StoreManagementPage.tsx
│       │   ├── ProductsPage.tsx
│       │   ├── ProductFormPage.tsx
│       │   ├── VariantsPage.tsx
│       │   ├── ImagesPage.tsx
│       │   ├── InventoryPage.tsx
│       │   ├── OrdersPage.tsx
│       │   ├── ShipmentsPage.tsx
│       │   ├── ReturnsPage.tsx
│       │   ├── DisputesPage.tsx
│       │   ├── ReviewsPage.tsx
│       │   ├── WalletPage.tsx
│       │   ├── DocumentsPage.tsx
│       │   └── SettingsPage.tsx
│       ├── admin/
│       │   ├── DashboardPage.tsx
│       │   ├── UsersPage.tsx
│       │   ├── SellersPage.tsx
│       │   ├── CategoriesPage.tsx
│       │   ├── BrandsPage.tsx
│       │   ├── AttributesPage.tsx
│       │   ├── ProductsPage.tsx
│       │   ├── OrdersPage.tsx
│       │   ├── PaymentsPage.tsx
│       │   ├── RefundsPage.tsx
│       │   ├── ReturnsPage.tsx
│       │   ├── DisputesPage.tsx
│       │   ├── ReviewsPage.tsx
│       │   ├── CampaignsPage.tsx
│       │   ├── FlashSalesPage.tsx
│       │   ├── VouchersPage.tsx
│       │   ├── ShippingPage.tsx
│       │   ├── TaxPage.tsx
│       │   ├── LoyaltyTiersPage.tsx
│       │   ├── NotificationsPage.tsx
│       │   ├── TicketsPage.tsx
│       │   ├── CmsPage.tsx
│       │   ├── SeoPage.tsx
│       │   ├── SubscriptionsPage.tsx
│       │   ├── BundlesPage.tsx
│       │   └── AuditLogsPage.tsx
│       └── super-admin/
│           ├── RolesPage.tsx
│           ├── PermissionsPage.tsx
│           ├── RolePermissionsPage.tsx
│           ├── SystemSettingsPage.tsx
│           ├── FeatureFlagsPage.tsx
│           ├── OperationsPage.tsx
│           └── HealthPage.tsx
├── .env
├── .env.production
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── vite.config.ts
└── components.json                     # shadcn/ui config
```

---

## 4. Prerequisites & Installation

### Required Tools

| Tool | Version | Purpose |
|---|---|---|
| Node.js | ≥ 18.x | Runtime |
| npm or pnpm | ≥ 9.x / ≥ 8.x | Package manager |
| Git | Latest | Version control |

### Setup Instructions

```bash
# 1. Create the Vite project
npm create vite@latest labverse-frontend -- --template react-ts
cd labverse-frontend

# 2. Install core dependencies
npm install react-router-dom@6 axios zustand @tanstack/react-query \
  react-hook-form @hookform/resolvers zod \
  date-fns recharts sonner lucide-react clsx tailwind-merge

# 3. Install dev dependencies
npm install -D tailwindcss postcss autoprefixer @types/node

# 4. Initialize TailwindCSS
npx tailwindcss init -p

# 5. Initialize shadcn/ui
npx shadcn-ui@latest init

# 6. Add shadcn/ui components
npx shadcn-ui@latest add button input select textarea dialog \
  dropdown-menu table badge card avatar tabs sheet skeleton \
  separator switch checkbox label toast popover command
```

### Environment Variables

Create `.env` in the project root:

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_NAME=LabVerse
VITE_APP_VERSION=1.0.0
```

`src/config/env.ts`:

```typescript
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'LabVerse',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  IS_DEV: import.meta.env.DEV,
} as const;
```

---

## 5. Backend API Integration Setup

### Axios Instance with Interceptors

`src/lib/axios.ts`:

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '@/config/env';
import { useAuthStore } from '@/stores/auth.store';

const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor — attach Bearer token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — unwrap envelope + handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // Unwrap the standard backend response envelope
    // Backend wraps all responses as: { success, message, data, timestamp }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 Unauthorized → attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${ENV.API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken =
          data.data?.accessToken || data.data?.access_token;
        const newRefreshToken =
          data.data?.refreshToken || data.data?.refresh_token;

        useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### API Response Types

`src/types/api.types.ts`:

```typescript
/** Standard backend response envelope */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/** Paginated response data */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Backend validation error structure */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

/** Generic query params for list endpoints */
export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
```

### Helper to extract data from API responses

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AxiosResponse } from 'axios';
import { ApiResponse } from '@/types/api.types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Extract `data` from the standard backend envelope */
export function unwrap<T>(response: AxiosResponse<ApiResponse<T>>): T {
  return response.data.data;
}

/** Extract error message from AxiosError */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string | string[] } } };
    const msg = axiosError.response?.data?.message;
    if (Array.isArray(msg)) return msg[0];
    if (typeof msg === 'string') return msg;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}
```

### React Query Client Configuration

`src/lib/query-client.ts`:

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutes
      gcTime: 10 * 60 * 1000,        // 10 minutes garbage collection
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

---

## 6. Authentication & Authorization Implementation

### Auth Store (Zustand)

`src/stores/auth.store.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string; // 'customer' | 'seller' | 'admin' | 'super_admin'
  phone?: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),

      setTokens: (accessToken, refreshToken) =>
        set((state) => ({
          accessToken,
          refreshToken: refreshToken ?? state.refreshToken,
        })),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'labverse-auth',
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
```

### Auth Service

`src/services/auth.service.ts`:

```typescript
import api from '@/lib/axios';
import { ApiResponse } from '@/types/api.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  access_token?: string;
  refreshToken: string;
  refresh_token?: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
  };
}

const authService = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<ApiResponse<AuthResponse>>('/auth/register', data),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken }),

  logout: (refreshToken: string) =>
    api.post<ApiResponse<void>>('/auth/logout', { refreshToken }),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<void>>('/auth/password-forgot', { email }),

  resetPassword: (token: string, password: string) =>
    api.post<ApiResponse<void>>('/auth/reset-password', { token, password }),
};

export default authService;
```

### Login Flow Implementation

```typescript
// In LoginPage.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import authService, { LoginRequest } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (res) => {
      const d = res.data.data;
      const accessToken = d.accessToken || d.access_token!;
      const refreshToken = d.refreshToken || d.refresh_token!;
      setAuth(d.user, accessToken, refreshToken);
      toast.success('Login successful');

      // Route based on role
      switch (d.user.role) {
        case 'seller':    navigate('/seller'); break;
        case 'admin':     navigate('/admin'); break;
        case 'super_admin': navigate('/super-admin'); break;
        default:          navigate('/'); break;
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return (/* JSX form */);
}
```

### Protected Route Guard

`src/components/guards/ProtectedRoute.tsx`:

```typescript
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ?? <Outlet />;
}
```

### Permission-Based UI Rendering

`src/hooks/use-permissions.ts`:

```typescript
import { useAuthStore } from '@/stores/auth.store';

export function usePermissions() {
  const user = useAuthStore((s) => s.user);

  const hasRole = (role: string) => user?.role === role;

  const isAdmin = () =>
    user?.role === 'admin' || user?.role === 'super_admin';

  const isSuperAdmin = () => user?.role === 'super_admin';

  const canAccess = (requiredRoles: string[]) =>
    user ? requiredRoles.includes(user.role) : false;

  return { user, hasRole, isAdmin, isSuperAdmin, canAccess };
}
```

Usage in components:

```tsx
const { isAdmin } = usePermissions();

return (
  <>
    {isAdmin() && <Button onClick={handleDelete}>Delete User</Button>}
  </>
);
```

---

## 7. Complete Page & Component Reference — Every Portal

### 7.1 Portal 1 — Customer-Facing Store

#### 7.1.1 Home Page

| Property | Details |
|---|---|
| **Route** | `/` |
| **Access** | Public |
| **Purpose** | Landing page with featured products, flash sales, categories, banners |
| **Endpoints** | `GET /cms/banners/active/homepage_hero`, `GET /cms/banners/active/homepage_mid`, `GET /marketing/flash-sales/active`, `GET /products?limit=12`, `GET /categories/root`, `GET /bundles/active` |
| **Components** | Hero banner carousel, category grid, product cards, flash sale countdown, bundle showcase |
| **States** | Loading skeletons, empty states for each section |

#### 7.1.2 Product Listing Page

| Property | Details |
|---|---|
| **Route** | `/products`, `/categories/:slug`, `/brands/:slug` |
| **Access** | Public |
| **Purpose** | Browse, filter, sort, and search products |
| **Endpoints** | `GET /products?categoryId=&brandId=&status=active&page=&limit=`, `GET /categories`, `GET /brands`, `GET /attributes` |
| **Components** | Filter sidebar (category, brand, price range, attributes), product grid/list toggle, sort dropdown, pagination, product cards |
| **Query Params** | `categoryId`, `brandId`, `sellerId`, `status`, `page`, `limit` |
| **States** | Loading grid skeletons, empty "No products found" state |

#### 7.1.3 Product Detail Page

| Property | Details |
|---|---|
| **Route** | `/products/:slug` |
| **Access** | Public |
| **Purpose** | Display full product details with images, variants, reviews, Q&A |
| **Endpoints** | `GET /products/slug/:slug`, `GET /products/:id/variants`, `GET /products/:id/questions`, `GET /products/:id/price-history`, `GET /reviews?productId=:id`, `GET /reviews/product/:id/summary`, `GET /search/recommendations?productId=:id` |
| **Components** | Image gallery, variant selector, add to cart form, price display, stock indicator, star rating summary, review list, Q&A section, recommendation carousel, add to wishlist button, add to compare button |
| **Actions** | Add to cart (`POST /cart/items`), add to wishlist (`POST /wishlist`), ask question (`POST /products/:id/questions`), add to compare (`POST /search/compare/:productId`) |
| **Form Fields** | Quantity (number, min 1), variant selection |

#### 7.1.4 Cart Page

| Property | Details |
|---|---|
| **Route** | `/cart` |
| **Access** | Authenticated (customer) |
| **Purpose** | View and manage cart items |
| **Endpoints** | `GET /cart`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id`, `DELETE /cart` (clear) |
| **Components** | Cart item list (image, name, price, quantity controls, remove button), cart summary (subtotal, shipping estimate, total), proceed to checkout button |
| **Actions** | Update quantity (`PATCH /cart/items/:id` with `{ quantity }`), remove item (`DELETE /cart/items/:id`), clear cart (`DELETE /cart`) |

#### 7.1.5 Wishlist Page

| Property | Details |
|---|---|
| **Route** | `/wishlist` |
| **Access** | Authenticated (customer) |
| **Purpose** | View saved products |
| **Endpoints** | `GET /wishlist`, `DELETE /wishlist/:productId`, `POST /cart/items` |
| **Components** | Product grid with remove and "move to cart" buttons |
| **Actions** | Remove from wishlist (`DELETE /wishlist/:productId`), add to cart (`POST /cart/items`) |

#### 7.1.6 Checkout Page

| Property | Details |
|---|---|
| **Route** | `/checkout` |
| **Access** | Authenticated (customer) |
| **Purpose** | Multi-step checkout: address → shipping → payment → review → confirm |
| **Endpoints** | `POST /checkout/session`, `PATCH /checkout/session/:id`, `POST /checkout/session/:id/complete`, `POST /shipping/calculate`, `POST /tax/calculate`, `POST /marketing/vouchers/validate`, `POST /marketing/vouchers/apply`, `GET /payment-methods`, `GET /shipping/slots` |
| **Components** | Step indicator, address form, shipping method selector, payment method selector, voucher code input, order summary, place order button |
| **Form Fields (Address)** | `fullName` (string, required), `phone` (string, required), `country` (string, required), `city` (string, required), `province` (string), `streetAddress` (string, required) |
| **States** | Step-based loading, checkout session creation, voucher validation, payment processing |

#### 7.1.7 Order Confirmation Page

| Property | Details |
|---|---|
| **Route** | `/orders/:id/confirmation` |
| **Access** | Authenticated (customer) |
| **Endpoints** | `GET /orders/:id` |
| **Components** | Order number, status badge, order items summary, shipping address, payment summary |

#### 7.1.8 My Orders Page

| Property | Details |
|---|---|
| **Route** | `/my-orders` |
| **Access** | Authenticated (customer) |
| **Endpoints** | `GET /orders/my-orders?page=&limit=` |
| **Components** | Order list with status badges, order number, date, total, items preview, pagination |
| **Actions** | View detail, cancel order (`POST /orders/:id/cancel` with `{ reason }`) |

#### 7.1.9 Order Detail Page

| Property | Details |
|---|---|
| **Route** | `/my-orders/:id` |
| **Access** | Authenticated (customer) |
| **Endpoints** | `GET /orders/:id`, `GET /orders/:id/status-history`, `GET /orders/:id/shipments`, `GET /shipments/track/:trackingNumber` |
| **Components** | Order status timeline, order items table, shipping address, payment info, shipment tracking, action buttons (return, dispute) |
| **Actions** | Create return (`POST /returns`), create dispute (`POST /disputes`), track shipment |

#### 7.1.10 My Profile Page

| Property | Details |
|---|---|
| **Route** | `/profile` |
| **Access** | Authenticated |
| **Endpoints** | `GET /users/me`, `PATCH /users/:id` |
| **Components** | Profile form (name, email, phone, gender, date of birth) |
| **Form Fields** | `name` (string, max 100), `phone` (string, max 20), `gender` (enum: male, female, other, prefer_not_to_say), `dateOfBirth` (ISO date string) |

#### 7.1.11 My Addresses Page

| Property | Details |
|---|---|
| **Route** | `/addresses` |
| **Access** | Authenticated |
| **Endpoints** | `GET /users/me` (addresses included), managed via user update |
| **Components** | Address card list, add/edit address modal |

#### 7.1.12 My Reviews Page

| Property | Details |
|---|---|
| **Route** | `/my-reviews` |
| **Access** | Authenticated |
| **Endpoints** | `GET /reviews?userId=:myId`, `PATCH /reviews/:id`, `DELETE /reviews/:id` |
| **Components** | Review list with product info, star rating, edit/delete buttons |

#### 7.1.13 My Returns Page

| Property | Details |
|---|---|
| **Route** | `/my-returns` |
| **Access** | Authenticated |
| **Endpoints** | `GET /returns?userId=:myId`, `POST /returns` |
| **Components** | Return request list, create return modal |
| **Form Fields (Create Return)** | `orderId` (UUID, required), `orderItemId` (UUID, required), `type` (enum: return, exchange), `quantity` (number, required), `reasonDetails` (string) |

#### 7.1.14 My Disputes Page

| Property | Details |
|---|---|
| **Route** | `/my-disputes` |
| **Access** | Authenticated |
| **Endpoints** | `GET /disputes?customerId=:myId`, `POST /disputes`, `GET /disputes/:id/messages`, `POST /disputes/:id/messages`, `POST /disputes/:id/evidence` |
| **Components** | Dispute list, dispute detail with message thread, evidence upload |
| **Form Fields (Create Dispute)** | `orderId` (UUID, required), `type` (enum: item_not_received, item_not_as_described, counterfeit, seller_not_responding, wrong_item, damaged_item, missing_parts, other), `subject` (string, required), `description` (string, required) |

#### 7.1.15 Loyalty Points Page

| Property | Details |
|---|---|
| **Route** | `/loyalty` |
| **Access** | Authenticated |
| **Endpoints** | `GET /loyalty/points`, `GET /loyalty/transactions?page=&limit=`, `GET /loyalty/tiers`, `POST /loyalty/points/redeem` |
| **Components** | Points balance card, current tier badge, tier progress bar, transaction history table, redeem points form |

#### 7.1.16 Referrals Page

| Property | Details |
|---|---|
| **Route** | `/referrals` |
| **Access** | Authenticated |
| **Endpoints** | `GET /loyalty/referral-code`, `GET /loyalty/referrals`, `POST /loyalty/referral/apply` |
| **Components** | Referral code display with copy button, referral stats, apply referral code form |

#### 7.1.17 Notifications Page

| Property | Details |
|---|---|
| **Route** | `/notifications` |
| **Access** | Authenticated |
| **Endpoints** | `GET /notifications?page=&limit=&isRead=&type=`, `GET /notifications/unread-count`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`, `DELETE /notifications/:id` |
| **Components** | Notification list with type icons, mark as read, mark all read, delete, filter by type/read status |

#### 7.1.18 Support Tickets Page

| Property | Details |
|---|---|
| **Route** | `/tickets` |
| **Access** | Authenticated |
| **Endpoints** | `GET /tickets/my-tickets?page=&limit=`, `POST /tickets`, `GET /tickets/:id`, `POST /tickets/:id/messages`, `GET /tickets/:id/messages`, `GET /tickets/categories/all` |
| **Components** | Ticket list, create ticket modal, ticket detail with message thread |
| **Form Fields (Create Ticket)** | `subject` (string, required), `description` (string, required), `priority` (enum: low, medium, high, urgent), `categoryId` (UUID, optional) |

#### 7.1.19 Chat Page

| Property | Details |
|---|---|
| **Route** | `/chat` |
| **Access** | Authenticated |
| **Endpoints** | `GET /chat/conversations`, `GET /chat/conversations/:id`, `GET /chat/conversations/:id/messages?page=&limit=`, `POST /chat/conversations`, `POST /chat/conversations/:id/messages`, `POST /chat/conversations/:id/read`, `GET /chat/unread-count` |
| **Components** | Conversation list sidebar, message thread, message input, unread badge |

#### 7.1.20 Subscriptions Page

| Property | Details |
|---|---|
| **Route** | `/subscriptions` |
| **Access** | Authenticated |
| **Endpoints** | `GET /subscriptions/my-subscriptions`, `POST /subscriptions`, `PATCH /subscriptions/:id`, `POST /subscriptions/:id/cancel`, `POST /subscriptions/:id/pause`, `POST /subscriptions/:id/resume`, `GET /subscriptions/:id/orders` |
| **Components** | Subscription cards, create subscription form, status actions (pause/resume/cancel) |

#### 7.1.21 Auth Pages

| Page | Route | Endpoints | Form Fields & Validation |
|---|---|---|---|
| Login | `/login` | `POST /auth/login` | `email` (email, required, max 255), `password` (string, required) |
| Register | `/register` | `POST /auth/register` | `name` (string, required, max 100), `email` (email, required, max 150), `password` (string, min 8, max 128, must contain uppercase + lowercase + digit), `phone` (string, optional, max 20) |
| Forgot Password | `/forgot-password` | `POST /auth/password-forgot` | `email` (email, required, max 255) |
| Reset Password | `/reset-password` | `POST /auth/reset-password` | `token` (string, required), `password` (string, min 8, max 128, must contain uppercase + lowercase + digit) |

---

### 7.2 Portal 2 — Seller Dashboard

#### 7.2.1 Seller Dashboard Overview

| Property | Details |
|---|---|
| **Route** | `/seller` |
| **Access** | `seller` role |
| **Purpose** | Sales overview, pending orders, revenue charts |
| **Endpoints** | `GET /orders?sellerId=:mySellerId`, `GET /products?sellerId=:mySellerId`, `GET /sellers/:id/wallet` |
| **Components** | KPI cards (total orders, revenue, products, pending orders), sales chart, recent orders table, top products |

#### 7.2.2 Store Management

| Property | Details |
|---|---|
| **Route** | `/seller/store` |
| **Access** | `seller` role |
| **Endpoints** | `GET /stores/:id`, `PATCH /stores/:id`, `POST /sellers/:sellerId/stores` |
| **Components** | Store details form, store followers count |
| **Form Fields** | `name` (string, required), `slug` (string, required), `description` (string), `logo` (string/URL) |

#### 7.2.3 Product Management

| Property | Details |
|---|---|
| **Route** | `/seller/products` |
| **Access** | `seller` role |
| **Endpoints** | `GET /products?sellerId=:mySellerId&page=&limit=`, `POST /products`, `PATCH /products/:id`, `DELETE /products/:id`, `PATCH /products/:id/status` |
| **Components** | Product data table, create/edit product form, status toggle |
| **Form Fields (Create Product)** | `name` (string, required), `slug` (string, required), `description` (string, required), `price` (number, required), `stock` (number), `categoryId` (UUID, required), `brandId` (UUID), `sellerId` (UUID, auto-set) |

#### 7.2.4 Product Variant Management

| Property | Details |
|---|---|
| **Route** | `/seller/products/:productId/variants` |
| **Access** | `seller` role |
| **Endpoints** | `GET /products/:productId/variants`, `POST /products/:productId/variants`, `PATCH /products/variants/:id`, `DELETE /products/variants/:id` |
| **Components** | Variant table, create/edit variant form |

#### 7.2.5 Product Image Management

| Property | Details |
|---|---|
| **Route** | `/seller/products/:productId/images` |
| **Access** | `seller` role |
| **Endpoints** | `POST /products/:productId/images`, `DELETE /products/images/:id` |
| **Components** | Image gallery with upload, drag-to-reorder, delete |

#### 7.2.6 Inventory Management

| Property | Details |
|---|---|
| **Route** | `/seller/inventory` |
| **Access** | `seller` role |
| **Endpoints** | `GET /inventory/product/:productId`, `POST /inventory/adjust`, `GET /inventory/movements/:productId`, `GET /warehouses/?sellerId=` |
| **Components** | Stock level table per product, adjust stock modal, movement history |
| **Actions** | Adjust stock: `POST /inventory/adjust` with `{ productId, warehouseId, adjustment, reason }` |

#### 7.2.7 Order Management

| Property | Details |
|---|---|
| **Route** | `/seller/orders` |
| **Access** | `seller` role |
| **Endpoints** | `GET /orders?sellerId=&page=&limit=&status=`, `GET /orders/:id`, `PATCH /orders/:id/status`, `POST /orders/:orderId/shipments` |
| **Components** | Order data table with filters, order detail view, create shipment form, update status |

#### 7.2.8 Shipment Management

| Property | Details |
|---|---|
| **Route** | `/seller/shipments` |
| **Access** | `seller` role |
| **Endpoints** | `GET /orders/:orderId/shipments`, `PATCH /shipments/:id`, `PATCH /shipments/:id/status` |
| **Components** | Shipment list, update tracking info, update status |

#### 7.2.9 Return Management

| Property | Details |
|---|---|
| **Route** | `/seller/returns` |
| **Access** | `seller` role |
| **Endpoints** | `GET /returns?page=&limit=`, `GET /returns/:id`, `PATCH /returns/:id/status` |
| **Components** | Return request list, detail view, approve/reject actions |

#### 7.2.10 Dispute Management

| Property | Details |
|---|---|
| **Route** | `/seller/disputes` |
| **Access** | `seller` role |
| **Endpoints** | `GET /disputes?page=&limit=`, `GET /disputes/:id`, `GET /disputes/:id/messages`, `POST /disputes/:id/messages`, `POST /disputes/:id/evidence` |
| **Components** | Dispute list, detail view with message thread, evidence upload |

#### 7.2.11 Review Management

| Property | Details |
|---|---|
| **Route** | `/seller/reviews` |
| **Access** | `seller` role |
| **Endpoints** | `GET /reviews?sellerId=`, `GET /reviews/:id` |
| **Components** | Review list, rating summary, respond to reviews |

#### 7.2.12 Wallet & Earnings

| Property | Details |
|---|---|
| **Route** | `/seller/wallet` |
| **Access** | `seller` role |
| **Endpoints** | `GET /sellers/:id/wallet`, `GET /sellers/:id/wallet/transactions` |
| **Components** | Balance card, transaction history table, payout settings |

#### 7.2.13 Documents

| Property | Details |
|---|---|
| **Route** | `/seller/documents` |
| **Access** | `seller` role |
| **Endpoints** | `GET /sellers/:id/documents`, `POST /sellers/:id/documents` |
| **Components** | Document list with status badges, upload document form |
| **Form Fields** | `documentType` (enum: business_license, tax_certificate, id_card, cnic, bank_statement, address_proof), `documentUrl` (string, required) |

---

### 7.3 Portal 3 — Admin Panel

#### 7.3.1 Admin Dashboard

| Property | Details |
|---|---|
| **Route** | `/admin` |
| **Access** | `admin`, `super_admin` |
| **Endpoints** | `GET /orders`, `GET /users`, `GET /sellers`, `GET /products` |
| **Components** | KPI cards (users, sellers, orders, revenue), charts, recent activity |

#### 7.3.2 User Management

| Property | Details |
|---|---|
| **Route** | `/admin/users` |
| **Access** | `admin` |
| **Endpoints** | `GET /users`, `POST /users`, `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id`, `GET /users/:id/permissions` |
| **Components** | User data table, create/edit user modal |
| **Form Fields (Create User)** | `name` (string, required, max 100), `email` (email, required, max 150), `password` (string, required, min 8, max 128, uppercase+lowercase+digit), `phone` (string, optional, max 20), `role` (enum: customer, seller, admin, super_admin), `gender` (enum: male, female, other, prefer_not_to_say), `dateOfBirth` (ISO date) |

#### 7.3.3 Seller Management

| Property | Details |
|---|---|
| **Route** | `/admin/sellers` |
| **Access** | `admin` |
| **Endpoints** | `GET /sellers`, `GET /sellers/:id`, `PATCH /sellers/:id`, `DELETE /sellers/:id`, `GET /sellers/:id/documents`, `GET /sellers/:id/wallet` |
| **Components** | Seller data table, seller detail view, approve/suspend actions, document review |
| **Actions** | Update seller status (verification), review documents |

#### 7.3.4 Category Management

| Property | Details |
|---|---|
| **Route** | `/admin/categories` |
| **Access** | `admin` |
| **Endpoints** | `GET /categories`, `GET /categories/root`, `POST /categories`, `PATCH /categories/:id`, `DELETE /categories/:id`, `POST /categories/:categoryId/brands/:brandId`, `DELETE /categories/:categoryId/brands/:brandId` |
| **Components** | Category tree view, create/edit category modal, brand assignment |
| **Form Fields** | `name` (string, required), `slug` (string, required), `description` (string), `parentId` (UUID, optional — for subcategories), `imageUrl` (string), `isActive` (boolean) |

#### 7.3.5 Brand Management

| Property | Details |
|---|---|
| **Route** | `/admin/brands` |
| **Access** | `admin` |
| **Endpoints** | `GET /brands`, `POST /brands`, `GET /brands/:id`, `PATCH /brands/:id`, `DELETE /brands/:id` |
| **Components** | Brand data table, create/edit brand modal |
| **Form Fields** | `name` (string, required), `slug` (string, required), `description` (string), `logoUrl` (string), `isActive` (boolean) |

#### 7.3.6 Attribute Management

| Property | Details |
|---|---|
| **Route** | `/admin/attributes` |
| **Access** | `admin` |
| **Endpoints** | `GET /attributes`, `POST /attributes`, `GET /attributes/:id`, `PATCH /attributes/:id`, `DELETE /attributes/:id` |
| **Components** | Attribute data table, create/edit modal |
| **Form Fields** | `name` (string, required), `type` (enum: text, number, boolean, select, multi_select, color, date), `isFilterable` (boolean), `isRequired` (boolean) |

#### 7.3.7 Product Moderation

| Property | Details |
|---|---|
| **Route** | `/admin/products` |
| **Access** | `admin` |
| **Endpoints** | `GET /products?status=&page=&limit=`, `GET /products/:id`, `PATCH /products/:id/status`, `DELETE /products/:id` |
| **Components** | Product data table with status filter, product detail modal, approve/reject/feature actions |
| **Actions** | `PATCH /products/:id/status` with body `{ status: 'active' | 'rejected' | ... }` |

#### 7.3.8 Order Management

| Property | Details |
|---|---|
| **Route** | `/admin/orders` |
| **Access** | `admin` |
| **Endpoints** | `GET /orders?page=&limit=&status=&userId=&sellerId=`, `GET /orders/:id`, `PATCH /orders/:id/status`, `GET /orders/:id/status-history` |
| **Components** | Order data table with multi-filter, order detail drawer, status update form, status history timeline |

#### 7.3.9 Payment & Refund Management

| Property | Details |
|---|---|
| **Route** | `/admin/payments`, `/admin/refunds` |
| **Access** | `admin` |
| **Endpoints** | `GET /payments?page=&limit=&status=&orderId=&userId=`, `GET /payments/:id`, `POST /payments/:id/process`, `GET /payments/:id/attempts`, `GET /refunds?page=&limit=&status=&paymentId=`, `GET /refunds/:id`, `POST /refunds/:id/process`, `POST /refunds/:id/reject` |
| **Components** | Payment/refund data tables, detail views, process/reject actions |

#### 7.3.10 Return & Dispute Resolution

| Property | Details |
|---|---|
| **Route** | `/admin/returns`, `/admin/disputes` |
| **Access** | `admin` |
| **Endpoints (Returns)** | `GET /returns?page=&limit=&status=`, `GET /returns/:id`, `PATCH /returns/:id/status` |
| **Endpoints (Disputes)** | `GET /disputes?page=&limit=&status=`, `GET /disputes/:id`, `PATCH /disputes/:id/status`, `GET /disputes/:id/messages` |
| **Components** | Data tables, detail views with message threads, status update, resolution selection |
| **Dispute Statuses** | open, under_review, escalated, awaiting_seller, awaiting_buyer, resolved, closed |
| **Dispute Resolutions** | refund_buyer, side_with_seller, partial_refund, replacement, mutual_agreement, no_action |

#### 7.3.11 Review Moderation

| Property | Details |
|---|---|
| **Route** | `/admin/reviews` |
| **Access** | `admin` |
| **Endpoints** | `GET /reviews?page=&limit=&status=`, `GET /reviews/:id`, `PATCH /reviews/:id/status` |
| **Components** | Review data table, approve/reject actions |
| **Review Statuses** | pending, approved, rejected, hidden |

#### 7.3.12 Marketing Management

| Property | Details |
|---|---|
| **Route** | `/admin/campaigns`, `/admin/flash-sales`, `/admin/vouchers` |
| **Access** | `admin` |
| **Endpoints (Campaigns)** | `GET /marketing/campaigns`, `POST /marketing/campaigns`, `GET /marketing/campaigns/:id`, `PATCH /marketing/campaigns/:id` |
| **Endpoints (Flash Sales)** | `GET /marketing/flash-sales/active`, `POST /marketing/flash-sales`, `GET /marketing/flash-sales/:id` |
| **Endpoints (Vouchers)** | `GET /marketing/vouchers`, `POST /marketing/vouchers`, `GET /marketing/vouchers/code/:code` |
| **Campaign Form Fields** | `name` (string, required), `type` (enum: seasonal, flash_sale, clearance, new_arrival, bundle_deal, special_event), `startsAt` (ISO date, required), `endsAt` (ISO date, required), `description` (string) |
| **Flash Sale Form Fields** | `name` (string, required), `startsAt` (ISO date, required), `endsAt` (ISO date, required), `description` (string) |
| **Voucher Form Fields** | `code` (string, required), `name` (string, required), `type` (enum: percentage, fixed_amount, free_shipping, buy_x_get_y), `discountType` (enum: percentage, fixed_amount), `discountValue` (number, required), `startsAt` (ISO date, required), `endsAt` (ISO date, required), `maxUses` (number), `minOrderAmount` (number) |

#### 7.3.13 Shipping Configuration

| Property | Details |
|---|---|
| **Route** | `/admin/shipping` |
| **Access** | `admin` |
| **Endpoints** | `GET/POST /shipping/zones`, `GET/POST /shipping/methods`, `GET/POST /shipping/carriers`, `GET/POST /shipping/rates`, `PATCH/DELETE` on each, `GET /shipping/slots`, `POST /shipping/slots` |
| **Tabs** | Zones, Methods, Carriers, Rates, Delivery Slots |
| **Zone Form** | `name` (string, required), `countries` (string[], required) |
| **Method Form** | `name` (string, required), `estimatedDaysMin` (number), `estimatedDaysMax` (number), `isActive` (boolean) |
| **Carrier Form** | `name` (string, required), `code` (string, required), `trackingUrlTemplate` (string) |
| **Rate Form** | `shippingMethodId` (UUID, required), `shippingZoneId` (UUID, required), `baseRate` (number, required), `rateType` (enum: flat, weight_based, price_based, item_based, free) |

#### 7.3.14 Tax Configuration

| Property | Details |
|---|---|
| **Route** | `/admin/tax` |
| **Access** | `admin` |
| **Endpoints** | `GET/POST /tax/zones`, `GET/POST /tax/rates`, `GET/POST /tax/classes`, `PATCH/DELETE` on each |
| **Tabs** | Zones, Rates, Classes |
| **Zone Form** | `name` (string, required), `countries` (string[]) |
| **Rate Form** | `taxClassId` (UUID, required), `taxZoneId` (UUID, required), `name` (string, required), `rate` (number, required) |
| **Class Form** | `name` (string, required), `description` (string) |

#### 7.3.15 Loyalty Tier Management

| Property | Details |
|---|---|
| **Route** | `/admin/loyalty-tiers` |
| **Access** | `admin` |
| **Endpoints** | `GET /loyalty/tiers`, `POST /loyalty/tiers`, `PATCH /loyalty/tiers/:id`, `DELETE /loyalty/tiers/:id`, `POST /loyalty/points/earn` |
| **Form Fields** | `name` (string, required), `minPoints` (number, required), `earnMultiplier` (number), `sortOrder` (number) |

#### 7.3.16 Notification Management

| Property | Details |
|---|---|
| **Route** | `/admin/notifications` |
| **Access** | `admin` |
| **Endpoints** | `GET /notification-templates`, `POST /notification-templates`, `PATCH /notification-templates/:id` |
| **Components** | Template management, notification previews |

#### 7.3.17 Ticket Management

| Property | Details |
|---|---|
| **Route** | `/admin/tickets` |
| **Access** | `admin` |
| **Endpoints** | `GET /tickets?page=&limit=&status=&priority=`, `GET /tickets/:id`, `PATCH /tickets/:id`, `PATCH /tickets/:id/status`, `PATCH /tickets/:id/assign`, `GET /tickets/:id/messages`, `POST /tickets/:id/messages`, `GET /tickets/categories/all`, `POST /tickets/categories` |
| **Components** | Ticket data table, detail view, assign agent, status update, message thread |

#### 7.3.18 CMS Management

| Property | Details |
|---|---|
| **Route** | `/admin/cms` |
| **Access** | `admin` |
| **Endpoints (Pages)** | `GET /cms/pages?isPublished=`, `POST /cms/pages`, `GET /cms/pages/:id`, `PATCH /cms/pages/:id`, `DELETE /cms/pages/:id`, `POST /cms/pages/:id/publish`, `POST /cms/pages/:id/unpublish` |
| **Endpoints (Banners)** | `GET /cms/banners?isActive=&position=`, `POST /cms/banners`, `GET /cms/banners/:id`, `PATCH /cms/banners/:id`, `DELETE /cms/banners/:id`, `PATCH /cms/banners/:id/toggle-active` |
| **Page Form Fields** | `title` (string, required), `slug` (string, required), `content` (string/HTML, required), `metaTitle` (string), `metaDescription` (string) |
| **Banner Form Fields** | `title` (string, required), `imageUrl` (string, required), `position` (enum: homepage_hero, homepage_mid, homepage_bottom, category_top, category_sidebar, product_sidebar, checkout_banner, app_splash, app_popup), `linkType` (enum: product, category, brand, campaign, store, page, external), `linkValue` (string), `sortOrder` (number), `isActive` (boolean), `startsAt` (ISO date), `endsAt` (ISO date) |

#### 7.3.19 SEO Management

| Property | Details |
|---|---|
| **Route** | `/admin/seo` |
| **Access** | `admin` |
| **Endpoints (Metadata)** | `GET /seo/metadata?entityType=`, `POST /seo/metadata`, `PATCH /seo/metadata/:id`, `DELETE /seo/metadata/:id`, `POST /seo/metadata/upsert/:entityType/:entityId` |
| **Endpoints (Redirects)** | `GET /seo/redirects`, `POST /seo/redirects`, `POST /seo/redirects/bulk`, `PATCH /seo/redirects/:id`, `DELETE /seo/redirects/:id`, `PATCH /seo/redirects/:id/toggle-active` |
| **Components** | Metadata list, redirect management, bulk redirect import |

#### 7.3.20 Bundle Management

| Property | Details |
|---|---|
| **Route** | `/admin/bundles` |
| **Access** | `admin` |
| **Endpoints** | `GET /bundles`, `POST /bundles`, `GET /bundles/:id`, `PATCH /bundles/:id`, `DELETE /bundles/:id`, `PATCH /bundles/:id/toggle-active`, `POST /bundles/:id/items`, `GET /bundles/:id/items`, `PATCH /bundles/:id/items/:itemId`, `DELETE /bundles/:id/items/:itemId`, `GET /bundles/:id/price` |
| **Bundle Form Fields** | `name` (string, required), `slug` (string, required), `description` (string), `discountType` (enum: percentage, fixed_amount, free_shipping, buy_x_get_y), `discountValue` (number, required) |
| **Bundle Item Form** | `productId` (UUID, required), `variantId` (UUID, optional), `quantity` (number) |

#### 7.3.21 Audit Logs

| Property | Details |
|---|---|
| **Route** | `/admin/audit-logs` |
| **Access** | `admin` |
| **Endpoints** | `GET /audit/logs?userId=&action=&entityType=&startDate=&endDate=&page=&limit=`, `GET /audit/logs/:id`, `GET /audit/logs/user/:userId`, `GET /audit/logs/entity/:entityType/:entityId`, `GET /audit/activity?userId=&activityType=&startDate=&endDate=&page=&limit=`, `GET /audit/activity/my-activity`, `GET /audit/activity/user/:userId/summary` |
| **Components** | Audit log data table with filters (user, action, entity type, date range), activity timeline |

---

### 7.4 Portal 4 — Super Admin Panel

All admin capabilities plus:

#### 7.4.1 Role Management

| Property | Details |
|---|---|
| **Route** | `/super-admin/roles` |
| **Access** | `super_admin` |
| **Endpoints** | `GET /roles`, `POST /roles`, `GET /roles/:id`, `PATCH /roles/:id`, `DELETE /roles/:id` |
| **Form Fields** | `name` (string, required), `description` (string) |

#### 7.4.2 Permission Management

| Property | Details |
|---|---|
| **Route** | `/super-admin/permissions` |
| **Access** | `super_admin` |
| **Endpoints** | `GET /permissions`, `POST /permissions`, `GET /permissions/:id`, `GET /permissions/by-module?module=`, `PATCH /permissions/:id`, `DELETE /permissions/:id` |
| **Form Fields** | `roleId` (UUID, required), `module` (string, required), `action` (string, required: create, read, update, delete) |

#### 7.4.3 Role-Permission Assignment

| Property | Details |
|---|---|
| **Route** | `/super-admin/role-permissions` |
| **Access** | `super_admin` |
| **Endpoints** | `POST /role-permissions/:roleId` (assign), `GET /role-permissions/:roleId` (list), `DELETE /role-permissions/:roleId/:permissionId` (remove) |
| **Components** | Role selector, permission checklist matrix, assign/remove actions |

#### 7.4.4 System Settings

| Property | Details |
|---|---|
| **Route** | `/super-admin/settings` |
| **Access** | `super_admin` |
| **Endpoints** | `GET /system/settings?group=`, `GET /system/settings/group/:group`, `GET /system/settings/key/:key`, `POST /system/settings`, `PATCH /system/settings/:id`, `PATCH /system/settings/key/:key`, `POST /system/settings/bulk`, `DELETE /system/settings/:id` |
| **Components** | Settings grouped by category, inline edit, bulk update |
| **Form Fields** | `key` (string, required), `value` (string, required), `group` (string), `description` (string) |

#### 7.4.5 Feature Flags

| Property | Details |
|---|---|
| **Route** | `/super-admin/features` |
| **Access** | `super_admin` |
| **Endpoints** | `GET /system/features`, `GET /system/features/enabled`, `POST /system/features`, `PATCH /system/features/:id`, `PATCH /system/features/:id/toggle`, `DELETE /system/features/:id` |
| **Components** | Feature flag list with toggle switches |
| **Form Fields** | `name` (string, required), `key` (string, required), `isEnabled` (boolean), `description` (string) |

#### 7.4.6 Operations (Bulk & Import/Export)

| Property | Details |
|---|---|
| **Route** | `/super-admin/operations` |
| **Access** | `super_admin` |
| **Endpoints (Bulk)** | `GET /operations/bulk`, `POST /operations/bulk`, `GET /operations/bulk/:id`, `PATCH /operations/bulk/:id/progress`, `POST /operations/bulk/:id/cancel`, `POST /operations/bulk/:id/fail` |
| **Endpoints (Import/Export)** | `GET /operations/jobs`, `POST /operations/jobs`, `GET /operations/jobs/my-jobs`, `GET /operations/jobs/:id`, `PATCH /operations/jobs/:id/progress`, `POST /operations/jobs/:id/complete`, `POST /operations/jobs/:id/fail` |
| **Components** | Job list, create job form, progress tracking, status management |

#### 7.4.7 System Health

| Property | Details |
|---|---|
| **Route** | `/super-admin/health` |
| **Access** | `super_admin` |
| **Endpoints** | `GET /health` |
| **Components** | Health status card, environment info, version display |

---

## 8. Complete API Service Layer Reference

Every service file follows this pattern:

```typescript
import api from '@/lib/axios';
import { ApiResponse } from '@/types/api.types';

const serviceName = {
  method: (params) => api.METHOD<ApiResponse<ReturnType>>('/path', body?),
};
export default serviceName;
```

### 8.1 Auth Service — `src/services/auth.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `login` | POST | `/auth/login` | `{ email, password }` | `AuthResponse` |
| `register` | POST | `/auth/register` | `{ name, email, password, phone? }` | `AuthResponse` |
| `refresh` | POST | `/auth/refresh` | `{ refreshToken }` | `AuthResponse` |
| `logout` | POST | `/auth/logout` | `{ refreshToken }` | `void` |
| `forgotPassword` | POST | `/auth/password-forgot` | `{ email }` | `void` |
| `resetPassword` | POST | `/auth/reset-password` | `{ token, password }` | `void` |

### 8.2 User Service — `src/services/user.service.ts`

| Function | Method | Endpoint | Body/Params | Return Type |
|---|---|---|---|---|
| `getAll` | GET | `/users` | — | `User[]` |
| `getById` | GET | `/users/:id` | — | `User` |
| `getMe` | GET | `/users/me` | — | `User` |
| `create` | POST | `/users` | `CreateUserDto` | `User` |
| `update` | PATCH | `/users/:id` | `UpdateUserDto` | `User` |
| `delete` | DELETE | `/users/:id` | — | `void` |
| `getPermissions` | GET | `/users/:id/permissions` | — | `Permission[]` |

### 8.3 Role Service — `src/services/role.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getAll` | GET | `/roles` | — | `Role[]` |
| `getById` | GET | `/roles/:id` | — | `Role` |
| `create` | POST | `/roles` | `{ name, description }` | `Role` |
| `update` | PATCH | `/roles/:id` | `{ name?, description? }` | `Role` |
| `delete` | DELETE | `/roles/:id` | — | `void` |

### 8.4 Permission Service — `src/services/permission.service.ts`

| Function | Method | Endpoint | Body/Params | Return Type |
|---|---|---|---|---|
| `getAll` | GET | `/permissions` | — | `Permission[]` |
| `getById` | GET | `/permissions/:id` | — | `Permission` |
| `getByModule` | GET | `/permissions/by-module?module=` | query: `module` | `Permission[]` |
| `create` | POST | `/permissions` | `{ roleId, module, action }` | `Permission` |
| `update` | PATCH | `/permissions/:id` | partial body | `Permission` |
| `delete` | DELETE | `/permissions/:id` | — | `void` |

### 8.5 Role-Permission Service — `src/services/role-permission.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getByRole` | GET | `/role-permissions/:roleId` | — | `RolePermission[]` |
| `assign` | POST | `/role-permissions/:roleId` | `{ permissionIds }` | `void` |
| `remove` | DELETE | `/role-permissions/:roleId/:permissionId` | — | `void` |

### 8.6 Category Service — `src/services/category.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getAll` | GET | `/categories` | — | `Category[]` |
| `getRoot` | GET | `/categories/root` | — | `Category[]` |
| `getById` | GET | `/categories/:id` | — | `Category` |
| `getBySlug` | GET | `/categories/slug/:slug` | — | `Category` |
| `create` | POST | `/categories` | `{ name, slug, description?, parentId?, imageUrl?, isActive? }` | `Category` |
| `update` | PATCH | `/categories/:id` | partial body | `Category` |
| `delete` | DELETE | `/categories/:id` | — | `void` |
| `assignBrand` | POST | `/categories/:categoryId/brands/:brandId` | — | `void` |
| `removeBrand` | DELETE | `/categories/:categoryId/brands/:brandId` | — | `void` |

### 8.7 Brand Service — `src/services/brand.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getAll` | GET | `/brands` | — | `Brand[]` |
| `getById` | GET | `/brands/:id` | — | `Brand` |
| `getBySlug` | GET | `/brands/slug/:slug` | — | `Brand` |
| `create` | POST | `/brands` | `{ name, slug, description?, logoUrl? }` | `Brand` |
| `update` | PATCH | `/brands/:id` | partial body | `Brand` |
| `delete` | DELETE | `/brands/:id` | — | `void` |

### 8.8 Attribute Service — `src/services/attribute.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getAll` | GET | `/attributes` | — | `Attribute[]` |
| `getById` | GET | `/attributes/:id` | — | `Attribute` |
| `create` | POST | `/attributes` | `{ name, type?, isFilterable?, isRequired? }` | `Attribute` |
| `update` | PATCH | `/attributes/:id` | partial body | `Attribute` |
| `delete` | DELETE | `/attributes/:id` | — | `void` |

### 8.9 Seller Service — `src/services/seller.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getAll` | GET | `/sellers` | — | `Seller[]` |
| `getById` | GET | `/sellers/:id` | — | `Seller` |
| `create` | POST | `/sellers` | `{ userId, businessName }` | `Seller` |
| `update` | PATCH | `/sellers/:id` | partial body | `Seller` |
| `delete` | DELETE | `/sellers/:id` | — | `void` |
| `getDocuments` | GET | `/sellers/:id/documents` | — | `SellerDocument[]` |
| `addDocument` | POST | `/sellers/:id/documents` | `{ documentType, documentUrl }` | `SellerDocument` |
| `getWallet` | GET | `/sellers/:id/wallet` | — | `SellerWallet` |
| `getWalletTransactions` | GET | `/sellers/:id/wallet/transactions` | — | `WalletTransaction[]` |

### 8.10 Store Service — `src/services/store.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getAll` | GET | `/stores` | — | `Store[]` |
| `getById` | GET | `/stores/:id` | — | `Store` |
| `getBySlug` | GET | `/stores/slug/:slug` | — | `Store` |
| `create` | POST | `/sellers/:sellerId/stores` | `{ name, slug, description? }` | `Store` |
| `update` | PATCH | `/stores/:id` | partial body | `Store` |
| `delete` | DELETE | `/stores/:id` | — | `void` |
| `follow` | POST | `/stores/:id/follow` | — | `void` |
| `unfollow` | DELETE | `/stores/:id/follow` | — | `void` |

### 8.11 Product Service — `src/services/product.service.ts`

| Function | Method | Endpoint | Body/Params | Return Type |
|---|---|---|---|---|
| `getAll` | GET | `/products?categoryId=&brandId=&sellerId=&status=&page=&limit=` | query params | `Product[]` |
| `getById` | GET | `/products/:id` | — | `Product` |
| `getBySlug` | GET | `/products/slug/:slug` | — | `Product` |
| `create` | POST | `/products` | `{ name, slug, description, price, stock, categoryId, brandId?, sellerId }` | `Product` |
| `update` | PATCH | `/products/:id` | partial body | `Product` |
| `delete` | DELETE | `/products/:id` | — | `void` |
| `updateStatus` | PATCH | `/products/:id/status` | `{ status }` | `Product` |
| `getVariants` | GET | `/products/:productId/variants` | — | `ProductVariant[]` |
| `createVariant` | POST | `/products/:productId/variants` | variant body | `ProductVariant` |
| `updateVariant` | PATCH | `/products/variants/:id` | partial body | `ProductVariant` |
| `deleteVariant` | DELETE | `/products/variants/:id` | — | `void` |
| `addImage` | POST | `/products/:productId/images` | `{ imageUrl, altText?, sortOrder? }` | `ProductImage` |
| `deleteImage` | DELETE | `/products/images/:id` | — | `void` |
| `getQuestions` | GET | `/products/:productId/questions` | — | `ProductQuestion[]` |
| `askQuestion` | POST | `/products/:productId/questions` | `{ question }` | `ProductQuestion` |
| `answerQuestion` | POST | `/products/questions/:questionId/answers` | `{ answer, isSellerAnswer }` | `ProductAnswer` |
| `getPriceHistory` | GET | `/products/:productId/price-history` | — | `PriceHistory[]` |

### 8.12 Inventory Service — `src/services/inventory.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getProductInventory` | GET | `/inventory/product/:productId?variantId=` | query | `Inventory[]` |
| `adjustStock` | POST | `/inventory/adjust` | `{ productId, warehouseId, adjustment, reason, variantId? }` | `void` |
| `reserveStock` | POST | `/inventory/reserve` | `{ productId, warehouseId, quantity, orderId, variantId? }` | `void` |
| `releaseReservation` | POST | `/inventory/release/:reservationId` | — | `void` |
| `getMovements` | GET | `/inventory/movements/:productId?warehouseId=&page=&limit=` | query | `StockMovement[]` |
| `createMovement` | POST | `/inventory/movements` | `CreateStockMovementDto` | `StockMovement` |

### 8.13 Warehouse Service — `src/services/warehouse.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getAll` | GET | `/warehouses?sellerId=` | query | `Warehouse[]` |
| `getById` | GET | `/warehouses/:id` | — | `Warehouse` |
| `create` | POST | `/warehouses` | `{ name, code, city?, countryCode? }` | `Warehouse` |
| `update` | PATCH | `/warehouses/:id` | partial body | `Warehouse` |
| `delete` | DELETE | `/warehouses/:id` | — | `void` |
| `getInventory` | GET | `/warehouses/:id/inventory` | — | `Inventory[]` |

### 8.14 Cart Service — `src/services/cart.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getCart` | GET | `/cart` | — | `Cart` |
| `addItem` | POST | `/cart/items` | `{ productId, quantity, priceAtAddition?, variantId? }` | `CartItem` |
| `updateItem` | PATCH | `/cart/items/:id` | `{ quantity }` | `CartItem` |
| `removeItem` | DELETE | `/cart/items/:id` | — | `void` |
| `clearCart` | DELETE | `/cart` | — | `void` |

### 8.15 Wishlist Service — `src/services/wishlist.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getWishlist` | GET | `/wishlist` | — | `WishlistItem[]` |
| `add` | POST | `/wishlist` | `{ productId }` | `WishlistItem` |
| `remove` | DELETE | `/wishlist/:productId` | — | `void` |
| `isInWishlist` | GET | `/wishlist/check/:productId` | — | `boolean` |

### 8.16 Checkout Service — `src/services/checkout.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `createSession` | POST | `/checkout/session` | `{ cartId, sessionToken? }` | `CheckoutSession` |
| `getSession` | GET | `/checkout/session/:id` | — | `CheckoutSession` |
| `updateSession` | PATCH | `/checkout/session/:id` | partial body | `CheckoutSession` |
| `completeSession` | POST | `/checkout/session/:id/complete` | — | `void` |

### 8.17 Order Service — `src/services/order.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getAll` | GET | `/orders?userId=&sellerId=&status=&page=&limit=` | query | `Order[]` |
| `getMyOrders` | GET | `/orders/my-orders?page=&limit=` | query | `Order[]` |
| `getById` | GET | `/orders/:id` | — | `Order` |
| `getByNumber` | GET | `/orders/number/:orderNumber` | — | `Order` |
| `create` | POST | `/orders` | `CreateOrderDto` | `Order` |
| `update` | PATCH | `/orders/:id` | partial body | `Order` |
| `updateStatus` | PATCH | `/orders/:id/status` | `{ status, comment }` | `Order` |
| `cancel` | POST | `/orders/:id/cancel` | `{ reason }` | `Order` |
| `getStatusHistory` | GET | `/orders/:id/status-history` | — | `OrderStatusHistory[]` |
| `createShipment` | POST | `/orders/:orderId/shipments` | `CreateShipmentDto` | `Shipment` |
| `getShipments` | GET | `/orders/:orderId/shipments` | — | `Shipment[]` |

**CreateOrderDto fields:** `userId` (UUID), `storeId` (UUID), `subtotal` (number), `totalAmount` (number), `shippingAddress` (object: `{ fullName, phone, country, city, province, streetAddress }`), `paymentMethod` (enum), `shippingMethod` (string), `currencyCode` (string)

**CreateShipmentDto fields:** `orderId` (UUID), `shipmentNumber` (string), `deliveryAddress` (object), `carrierId` (UUID), `trackingNumber` (string)

### 8.18 Shipment Service — `src/services/shipment.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `update` | PATCH | `/shipments/:id` | partial body | `Shipment` |
| `updateStatus` | PATCH | `/shipments/:id/status` | `{ status }` | `Shipment` |
| `track` | GET | `/shipments/track/:trackingNumber` | — | `TrackingInfo` |

### 8.19 Payment Service — `src/services/payment.service.ts`

| Function | Method | Endpoint | Body/Params | Return Type |
|---|---|---|---|---|
| `getAll` | GET | `/payments?orderId=&userId=&status=&page=&limit=` | query | `Payment[]` |
| `getById` | GET | `/payments/:id` | — | `Payment` |
| `create` | POST | `/payments` | `{ orderId, userId, amount, paymentMethod, currencyCode? }` | `Payment` |
| `update` | PATCH | `/payments/:id` | partial body | `Payment` |
| `process` | POST | `/payments/:id/process` | `{}` | `Payment` |
| `getAttempts` | GET | `/payments/:id/attempts` | — | `PaymentAttempt[]` |

### 8.20 Refund Service — `src/services/refund.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getAll` | GET | `/refunds?paymentId=&status=&page=&limit=` | query | `Refund[]` |
| `getById` | GET | `/refunds/:id` | — | `Refund` |
| `create` | POST | `/refunds` | `{ paymentId, amount, reasonDetails }` | `Refund` |
| `process` | POST | `/refunds/:id/process` | — | `Refund` |
| `reject` | POST | `/refunds/:id/reject` | `{ reason }` | `Refund` |

### 8.21 Payment Method Service — `src/services/payment-method.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getAll` | GET | `/payment-methods` | — | `SavedPaymentMethod[]` |
| `create` | POST | `/payment-methods` | `{ paymentMethod, nickname?, isDefault? }` | `SavedPaymentMethod` |
| `delete` | DELETE | `/payment-methods/:id` | — | `void` |
| `setDefault` | POST | `/payment-methods/:id/default` | — | `void` |

### 8.22 Return Service — `src/services/return.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getAll` | GET | `/returns?userId=&orderId=&status=&page=&limit=` | query | `ReturnRequest[]` |
| `getById` | GET | `/returns/:id` | — | `ReturnRequest` |
| `create` | POST | `/returns` | `{ orderId, orderItemId, type, quantity, reasonDetails }` | `ReturnRequest` |
| `update` | PATCH | `/returns/:id` | partial body | `ReturnRequest` |
| `updateStatus` | PATCH | `/returns/:id/status` | `{ status, notes? }` | `ReturnRequest` |
| `addImage` | POST | `/returns/:id/images` | `{ imageUrl }` | `void` |
| `getReasons` | GET | `/return-reasons` | — | `ReturnReason[]` |
| `createReason` | POST | `/return-reasons` | `{ name, description? }` | `ReturnReason` |

### 8.23 Dispute Service — `src/services/dispute.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getAll` | GET | `/disputes?customerId=&orderId=&status=&page=&limit=` | query | `Dispute[]` |
| `getById` | GET | `/disputes/:id` | — | `Dispute` |
| `create` | POST | `/disputes` | `{ orderId, type, subject, description }` | `Dispute` |
| `updateStatus` | PATCH | `/disputes/:id/status` | `{ status, resolution? }` | `Dispute` |
| `addEvidence` | POST | `/disputes/:id/evidence` | `CreateDisputeEvidenceDto` | `void` |
| `getMessages` | GET | `/disputes/:id/messages` | — | `DisputeMessage[]` |
| `addMessage` | POST | `/disputes/:id/messages` | `{ content }` | `DisputeMessage` |

### 8.24 Review Service — `src/services/review.service.ts`

| Function | Method | Endpoint | Body/Params | Return Type |
|---|---|---|---|---|
| `getAll` | GET | `/reviews?productId=&userId=&status=&minRating=&page=&limit=` | query | `Review[]` |
| `getById` | GET | `/reviews/:id` | — | `Review` |
| `getProductSummary` | GET | `/reviews/product/:productId/summary` | — | `RatingSummary` |
| `create` | POST | `/reviews` | `{ productId, rating, title?, content? }` | `Review` |
| `update` | PATCH | `/reviews/:id` | `{ rating?, title?, content? }` | `Review` |
| `delete` | DELETE | `/reviews/:id` | — | `void` |
| `updateStatus` | PATCH | `/reviews/:id/status` | `{ status }` | `Review` |
| `markHelpful` | POST | `/reviews/:id/helpful` | `{ isHelpful }` | `void` |
| `report` | POST | `/reviews/:id/report` | `{ reason }` | `void` |

### 8.25 Marketing Service — `src/services/marketing.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getCampaigns` | GET | `/marketing/campaigns?isActive=` | query | `Campaign[]` |
| `getCampaign` | GET | `/marketing/campaigns/:id` | — | `Campaign` |
| `createCampaign` | POST | `/marketing/campaigns` | `{ name, type, startsAt, endsAt, description? }` | `Campaign` |
| `updateCampaign` | PATCH | `/marketing/campaigns/:id` | partial body | `Campaign` |
| `getActiveFlashSales` | GET | `/marketing/flash-sales/active` | — | `FlashSale[]` |
| `getFlashSale` | GET | `/marketing/flash-sales/:id` | — | `FlashSale` |
| `createFlashSale` | POST | `/marketing/flash-sales` | `{ name, startsAt, endsAt, description? }` | `FlashSale` |
| `getVouchers` | GET | `/marketing/vouchers?isActive=` | query | `Voucher[]` |
| `getVoucherByCode` | GET | `/marketing/vouchers/code/:code` | — | `Voucher` |
| `createVoucher` | POST | `/marketing/vouchers` | `{ code, name, type, discountType, discountValue, startsAt, endsAt }` | `Voucher` |
| `validateVoucher` | POST | `/marketing/vouchers/validate` | `{ code, orderTotal }` | `VoucherValidation` |
| `applyVoucher` | POST | `/marketing/vouchers/apply` | `{ code, orderId }` | `void` |

### 8.26 Loyalty Service — `src/services/loyalty.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getMyPoints` | GET | `/loyalty/points` | — | `LoyaltyPoints` |
| `earnPoints` | POST | `/loyalty/points/earn` | `{ userId, type, points, description? }` | `void` |
| `redeemPoints` | POST | `/loyalty/points/redeem` | `{ points, orderId? }` | `void` |
| `getTransactions` | GET | `/loyalty/transactions?page=&limit=` | query | `LoyaltyTransaction[]` |
| `getTiers` | GET | `/loyalty/tiers` | — | `LoyaltyTier[]` |
| `createTier` | POST | `/loyalty/tiers` | `{ name, minPoints, earnMultiplier?, sortOrder? }` | `LoyaltyTier` |
| `updateTier` | PATCH | `/loyalty/tiers/:id` | partial body | `LoyaltyTier` |
| `deleteTier` | DELETE | `/loyalty/tiers/:id` | — | `void` |
| `getReferralCode` | GET | `/loyalty/referral-code` | — | `ReferralCode` |
| `applyReferral` | POST | `/loyalty/referral/apply` | `{ code }` | `void` |
| `getReferrals` | GET | `/loyalty/referrals` | — | `Referral[]` |

### 8.27 Shipping Service — `src/services/shipping.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getZones` | GET | `/shipping/zones` | — | `ShippingZone[]` |
| `createZone` | POST | `/shipping/zones` | `{ name, countries }` | `ShippingZone` |
| `updateZone` | PATCH | `/shipping/zones/:id` | partial body | `ShippingZone` |
| `deleteZone` | DELETE | `/shipping/zones/:id` | — | `void` |
| `getMethods` | GET | `/shipping/methods?isActive=` | query | `ShippingMethod[]` |
| `createMethod` | POST | `/shipping/methods` | `{ name, estimatedDaysMin?, estimatedDaysMax? }` | `ShippingMethod` |
| `updateMethod` | PATCH | `/shipping/methods/:id` | partial body | `ShippingMethod` |
| `deleteMethod` | DELETE | `/shipping/methods/:id` | — | `void` |
| `getCarriers` | GET | `/shipping/carriers?isActive=` | query | `ShippingCarrier[]` |
| `createCarrier` | POST | `/shipping/carriers` | `{ name, code, trackingUrlTemplate? }` | `ShippingCarrier` |
| `updateCarrier` | PATCH | `/shipping/carriers/:id` | partial body | `ShippingCarrier` |
| `getRates` | GET | `/shipping/rates?zoneId=&methodId=` | query | `ShippingRate[]` |
| `createRate` | POST | `/shipping/rates` | `{ shippingMethodId, shippingZoneId, baseRate, rateType? }` | `ShippingRate` |
| `updateRate` | PATCH | `/shipping/rates/:id` | partial body | `ShippingRate` |
| `calculateShipping` | POST | `/shipping/calculate` | `{ zoneId, weight, totalAmount }` | `ShippingOption[]` |
| `getSlots` | GET | `/shipping/slots` | — | `DeliverySlot[]` |
| `createSlot` | POST | `/shipping/slots` | `CreateDeliverySlotDto` | `DeliverySlot` |

### 8.28 Tax Service — `src/services/tax.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getZones` | GET | `/tax/zones` | — | `TaxZone[]` |
| `createZone` | POST | `/tax/zones` | `{ name, countries? }` | `TaxZone` |
| `updateZone` | PATCH | `/tax/zones/:id` | partial body | `TaxZone` |
| `deleteZone` | DELETE | `/tax/zones/:id` | — | `void` |
| `getRates` | GET | `/tax/rates?zoneId=` | query | `TaxRate[]` |
| `createRate` | POST | `/tax/rates` | `{ taxClassId, taxZoneId, name, rate }` | `TaxRate` |
| `updateRate` | PATCH | `/tax/rates/:id` | partial body | `TaxRate` |
| `deleteRate` | DELETE | `/tax/rates/:id` | — | `void` |
| `getClasses` | GET | `/tax/classes` | — | `TaxClass[]` |
| `createClass` | POST | `/tax/classes` | `{ name, description? }` | `TaxClass` |
| `updateClass` | PATCH | `/tax/classes/:id` | partial body | `TaxClass` |
| `calculateTax` | POST | `/tax/calculate` | `{ amount, countryCode, stateCode?, taxClassId? }` | `TaxResult` |

### 8.29 Bundle Service — `src/services/bundle.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getAll` | GET | `/bundles?isActive=&page=&limit=` | query | `Bundle[]` |
| `getActive` | GET | `/bundles/active?page=&limit=` | query | `Bundle[]` |
| `getById` | GET | `/bundles/:id` | — | `Bundle` |
| `getBySlug` | GET | `/bundles/slug/:slug` | — | `Bundle` |
| `create` | POST | `/bundles` | `{ name, slug, description?, discountType, discountValue }` | `Bundle` |
| `update` | PATCH | `/bundles/:id` | partial body | `Bundle` |
| `delete` | DELETE | `/bundles/:id` | — | `void` |
| `toggleActive` | PATCH | `/bundles/:id/toggle-active` | — | `Bundle` |
| `addItem` | POST | `/bundles/:id/items` | `{ productId, variantId?, quantity? }` | `BundleItem` |
| `getItems` | GET | `/bundles/:id/items` | — | `BundleItem[]` |
| `updateItem` | PATCH | `/bundles/:id/items/:itemId` | partial body | `BundleItem` |
| `removeItem` | DELETE | `/bundles/:id/items/:itemId` | — | `void` |
| `calculatePrice` | GET | `/bundles/:id/price` | — | `BundlePrice` |

### 8.30 Notification Service — `src/services/notification.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getAll` | GET | `/notifications?isRead=&type=&page=&limit=` | query | `Notification[]` |
| `getUnreadCount` | GET | `/notifications/unread-count` | — | `{ count }` |
| `markAsRead` | PATCH | `/notifications/:id/read` | — | `void` |
| `markAllRead` | PATCH | `/notifications/read-all` | — | `void` |
| `delete` | DELETE | `/notifications/:id` | — | `void` |
| `getPreferences` | GET | `/notifications/preferences` | — | `NotificationPreference[]` |
| `updatePreference` | PATCH | `/notifications/preferences/:type` | body | `void` |
| `getTemplates` | GET | `/notification-templates` | — | `NotificationTemplate[]` |
| `createTemplate` | POST | `/notification-templates` | body | `NotificationTemplate` |
| `updateTemplate` | PATCH | `/notification-templates/:id` | body | `NotificationTemplate` |

### 8.31 Ticket Service — `src/services/ticket.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getAll` | GET | `/tickets?userId=&status=&priority=&page=&limit=` | query | `Ticket[]` |
| `getMyTickets` | GET | `/tickets/my-tickets?page=&limit=` | query | `Ticket[]` |
| `getById` | GET | `/tickets/:id` | — | `Ticket` |
| `create` | POST | `/tickets` | `{ subject, description, priority?, categoryId? }` | `Ticket` |
| `update` | PATCH | `/tickets/:id` | partial body | `Ticket` |
| `updateStatus` | PATCH | `/tickets/:id/status` | `{ status }` | `Ticket` |
| `assignTicket` | PATCH | `/tickets/:id/assign` | `{ assignedToId }` | `Ticket` |
| `getMessages` | GET | `/tickets/:id/messages` | — | `TicketMessage[]` |
| `addMessage` | POST | `/tickets/:id/messages` | `{ content, attachmentUrl? }` | `TicketMessage` |
| `getCategories` | GET | `/tickets/categories/all` | — | `TicketCategory[]` |
| `createCategory` | POST | `/tickets/categories` | `{ name, description? }` | `TicketCategory` |

### 8.32 Chat Service — `src/services/chat.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getConversations` | GET | `/chat/conversations` | — | `Conversation[]` |
| `getConversation` | GET | `/chat/conversations/:id` | — | `Conversation` |
| `createConversation` | POST | `/chat/conversations` | `{ participantIds, type? }` | `Conversation` |
| `getMessages` | GET | `/chat/conversations/:id/messages?page=&limit=` | query | `Message[]` |
| `sendMessage` | POST | `/chat/conversations/:id/messages` | `{ content, type? }` | `Message` |
| `markAsRead` | POST | `/chat/conversations/:id/read` | — | `void` |
| `getUnreadCount` | GET | `/chat/unread-count` | — | `{ count }` |

### 8.33 CMS Service — `src/services/cms.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getPages` | GET | `/cms/pages?isPublished=&page=&limit=` | query | `Page[]` |
| `getPublishedPages` | GET | `/cms/pages/published` | query | `Page[]` |
| `getPageBySlug` | GET | `/cms/pages/slug/:slug` | — | `Page` |
| `getPage` | GET | `/cms/pages/:id` | — | `Page` |
| `createPage` | POST | `/cms/pages` | `{ title, slug, content, metaTitle?, metaDescription? }` | `Page` |
| `updatePage` | PATCH | `/cms/pages/:id` | partial body | `Page` |
| `deletePage` | DELETE | `/cms/pages/:id` | — | `void` |
| `publishPage` | POST | `/cms/pages/:id/publish` | — | `void` |
| `unpublishPage` | POST | `/cms/pages/:id/unpublish` | — | `void` |
| `getBanners` | GET | `/cms/banners?isActive=&position=&page=&limit=` | query | `Banner[]` |
| `getActiveBanners` | GET | `/cms/banners/active/:position` | — | `Banner[]` |
| `getBanner` | GET | `/cms/banners/:id` | — | `Banner` |
| `createBanner` | POST | `/cms/banners` | `CreateBannerDto` | `Banner` |
| `updateBanner` | PATCH | `/cms/banners/:id` | partial body | `Banner` |
| `deleteBanner` | DELETE | `/cms/banners/:id` | — | `void` |
| `toggleBannerActive` | PATCH | `/cms/banners/:id/toggle-active` | — | `void` |

### 8.34 SEO Service — `src/services/seo.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getMetadata` | GET | `/seo/metadata?entityType=&page=&limit=` | query | `SeoMetadata[]` |
| `getMetadataById` | GET | `/seo/metadata/:id` | — | `SeoMetadata` |
| `getMetadataByEntity` | GET | `/seo/metadata/entity/:entityType/:entityId` | — | `SeoMetadata` |
| `createMetadata` | POST | `/seo/metadata` | body | `SeoMetadata` |
| `updateMetadata` | PATCH | `/seo/metadata/:id` | body | `SeoMetadata` |
| `deleteMetadata` | DELETE | `/seo/metadata/:id` | — | `void` |
| `upsertMetadata` | POST | `/seo/metadata/upsert/:entityType/:entityId` | body | `SeoMetadata` |
| `getRedirects` | GET | `/seo/redirects?isActive=&page=&limit=` | query | `UrlRedirect[]` |
| `createRedirect` | POST | `/seo/redirects` | body | `UrlRedirect` |
| `bulkCreateRedirects` | POST | `/seo/redirects/bulk` | body[] | `UrlRedirect[]` |
| `updateRedirect` | PATCH | `/seo/redirects/:id` | body | `UrlRedirect` |
| `deleteRedirect` | DELETE | `/seo/redirects/:id` | — | `void` |
| `toggleRedirectActive` | PATCH | `/seo/redirects/:id/toggle-active` | — | `void` |

### 8.35 Subscription Service — `src/services/subscription.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getAll` | GET | `/subscriptions?status=&page=&limit=` | query | `Subscription[]` |
| `getMySubscriptions` | GET | `/subscriptions/my-subscriptions` | — | `Subscription[]` |
| `getDue` | GET | `/subscriptions/due` | — | `Subscription[]` |
| `getById` | GET | `/subscriptions/:id` | — | `Subscription` |
| `create` | POST | `/subscriptions` | `CreateSubscriptionDto` | `Subscription` |
| `update` | PATCH | `/subscriptions/:id` | partial body | `Subscription` |
| `cancel` | POST | `/subscriptions/:id/cancel` | `{ reason? }` | `void` |
| `pause` | POST | `/subscriptions/:id/pause` | — | `void` |
| `resume` | POST | `/subscriptions/:id/resume` | — | `void` |
| `processRenewal` | POST | `/subscriptions/:id/renew` | — | `void` |
| `getOrders` | GET | `/subscriptions/:id/orders` | — | `SubscriptionOrder[]` |

### 8.36 Search Service — `src/services/search.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `saveHistory` | POST | `/search/history` | `{ query }` | `void` |
| `getHistory` | GET | `/search/history?limit=` | query | `SearchHistory[]` |
| `clearHistory` | DELETE | `/search/history` | — | `void` |
| `addRecentlyViewed` | POST | `/search/recently-viewed/:productId` | — | `void` |
| `getRecentlyViewed` | GET | `/search/recently-viewed?limit=` | query | `RecentlyViewed[]` |
| `addToCompare` | POST | `/search/compare/:productId` | — | `void` |
| `getCompare` | GET | `/search/compare` | — | `ProductComparison[]` |
| `removeFromCompare` | DELETE | `/search/compare/:productId` | — | `void` |
| `getRecommendations` | GET | `/search/recommendations?productId=` | query | `ProductRecommendation[]` |

### 8.37 I18n Service — `src/services/i18n.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getLanguages` | GET | `/i18n/languages?isActive=` | query | `Language[]` |
| `getActiveLanguages` | GET | `/i18n/languages/active` | — | `Language[]` |
| `getLanguageByCode` | GET | `/i18n/languages/code/:code` | — | `Language` |
| `createLanguage` | POST | `/i18n/languages` | body | `Language` |
| `updateLanguage` | PATCH | `/i18n/languages/:id` | body | `Language` |
| `deleteLanguage` | DELETE | `/i18n/languages/:id` | — | `void` |
| `setDefaultLanguage` | POST | `/i18n/languages/:id/set-default` | — | `void` |
| `getCurrencies` | GET | `/i18n/currencies?isActive=` | query | `Currency[]` |
| `getActiveCurrencies` | GET | `/i18n/currencies/active` | — | `Currency[]` |
| `getCurrencyByCode` | GET | `/i18n/currencies/code/:code` | — | `Currency` |
| `convertAmount` | GET | `/i18n/currencies/convert?amount=&from=&to=` | query | `{ amount }` |
| `createCurrency` | POST | `/i18n/currencies` | body | `Currency` |
| `updateCurrency` | PATCH | `/i18n/currencies/:id` | body | `Currency` |
| `deleteCurrency` | DELETE | `/i18n/currencies/:id` | — | `void` |
| `setDefaultCurrency` | POST | `/i18n/currencies/:id/set-default` | — | `void` |
| `getRateHistory` | GET | `/i18n/currencies/:id/rate-history?limit=` | query | `CurrencyRateHistory[]` |
| `getTranslations` | GET | `/i18n/translations?languageId=&entityType=&entityId=` | query | `Translation[]` |
| `createTranslation` | POST | `/i18n/translations` | body | `Translation` |
| `updateTranslation` | PATCH | `/i18n/translations/:id` | body | `Translation` |
| `deleteTranslation` | DELETE | `/i18n/translations/:id` | — | `void` |
| `upsertTranslation` | POST | `/i18n/translations/upsert` | `{ languageId, entityType, entityId, field, value }` | `void` |

### 8.38 Audit Service — `src/services/audit.service.ts`

| Function | Method | Endpoint | Body/Params | Return Type |
|---|---|---|---|---|
| `getLogs` | GET | `/audit/logs?userId=&action=&entityType=&startDate=&endDate=&page=&limit=` | query | `AuditLog[]` |
| `getLogById` | GET | `/audit/logs/:id` | — | `AuditLog` |
| `getUserLogs` | GET | `/audit/logs/user/:userId` | query | `AuditLog[]` |
| `getEntityHistory` | GET | `/audit/logs/entity/:entityType/:entityId` | — | `AuditLog[]` |
| `cleanupLogs` | POST | `/audit/logs/cleanup` | `{ daysToKeep? }` | `void` |
| `getActivityLogs` | GET | `/audit/activity?userId=&activityType=&startDate=&endDate=&page=&limit=` | query | `ActivityLog[]` |
| `getMyActivity` | GET | `/audit/activity/my-activity?days=` | query | `ActivitySummary` |
| `getUserSummary` | GET | `/audit/activity/user/:userId/summary?days=` | query | `ActivitySummary` |

### 8.39 Operations Service — `src/services/operations.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getBulkOperations` | GET | `/operations/bulk?status=&operationType=&page=&limit=` | query | `BulkOperation[]` |
| `getBulkOperation` | GET | `/operations/bulk/:id` | — | `BulkOperation` |
| `createBulkOperation` | POST | `/operations/bulk` | body | `BulkOperation` |
| `updateProgress` | PATCH | `/operations/bulk/:id/progress` | `{ successCount, failureCount? }` | `void` |
| `cancelBulkOp` | POST | `/operations/bulk/:id/cancel` | — | `void` |
| `getJobs` | GET | `/operations/jobs?type=&status=&userId=&page=&limit=` | query | `ImportExportJob[]` |
| `getMyJobs` | GET | `/operations/jobs/my-jobs?jobType=` | query | `ImportExportJob[]` |
| `getJob` | GET | `/operations/jobs/:id` | — | `ImportExportJob` |
| `createJob` | POST | `/operations/jobs` | body | `ImportExportJob` |
| `completeJob` | POST | `/operations/jobs/:id/complete` | `{ resultFileUrl? }` | `void` |
| `failJob` | POST | `/operations/jobs/:id/fail` | `{ errorMessage, errorDetails? }` | `void` |

### 8.40 System Service — `src/services/system.service.ts`

| Function | Method | Endpoint | Body | Return Type |
|---|---|---|---|---|
| `getSettings` | GET | `/system/settings?group=` | query | `SystemSetting[]` |
| `getSettingsByGroup` | GET | `/system/settings/group/:group` | — | `SystemSetting[]` |
| `getSettingByKey` | GET | `/system/settings/key/:key` | — | `SystemSetting` |
| `getSetting` | GET | `/system/settings/:id` | — | `SystemSetting` |
| `createSetting` | POST | `/system/settings` | `{ key, value, group?, description? }` | `SystemSetting` |
| `updateSetting` | PATCH | `/system/settings/:id` | partial body | `SystemSetting` |
| `updateSettingByKey` | PATCH | `/system/settings/key/:key` | `{ value }` | `SystemSetting` |
| `bulkUpdateSettings` | POST | `/system/settings/bulk` | `[{ key, value }]` | `void` |
| `deleteSetting` | DELETE | `/system/settings/:id` | — | `void` |
| `getFeatureFlags` | GET | `/system/features` | — | `FeatureFlag[]` |
| `getEnabledFeatures` | GET | `/system/features/enabled` | — | `FeatureFlag[]` |
| `getFeatureFlag` | GET | `/system/features/:id` | — | `FeatureFlag` |
| `createFeatureFlag` | POST | `/system/features` | `{ name, key, isEnabled?, description? }` | `FeatureFlag` |
| `updateFeatureFlag` | PATCH | `/system/features/:id` | partial body | `FeatureFlag` |
| `toggleFeatureFlag` | PATCH | `/system/features/:id/toggle` | — | `FeatureFlag` |
| `deleteFeatureFlag` | DELETE | `/system/features/:id` | — | `void` |
| `healthCheck` | GET | `/health` | — | `HealthStatus` |

---

## 9. State Management Guide

### Global State (Zustand)

Only data that needs to persist across page navigations should be in Zustand:

| Store | State Shape | Purpose |
|---|---|---|
| `authStore` | `{ user, accessToken, refreshToken, isAuthenticated }` | Authentication state |
| `cartStore` | `{ items, total, itemCount }` | Cart state (synced with backend `GET /cart`) |
| `notificationStore` | `{ unreadCount }` | Notification badge count |

### Server State (React Query)

All API data uses React Query. Key patterns:

```typescript
// Fetching data
const { data, isLoading, error } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => productService.getAll(filters),
});

// Mutating data
const mutation = useMutation({
  mutationFn: productService.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    toast.success('Product created');
  },
});
```

### Cart Sync Strategy

```typescript
// src/stores/cart.store.ts
import { create } from 'zustand';

interface CartStore {
  itemCount: number;
  setItemCount: (count: number) => void;
}

export const useCartStore = create<CartStore>((set) => ({
  itemCount: 0,
  setItemCount: (count) => set({ itemCount: count }),
}));
```

After every cart mutation (add/update/remove item), invalidate the cart query:

```typescript
queryClient.invalidateQueries({ queryKey: ['cart'] });
```

---

## 10. Routing Structure

### Complete Route Map

```typescript
// src/App.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load all pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
// ... all other pages

const router = createBrowserRouter([
  // ===== AUTH ROUTES (no layout) =====
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },

  // ===== CUSTOMER ROUTES =====
  {
    element: <CustomerLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/products', element: <ProductListPage /> },
      { path: '/products/:slug', element: <ProductDetailPage /> },
      { path: '/categories/:slug', element: <CategoryPage /> },
      { path: '/brands/:slug', element: <BrandPage /> },
      { path: '/search', element: <SearchResultsPage /> },
      { path: '/bundles/:slug', element: <BundleDetailPage /> },

      // Protected customer routes
      {
        element: <ProtectedRoute allowedRoles={['customer', 'seller', 'admin', 'super_admin']} />,
        children: [
          { path: '/cart', element: <CartPage /> },
          { path: '/wishlist', element: <WishlistPage /> },
          { path: '/checkout', element: <CheckoutPage /> },
          { path: '/orders/:id/confirmation', element: <OrderConfirmationPage /> },
          { path: '/my-orders', element: <MyOrdersPage /> },
          { path: '/my-orders/:id', element: <OrderDetailPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/addresses', element: <AddressesPage /> },
          { path: '/my-reviews', element: <MyReviewsPage /> },
          { path: '/my-returns', element: <MyReturnsPage /> },
          { path: '/my-disputes', element: <MyDisputesPage /> },
          { path: '/loyalty', element: <LoyaltyPage /> },
          { path: '/referrals', element: <ReferralsPage /> },
          { path: '/notifications', element: <NotificationsPage /> },
          { path: '/tickets', element: <TicketsPage /> },
          { path: '/chat', element: <ChatPage /> },
          { path: '/subscriptions', element: <SubscriptionsPage /> },
        ],
      },
    ],
  },

  // ===== SELLER ROUTES =====
  {
    element: <ProtectedRoute allowedRoles={['seller', 'admin', 'super_admin']} />,
    children: [
      {
        element: <SellerLayout />,
        children: [
          { path: '/seller', element: <SellerDashboardPage /> },
          { path: '/seller/store', element: <StoreManagementPage /> },
          { path: '/seller/products', element: <SellerProductsPage /> },
          { path: '/seller/products/new', element: <ProductFormPage /> },
          { path: '/seller/products/:id/edit', element: <ProductFormPage /> },
          { path: '/seller/products/:id/variants', element: <VariantsPage /> },
          { path: '/seller/products/:id/images', element: <ImagesPage /> },
          { path: '/seller/inventory', element: <InventoryPage /> },
          { path: '/seller/orders', element: <SellerOrdersPage /> },
          { path: '/seller/shipments', element: <ShipmentsPage /> },
          { path: '/seller/returns', element: <SellerReturnsPage /> },
          { path: '/seller/disputes', element: <SellerDisputesPage /> },
          { path: '/seller/reviews', element: <SellerReviewsPage /> },
          { path: '/seller/wallet', element: <WalletPage /> },
          { path: '/seller/documents', element: <DocumentsPage /> },
          { path: '/seller/settings', element: <SellerSettingsPage /> },
        ],
      },
    ],
  },

  // ===== ADMIN ROUTES =====
  {
    element: <ProtectedRoute allowedRoles={['admin', 'super_admin']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin', element: <AdminDashboardPage /> },
          { path: '/admin/users', element: <UsersPage /> },
          { path: '/admin/sellers', element: <SellersPage /> },
          { path: '/admin/categories', element: <CategoriesPage /> },
          { path: '/admin/brands', element: <BrandsPage /> },
          { path: '/admin/attributes', element: <AttributesPage /> },
          { path: '/admin/products', element: <AdminProductsPage /> },
          { path: '/admin/orders', element: <AdminOrdersPage /> },
          { path: '/admin/payments', element: <PaymentsPage /> },
          { path: '/admin/refunds', element: <RefundsPage /> },
          { path: '/admin/returns', element: <AdminReturnsPage /> },
          { path: '/admin/disputes', element: <AdminDisputesPage /> },
          { path: '/admin/reviews', element: <AdminReviewsPage /> },
          { path: '/admin/campaigns', element: <CampaignsPage /> },
          { path: '/admin/flash-sales', element: <FlashSalesPage /> },
          { path: '/admin/vouchers', element: <VouchersPage /> },
          { path: '/admin/shipping', element: <ShippingPage /> },
          { path: '/admin/tax', element: <TaxPage /> },
          { path: '/admin/loyalty-tiers', element: <LoyaltyTiersPage /> },
          { path: '/admin/notifications', element: <AdminNotificationsPage /> },
          { path: '/admin/tickets', element: <AdminTicketsPage /> },
          { path: '/admin/cms', element: <CmsPage /> },
          { path: '/admin/seo', element: <SeoPage /> },
          { path: '/admin/subscriptions', element: <AdminSubscriptionsPage /> },
          { path: '/admin/bundles', element: <BundlesPage /> },
          { path: '/admin/audit-logs', element: <AuditLogsPage /> },
          { path: '/admin/i18n', element: <I18nPage /> },
          { path: '/admin/warehouses', element: <WarehousesPage /> },
        ],
      },
    ],
  },

  // ===== SUPER ADMIN ROUTES =====
  {
    element: <ProtectedRoute allowedRoles={['super_admin']} />,
    children: [
      {
        element: <SuperAdminLayout />,
        children: [
          { path: '/super-admin/roles', element: <RolesPage /> },
          { path: '/super-admin/permissions', element: <PermissionsPage /> },
          { path: '/super-admin/role-permissions', element: <RolePermissionsPage /> },
          { path: '/super-admin/settings', element: <SystemSettingsPage /> },
          { path: '/super-admin/features', element: <FeatureFlagsPage /> },
          { path: '/super-admin/operations', element: <OperationsPage /> },
          { path: '/super-admin/health', element: <HealthPage /> },
        ],
      },
    ],
  },

  // ===== ERROR ROUTES =====
  { path: '/unauthorized', element: <UnauthorizedPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
```

---

## 11. Reusable Components Library

| Component | Purpose | Key Props | Used In |
|---|---|---|---|
| `DataTable` | Sortable, filterable, paginated table | `columns`, `data`, `isLoading`, `pagination`, `onSort`, `onFilter` | All admin/seller list pages |
| `Pagination` | Page navigation controls | `currentPage`, `totalPages`, `onPageChange` | All list pages |
| `LoadingSpinner` | Full-page or inline spinner | `size?`, `className?` | All pages during loading |
| `EmptyState` | No data display with icon and message | `icon`, `title`, `description`, `action?` | All list pages |
| `ErrorBoundary` | React error boundary | `fallback?` | App root wrapper |
| `ConfirmDialog` | Confirm destructive actions | `title`, `description`, `onConfirm`, `open`, `onOpenChange` | Delete actions |
| `StatusBadge` | Color-coded status pill | `status`, `variant?` | Orders, returns, disputes, payments |
| `PriceDisplay` | Currency-formatted price | `amount`, `currency?`, `originalAmount?` | Products, cart, orders |
| `StarRating` | Star rating input and display | `value`, `onChange?`, `readonly?`, `size?` | Reviews, product detail |
| `ImageGallery` | Product image carousel with zoom | `images`, `onImageClick?` | Product detail page |
| `FileUpload` | Drag-and-drop file upload | `onUpload`, `accept?`, `maxSize?`, `multiple?` | Seller documents, CMS, evidence upload |
| `Breadcrumb` | Navigation breadcrumb trail | `items: { label, href }[]` | All pages |
| `SearchInput` | Debounced search input | `value`, `onChange`, `placeholder?`, `delay?` | Product listing, admin tables |
| `DatePicker` | Date selection component | `value`, `onChange`, `placeholder?` | Campaign forms, date filters |
| `RichTextEditor` | WYSIWYG text editor | `value`, `onChange` | CMS pages, product descriptions |
| `FormField` | Form field wrapper with label and error | `label`, `error?`, `required?`, `children` | All forms |
| `Avatar` | User/store avatar | `src?`, `name`, `size?` | User lists, chat |
| `Badge` | Small label/tag | `variant`, `children` | Status indicators |

---

## 12. Form Validation Reference

All validation rules match backend DTOs exactly. Use Zod schemas:

### Auth Forms

```typescript
// Register
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().email('Please provide a valid email address').max(150),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase, and number'),
  phone: z.string().max(20).optional(),
});

// Login
const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1, 'Password is required').max(255),
});

// Reset Password  
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string()
    .min(8).max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase, and number'),
});
```

### Product Form

```typescript
const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  stock: z.number().int().min(0).optional(),
  categoryId: z.string().uuid('Must select a category'),
  brandId: z.string().uuid().optional(),
  sellerId: z.string().uuid('Seller is required'),
});
```

### Order Form

```typescript
const shippingAddressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone is required'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().optional(),
  streetAddress: z.string().min(1, 'Street address is required'),
});

const orderSchema = z.object({
  storeId: z.string().uuid(),
  subtotal: z.number().min(0),
  totalAmount: z.number().min(0),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(['cod', 'credit_card', 'debit_card', 'jazzcash', 'easypaisa', 'bank_transfer', 'wallet']),
  shippingMethod: z.string().min(1),
  currencyCode: z.string().default('PKR'),
});
```

### Review Form

```typescript
const reviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  content: z.string().max(2000).optional(),
});
```

### Category Form

```typescript
const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  parentId: z.string().uuid().optional().nullable(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
});
```

### Displaying Backend Validation Errors on Forms

```typescript
import { useForm } from 'react-hook-form';
import { AxiosError } from 'axios';

// In the mutation's onError callback:
onError: (error: AxiosError<{ message: string | string[] }>) => {
  const messages = error.response?.data?.message;
  if (Array.isArray(messages)) {
    messages.forEach((msg) => {
      // Parse field name from message like "name must be a string"
      const field = msg.split(' ')[0];
      if (form.getValues(field as any) !== undefined) {
        form.setError(field as any, { message: msg });
      }
    });
  } else if (typeof messages === 'string') {
    toast.error(messages);
  }
}
```

---

## 13. Complete Business Flow Implementations

### 13.1 Customer Registration & Login

1. User opens `/register` → fills form (name, email, password, phone)
2. `POST /auth/register` → receives `{ accessToken, refreshToken, user }`
3. Store in `authStore` → redirect to `/`
4. For login: `POST /auth/login` → same flow
5. On token expiry: Axios interceptor calls `POST /auth/refresh` → retries failed request
6. On logout: `POST /auth/logout` with refreshToken → clear `authStore` → redirect `/login`

### 13.2 Product Browsing, Filtering & Search

1. User opens `/products` → `GET /products?page=1&limit=20`
2. Selects category filter → `GET /products?categoryId=xxx&page=1`
3. Selects brand filter → adds `brandId=` to query
4. Searches → `GET /products?search=phone` (if backend supports) or client-side filter
5. Sorts → Re-fetch with sort params
6. Pagination → Update `page` param
7. Product click → navigate to `/products/:slug`
8. Search history → `POST /search/history` with query → `GET /search/history` for suggestions
9. Recently viewed → `POST /search/recently-viewed/:productId` on product page visit

### 13.3 Add to Cart & Checkout Flow

1. Product detail page → click "Add to Cart" → `POST /cart/items` with `{ productId, quantity }`
2. Navigate to `/cart` → `GET /cart` → display items
3. Update quantity → `PATCH /cart/items/:id` with `{ quantity }`
4. Click "Checkout" → `POST /checkout/session` with `{ cartId }` → navigate to `/checkout`
5. Step 1: Enter shipping address
6. Step 2: Select shipping method → `POST /shipping/calculate` with zone + weight
7. Step 3: Select payment method → show saved methods from `GET /payment-methods`
8. Step 4: Apply voucher → `POST /marketing/vouchers/validate` → `POST /marketing/vouchers/apply`
9. Step 5: Review order → `POST /checkout/session/:id/complete`
10. Create order → `POST /orders` → redirect to `/orders/:id/confirmation`

### 13.4 Order Tracking & Shipment Flow

1. My Orders page → `GET /orders/my-orders`
2. Click order → `GET /orders/:id` + `GET /orders/:id/status-history`
3. View shipments → `GET /orders/:orderId/shipments`
4. Track shipment → `GET /shipments/track/:trackingNumber`
5. Status timeline shows: pending → confirmed → processing → shipped → delivered

### 13.5 Return & Refund Request Flow

1. Order detail page → click "Request Return" → opens return form
2. Fill form → `POST /returns` with `{ orderId, orderItemId, type, quantity, reasonDetails }`
3. View return status → `GET /returns?userId=:myId`
4. Upload return images → `POST /returns/:id/images`
5. Admin reviews → `PATCH /returns/:id/status` with `{ status: 'approved' }`
6. Refund processed → `POST /refunds` with `{ paymentId, amount, reasonDetails }`

### 13.6 Dispute Creation & Resolution

1. Order detail → "File Dispute" → opens dispute form
2. `POST /disputes` with `{ orderId, type, subject, description }`
3. View dispute → `GET /disputes/:id`
4. Send messages → `POST /disputes/:id/messages`
5. Upload evidence → `POST /disputes/:id/evidence`
6. Admin resolves → `PATCH /disputes/:id/status` with `{ status: 'resolved', resolution: 'refund_buyer' }`

### 13.7 Review Submission

1. Product detail or order detail → "Write Review"
2. `POST /reviews` with `{ productId, rating, title, content }`
3. View my reviews → `GET /reviews?userId=:myId`
4. Edit review → `PATCH /reviews/:id`
5. Other users → mark helpful `POST /reviews/:id/helpful` with `{ isHelpful: true }`
6. Report review → `POST /reviews/:id/report` with `{ reason }`

### 13.8 Voucher & Loyalty Points Flow

1. Checkout page → enter voucher code
2. `POST /marketing/vouchers/validate` with `{ code, orderTotal }`
3. If valid → `POST /marketing/vouchers/apply` with `{ code, orderId }`
4. Loyalty points: view balance → `GET /loyalty/points`
5. Redeem at checkout → `POST /loyalty/points/redeem` with `{ points, orderId }`
6. Points earned after order → automatic via backend
7. Referral code → `GET /loyalty/referral-code` → share code
8. Apply referral → `POST /loyalty/referral/apply` with `{ code }`

### 13.9 Seller Onboarding

1. Register as user (customer) → login
2. Navigate to `/seller` → "Become a Seller" prompt
3. `POST /sellers` with `{ userId, businessName }` → creates seller profile
4. Upload documents → `POST /sellers/:id/documents`
5. Create store → `POST /sellers/:sellerId/stores` with `{ name, slug }`
6. Admin reviews → approves via `PATCH /sellers/:id`
7. Seller can now create products

### 13.10 Seller Product & Inventory Management

1. `/seller/products` → `GET /products?sellerId=:mySellerId`
2. Create product → fill form → `POST /products`
3. Add variants → `POST /products/:id/variants`
4. Add images → `POST /products/:id/images`
5. Set stock → `POST /inventory/adjust` with `{ productId, warehouseId, adjustment, reason }`
6. Monitor stock → `GET /inventory/product/:productId`
7. View movements → `GET /inventory/movements/:productId`

### 13.11 Admin Moderation Flow

1. Admin dashboard → pending reviews/products/sellers
2. Review products: `GET /products?status=pending_review` → `PATCH /products/:id/status` with `{ status: 'active' }`
3. Moderate reviews: `GET /reviews?status=pending` → `PATCH /reviews/:id/status`
4. Manage sellers: verify documents, approve/suspend

### 13.12 Super Admin Role/Permission Management

1. `/super-admin/roles` → `GET /roles` → view all roles
2. Create role → `POST /roles` with `{ name, description }`
3. `GET /permissions` → list all permissions
4. Create permission → `POST /permissions` with `{ roleId, module, action }`
5. Assign permissions → `POST /role-permissions/:roleId` with `{ permissionIds }`
6. View role permissions → `GET /role-permissions/:roleId`
7. Remove permission → `DELETE /role-permissions/:roleId/:permissionId`

---

## 14. Error Handling & Loading States

### Global Error Handling

```typescript
// src/components/shared/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground mt-2">{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-primary">
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### HTTP Error Handling Strategy

| Status Code | Handling |
|---|---|
| 400 | Display validation errors inline on form fields |
| 401 | Auto-refresh token; if fails → redirect to `/login` |
| 403 | Show "Access Denied" page or toast |
| 404 | Show "Not Found" page or toast |
| 409 | Show conflict message (e.g., "Email already exists") |
| 429 | Show "Too many requests" toast with retry timer |
| 500 | Show generic error toast "Server error. Please try again." |

### Loading Skeletons

```typescript
// Use shadcn/ui Skeleton component
import { Skeleton } from '@/components/ui/skeleton';

function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-6 w-1/3" />
    </div>
  );
}
```

### Toast Notifications (Sonner)

```typescript
import { toast } from 'sonner';

// Success
toast.success('Product created successfully');

// Error
toast.error('Failed to create product');

// Loading
const toastId = toast.loading('Processing...');
toast.dismiss(toastId);
```

---

## 15. Security Best Practices

### Token Storage

| Approach | accessToken | refreshToken |
|---|---|---|
| **Recommended (SPA)** | Zustand memory (non-persisted) | `localStorage` with `persist` middleware |
| **Production** | Same | `httpOnly` cookie (requires backend support) |

The current Zustand setup persists only `refreshToken` and `user` to `localStorage`. The `accessToken` is kept in memory and re-obtained via the refresh flow on page reload.

### XSS Prevention

- Use React's built-in JSX escaping (never use `dangerouslySetInnerHTML` with user content)
- Sanitize any HTML content before rendering (use DOMPurify for CMS content)
- Set `Content-Security-Policy` headers

### CSRF Prevention

- API uses Bearer token authentication (not cookies), so CSRF doesn't apply to most flows
- For cookie-based auth in production, include a CSRF token

### Input Sanitization

- All text inputs are validated with Zod schemas before submission
- Backend validates with class-validator decorators
- Trim whitespace on email and name fields (matches backend `@Transform`)
- Never trust client-side validation alone

### Route Guards

- Every protected route is wrapped with `<ProtectedRoute allowedRoles={[...]} />`
- Backend independently validates JWT + role + permissions on every request
- Frontend guards are for UX only; security is enforced server-side

---

## 16. Performance Optimization

### Route-Level Code Splitting

```typescript
const ProductDetailPage = lazy(() => import('@/pages/customer/ProductDetailPage'));
// Wrap in <Suspense> with a loading fallback
<Suspense fallback={<LoadingSpinner />}>
  <ProductDetailPage />
</Suspense>
```

### React Query Caching

```typescript
// Products list: stale after 5 min, garbage collected after 10 min
useQuery({
  queryKey: ['products', filters],
  queryFn: () => productService.getAll(filters),
  staleTime: 5 * 60 * 1000,
});

// User profile: stale after 10 min (rarely changes)
useQuery({
  queryKey: ['user', 'me'],
  queryFn: () => userService.getMe(),
  staleTime: 10 * 60 * 1000,
});

// Cart: always fresh (staleTime: 0)
useQuery({
  queryKey: ['cart'],
  queryFn: () => cartService.getCart(),
  staleTime: 0,
});
```

### Image Optimization

- Use `loading="lazy"` on all `<img>` tags below the fold
- Use `srcset` for responsive images
- Serve images via CDN
- Use WebP format where possible
- Product images: show thumbnail in lists, full-size on detail page

### Pagination vs Infinite Scroll

- **Admin tables**: Use traditional pagination (page numbers) — `DataTable` with `Pagination`
- **Product listings**: Support both grid pagination and "Load More" button
- **Chat messages**: Use infinite scroll with reverse order (newest at bottom)

---

## 17. Deployment

### Build for Production

```bash
npm run build
```

This generates optimized static files in the `dist/` folder.

### Environment Configuration

Create `.env.production`:

```env
VITE_API_BASE_URL=https://api.labverse.org
VITE_APP_NAME=LabVerse
VITE_APP_VERSION=1.0.0
```

### Deployment Platforms

| Platform | Command | Notes |
|---|---|---|
| **Vercel** | `vercel --prod` | Automatic CI/CD, zero config for Vite |
| **Netlify** | Drag `dist/` to UI or use CLI | Add `_redirects` file for SPA routing |
| **AWS S3 + CloudFront** | Upload `dist/` to S3, serve via CloudFront | Best performance, most control |
| **Docker** | Build with nginx image | Use `nginx.conf` with SPA fallback |

### SPA Routing Configuration

For all deployment platforms, configure the web server to serve `index.html` for all routes:

**Netlify `_redirects`:**
```
/*    /index.html   200
```

**Nginx config:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Vercel `vercel.json`:**
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### API Base URL per Environment

The `VITE_API_BASE_URL` environment variable is baked into the build at compile time. Set it per environment:

- **Development**: `http://localhost:3001`
- **Staging**: `https://api-staging.labverse.org`
- **Production**: `https://api.labverse.org`

---

## Appendix: Backend Enums Reference

These enums must be mirrored exactly in `src/types/enums.ts`:

```typescript
// User & Auth
export enum UserRole { CUSTOMER='customer', SELLER='seller', ADMIN='admin', SUPER_ADMIN='super_admin' }
export enum Gender { MALE='male', FEMALE='female', OTHER='other', PREFER_NOT_TO_SAY='prefer_not_to_say' }

// Product
export enum ProductStatus { DRAFT='draft', PENDING_REVIEW='pending_review', ACTIVE='active', PUBLISHED='published', INACTIVE='inactive', OUT_OF_STOCK='out_of_stock', DISCONTINUED='discontinued', REJECTED='rejected' }
export enum AttributeType { TEXT='text', NUMBER='number', BOOLEAN='boolean', SELECT='select', MULTI_SELECT='multi_select', COLOR='color', DATE='date' }

// Order
export enum OrderStatus { PENDING_PAYMENT='pending_payment', PENDING='pending', CONFIRMED='confirmed', PROCESSING='processing', PARTIALLY_SHIPPED='partially_shipped', SHIPPED='shipped', OUT_FOR_DELIVERY='out_for_delivery', DELIVERED='delivered', COMPLETED='completed', CANCELLED='cancelled', PARTIALLY_CANCELLED='partially_cancelled', REFUNDED='refunded', PARTIALLY_REFUNDED='partially_refunded' }
export enum OrderItemStatus { PENDING='pending', CONFIRMED='confirmed', PROCESSING='processing', SHIPPED='shipped', DELIVERED='delivered', CANCELLED='cancelled', RETURNED='returned', REFUNDED='refunded', EXCHANGED='exchanged' }

// Payment
export enum PaymentMethod { COD='cod', CREDIT_CARD='credit_card', DEBIT_CARD='debit_card', JAZZCASH='jazzcash', EASYPAISA='easypaisa', BANK_TRANSFER='bank_transfer', WALLET='wallet', LOYALTY_POINTS='loyalty_points' }
export enum PaymentStatus { PENDING='pending', AUTHORIZED='authorized', CAPTURED='captured', PAID='paid', COMPLETED='completed', FAILED='failed', CANCELLED='cancelled', REFUNDED='refunded', PARTIALLY_REFUNDED='partially_refunded' }
export enum RefundStatus { PENDING='pending', REQUESTED='requested', APPROVED='approved', REJECTED='rejected', PROCESSING='processing', PROCESSED='processed', COMPLETED='completed', FAILED='failed' }

// Shipping
export enum ShipmentStatus { PENDING='pending', LABEL_CREATED='label_created', PICKED_UP='picked_up', DISPATCHED='dispatched', IN_TRANSIT='in_transit', OUT_FOR_DELIVERY='out_for_delivery', DELIVERED='delivered', FAILED_DELIVERY='failed_delivery', RETURNED_TO_SENDER='returned_to_sender', SHIPPED='shipped' }
export enum ShippingRateType { FLAT='flat', WEIGHT_BASED='weight_based', PRICE_BASED='price_based', ITEM_BASED='item_based', FREE='free' }

// Returns
export enum ReturnType { RETURN='return', EXCHANGE='exchange' }
export enum ReturnStatus { REQUESTED='requested', APPROVED='approved', REJECTED='rejected', ITEM_SHIPPED='item_shipped', ITEM_RECEIVED='item_received', INSPECTING='inspecting', REFUND_PROCESSED='refund_processed', EXCHANGED='exchanged', CLOSED='closed', PENDING='pending', COMPLETED='completed' }

// Disputes
export enum DisputeType { ITEM_NOT_RECEIVED='item_not_received', ITEM_NOT_AS_DESCRIBED='item_not_as_described', COUNTERFEIT='counterfeit', SELLER_NOT_RESPONDING='seller_not_responding', WRONG_ITEM='wrong_item', DAMAGED_ITEM='damaged_item', MISSING_PARTS='missing_parts', OTHER='other' }
export enum DisputeStatus { OPEN='open', UNDER_REVIEW='under_review', ESCALATED='escalated', AWAITING_SELLER='awaiting_seller', AWAITING_BUYER='awaiting_buyer', RESOLVED='resolved', CLOSED='closed' }
export enum DisputeResolution { REFUND_BUYER='refund_buyer', SIDE_WITH_SELLER='side_with_seller', PARTIAL_REFUND='partial_refund', REPLACEMENT='replacement', MUTUAL_AGREEMENT='mutual_agreement', NO_ACTION='no_action' }

// Reviews
export enum ReviewStatus { PENDING='pending', APPROVED='approved', REJECTED='rejected', HIDDEN='hidden' }
export enum ReviewReportReason { SPAM='spam', INAPPROPRIATE='inappropriate', FAKE_REVIEW='fake_review', OFFENSIVE='offensive', IRRELEVANT='irrelevant', OTHER='other' }

// Marketing
export enum VoucherType { PERCENTAGE='percentage', FIXED_AMOUNT='fixed_amount', FREE_SHIPPING='free_shipping', BUY_X_GET_Y='buy_x_get_y' }
export enum CampaignType { SEASONAL='seasonal', FLASH_SALE='flash_sale', CLEARANCE='clearance', NEW_ARRIVAL='new_arrival', BUNDLE_DEAL='bundle_deal', SPECIAL_EVENT='special_event' }
export enum CampaignStatus { DRAFT='draft', SCHEDULED='scheduled', ACTIVE='active', PAUSED='paused', ENDED='ended', CANCELLED='cancelled' }

// Seller
export enum VerificationStatus { PENDING='pending', UNDER_REVIEW='under_review', APPROVED='approved', REJECTED='rejected', SUSPENDED='suspended' }
export enum SellerDocType { BUSINESS_LICENSE='business_license', TAX_CERTIFICATE='tax_certificate', ID_CARD='id_card', CNIC='cnic', BANK_STATEMENT='bank_statement', ADDRESS_PROOF='address_proof' }

// Loyalty
export enum LoyaltyTransactionType { EARNED='earned', REDEEMED='redeemed', EXPIRED='expired', ADJUSTED='adjusted', BONUS='bonus', REFERRAL_BONUS='referral_bonus', REFUND_REVERSAL='refund_reversal' }
export enum SubscriptionFrequency { WEEKLY='weekly', BIWEEKLY='biweekly', MONTHLY='monthly', BIMONTHLY='bimonthly', QUARTERLY='quarterly' }
export enum SubscriptionStatus { ACTIVE='active', PAUSED='paused', CANCELLED='cancelled', EXPIRED='expired' }

// Tickets
export enum TicketStatus { OPEN='open', IN_PROGRESS='in_progress', AWAITING_CUSTOMER='awaiting_customer', AWAITING_AGENT='awaiting_agent', ESCALATED='escalated', RESOLVED='resolved', CLOSED='closed', REOPENED='reopened' }
export enum TicketPriority { LOW='low', MEDIUM='medium', HIGH='high', URGENT='urgent' }

// Notifications
export enum NotificationType { ORDER_STATUS='order_status', PAYMENT_STATUS='payment_status', SHIPPING_UPDATE='shipping_update', PROMOTION='promotion', REVIEW_REQUEST='review_request', PRICE_DROP='price_drop', BACK_IN_STOCK='back_in_stock', SECURITY_ALERT='security_alert', SYSTEM='system', CHAT_MESSAGE='chat_message', SUPPORT_TICKET='support_ticket' }

// CMS
export enum BannerPosition { HOMEPAGE_HERO='homepage_hero', HOMEPAGE_MID='homepage_mid', HOMEPAGE_BOTTOM='homepage_bottom', CATEGORY_TOP='category_top', CATEGORY_SIDEBAR='category_sidebar', PRODUCT_SIDEBAR='product_sidebar', CHECKOUT_BANNER='checkout_banner', APP_SPLASH='app_splash', APP_POPUP='app_popup' }
export enum BannerLinkType { PRODUCT='product', CATEGORY='category', BRAND='brand', CAMPAIGN='campaign', STORE='store', PAGE='page', EXTERNAL='external' }

// Chat
export enum MessageType { TEXT='text', IMAGE='image', PRODUCT_LINK='product_link', ORDER_LINK='order_link', FILE='file', SYSTEM='system' }
export enum ConversationType { CUSTOMER_SELLER='customer_seller', CUSTOMER_SUPPORT='customer_support', SELLER_SUPPORT='seller_support' }

// Checkout
export enum CheckoutStep { CART_REVIEW='cart_review', ADDRESS='address', SHIPPING='shipping', PAYMENT='payment', REVIEW='review', COMPLETED='completed', ABANDONED='abandoned' }

// Inventory
export enum StockMovementType { PURCHASE='purchase', SALE='sale', RETURN='return', ADJUSTMENT_ADD='adjustment_add', ADJUSTMENT_SUBTRACT='adjustment_subtract', TRANSFER_IN='transfer_in', TRANSFER_OUT='transfer_out', RESERVATION='reservation', RESERVATION_RELEASE='reservation_release', DAMAGE='damage', EXPIRED='expired' }
export enum TransferStatus { PENDING='pending', APPROVED='approved', IN_TRANSIT='in_transit', COMPLETED='completed', CANCELLED='cancelled' }

// Wallet
export enum WalletTransactionType { CREDIT='credit', DEBIT='debit', WITHDRAWAL='withdrawal', REFUND_CREDIT='refund_credit', COMMISSION_DEDUCTION='commission_deduction', PAYOUT='payout', ADJUSTMENT='adjustment', BONUS='bonus' }

// Bulk Operations
export enum BulkOperationType { PRICE_UPDATE='price_update', STOCK_UPDATE='stock_update', STATUS_UPDATE='status_update', CATEGORY_UPDATE='category_update', DELETE='delete', ACTIVATE='activate', DEACTIVATE='deactivate' }
export enum JobStatus { PENDING='pending', PROCESSING='processing', COMPLETED='completed', FAILED='failed', CANCELLED='cancelled' }
```

---

*This document was generated from the complete LabVerse E-Commerce Backend codebase — 32 modules, 50+ controllers, 100+ DTOs, 80+ entities, and the full authentication/authorization system. Every endpoint, validation rule, and enum value has been verified against the actual source code.*
