# Seller Portal

A complete, production-ready seller portal for the ecommerce platform, built with the same stack and architecture as the Admin Portal.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 19, Vite 8 |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 (CSS-first) |
| State | Zustand v5 (auth, theme) |
| Server State | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| UI Primitives | Radix UI |
| Charts | Recharts |
| HTTP | Axios |
| Toasts | Sonner |
| Icons | Lucide React |

## Quick Start

```bash
cd frontend/seller-portal
npm install
npm run dev
```

The dev server starts on **http://localhost:3002** and proxies `/api` to `http://localhost:3001` (the NestJS backend).

## Project Structure

```
src/
├── App.tsx                 # Router, QueryClient, guards
├── main.tsx                # Entry point
├── index.css               # Tailwind + CSS variables
├── components/
│   ├── ui/                 # Radix UI primitives (button, dialog, input, etc.)
│   ├── shared/             # Reusable components (DataTable, PageHeader, etc.)
│   └── layout/             # AppLayout, AuthLayout, Sidebar, Header
├── config/
│   └── api.ts              # Axios instance with auth interceptors
├── hooks/
│   ├── useSellerProfile.ts # Fetches seller + store for current user
│   └── useSessionTimeout.ts
├── lib/                    # Utility functions (format, cn, api-error)
├── pages/                  # All page components (lazy-loaded)
├── providers/              # ThemeProvider
├── services/
│   └── api.ts              # All API service functions grouped by domain
├── store/
│   ├── auth.store.ts       # Zustand auth store (seller-auth)
│   └── theme.store.ts      # Zustand theme store (seller-theme)
└── types/
    └── index.ts            # TypeScript interfaces for all entities
```

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Email/password with seller role validation |
| `/register` | Register | Account creation with email verification |
| `/forgot-password` | ForgotPassword | Password reset request |
| `/reset-password` | ResetPassword | Token-based password reset |
| `/onboarding` | Onboarding | Multi-step: business info → store setup → branding → done |
| `/` | Dashboard | Stats, revenue chart, recent orders, low stock alerts |
| `/products` | Products | CRUD with inline form, variants, images tabs |
| `/products/:id` | ProductDetail | Redirects to products (inline editing) |
| `/inventory` | Inventory | Stock tracking with update dialog |
| `/orders` | Orders | Order list filtered by storeId |
| `/orders/:id` | OrderDetail | Items, shipments, tracking events, cancel |
| `/returns` | Returns | Return requests with detail sheet |
| `/earnings` | Earnings | Revenue stats, monthly chart, payment history |
| `/reviews` | Reviews | Star ratings, reply feature (PATCH /reviews/:id/reply) |
| `/chat` | Chat | Real-time messaging with thread list |
| `/notifications` | Notifications | Read/unread, mark all read, delete |
| `/settings/store` | StoreSettings | Name, slug, description, logo, banner |
| `/settings/account` | AccountSettings | Profile info, password change, logout |
| `/analytics` | Analytics | Revenue trends, order distribution, product stats |
| `/unauthorized` | Unauthorized | Access denied page |
| `*` | NotFound | 404 page |

## Auth Flow

1. User logs in with email/password
2. Backend returns JWT access token + opaque refresh token
3. Login page validates the user has a `seller` (or admin/super_admin) role
4. Tokens stored in Zustand (persisted to localStorage as `seller-auth`)
5. Axios interceptor injects Bearer token on every request
6. On 401, interceptor attempts refresh token rotation
7. 30-minute idle session timeout

## Backend Patches Applied

Three backend patches were applied to close API gaps:

1. **Orders storeId filter** — `GET /orders?storeId=` now joins order_items to filter by store
2. **Auto-assign seller role** — `POST /sellers` automatically assigns the `seller` role via UserRole
3. **Seller review reply** — `PATCH /reviews/:id/reply` lets sellers reply to reviews

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_NAME=Seller Portal
```

## Build

```bash
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

## Key Patterns

- **Seller-scoped queries**: All product/order queries include `storeId` from `useSellerProfile()` hook
- **QueryClient config**: 30s staleTime, no refetchOnWindowFocus, `shouldRetry` for error handling
- **Form validation**: Zod schemas with `zodResolver`, inline error messages
- **Modals**: Radix `Dialog` for create/edit, `ConfirmDialog` for destructive actions
- **Tables**: `DataTable` with TanStack Table, sorting, search, pagination, CSV/Excel/PDF export
- **Toasts**: `toast.success()` / `toast.error(getErrorMessage(err))` via Sonner
- **Theme**: Light/dark/system mode + color accents, persisted in `seller-theme` localStorage key
