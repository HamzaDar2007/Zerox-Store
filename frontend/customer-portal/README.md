# ShopVerse — Customer Portal

Premium e-commerce customer portal built with React 19, Vite 8, TypeScript 5.9, Tailwind CSS 4, Radix UI, TanStack Query, and Zustand. Design inspired by **Amazon + Daraz** fusion.

## Tech Stack

| Technology      | Purpose                    |
|-----------------|----------------------------|
| React 19        | UI framework               |
| Vite 8          | Build tool & dev server    |
| TypeScript 5.9  | Type safety                |
| Tailwind CSS 4  | Styling with @theme tokens |
| Radix UI        | Accessible UI primitives   |
| TanStack Query  | Server state management    |
| Zustand 5       | Client state management    |
| React Router 7  | Routing with lazy loading  |
| React Hook Form | Form management            |
| Zod 4           | Schema validation          |
| Embla Carousel  | Hero & product carousels   |
| Sonner          | Toast notifications        |
| Lucide React    | Icons                      |
| DOMPurify       | XSS sanitization           |

## Quick Start

```bash
cd frontend/customer-portal
npm install
npm run dev   # → http://localhost:3003
```

The dev server proxies `/api` to `http://localhost:3001` (NestJS backend).

## Project Structure

```
src/
├── components/
│   ├── cart/          # CartItemRow, CartSummary, CouponInput, EmptyCart
│   ├── checkout/      # StepIndicator, AddressStep, ShippingStep, PaymentStep, ReviewStep
│   ├── common/        # Breadcrumb, StarRating, PriceDisplay, QuantitySelector, etc.
│   ├── home/          # HeroBanner, CategoryStrip, FlashSaleSection, FeaturedSection, etc.
│   ├── layout/        # MainLayout, AuthLayout, CheckoutLayout, AccountLayout, Header, Footer
│   ├── order/         # OrderCard, TrackingTimeline, ReturnForm, InvoiceButton
│   ├── product/       # ProductCard, ProductGrid, ImageGallery, VariantSelector, Reviews, Filters
│   └── ui/            # Button, Input, Dialog, Sheet, Tabs, Select, Badge, etc. (Radix-based)
├── config/            # Axios instance with auth interceptors
├── constants/         # Routes, app config, sort options, payment methods
├── hooks/             # useAuth, useCart, useWishlist, useSearch, useProducts, useOrders, etc.
├── lib/               # Utilities: cn(), format, sanitize, validation schemas, api-error
├── pages/
│   ├── account/       # Profile, Orders, OrderDetail, Addresses, Wishlist, Notifications, etc.
│   ├── auth/          # Login, Register, ForgotPassword, ResetPassword
│   ├── CartPage.tsx
│   ├── CheckoutPage.tsx
│   ├── FlashSalePage.tsx
│   ├── HomePage.tsx
│   ├── OrderConfirmationPage.tsx
│   ├── ProductDetailPage.tsx
│   ├── ProductListingPage.tsx
│   └── StorePage.tsx
├── services/          # API service modules (auth, products, cart, orders, etc.)
├── store/             # Zustand stores (auth, cart, ui)
├── types/             # TypeScript interfaces for all domain entities
├── App.tsx            # Router with lazy-loaded routes
└── main.tsx           # Entry point
```

## Design System

- **Primary**: `#F57224` (Daraz Orange)
- **Navy**: `#131921` / `#232F3E` (Amazon Dark)
- **Accent**: `#FEBD69` (Gold)
- **Success**: `#007600`
- **Danger**: `#B12704`
- **Star**: `#FFA41C`
- **Background**: `#EAEDED` / `#F3F3F3`
- **Font**: Inter

## Architecture

- **Axios interceptors**: Bearer token injection, response envelope unwrapping, 401 refresh token rotation
- **Zustand + persist**: Auth tokens in `customer-auth`, cart in `customer-cart`, UI state in `customer-ui`
- **Lazy loading**: All pages are `React.lazy()` with `PageLoader` fallback
- **CVA**: Component variants for Button, Badge, etc.
- **Code splitting**: Vendor, TanStack Query, and Carousel in separate chunks

## Available Scripts

```bash
npm run dev       # Start dev server (port 3003)
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint check
```

## Environment Variables

| Variable            | Description                      | Default                  |
|---------------------|----------------------------------|--------------------------|
| VITE_API_BASE_URL   | Backend API base URL             | http://localhost:3001    |
| VITE_APP_NAME       | Application name                 | ShopVerse                |

## Backend Integration

The portal connects to the NestJS backend at `/api`. Key endpoint groups:

- `/auth` — Login, register, refresh, change/forgot/reset password
- `/users` — Profile CRUD, avatar upload
- `/products` — Listing, detail, variants, images, attributes
- `/cart` — Mine cart CRUD, add/update/remove items
- `/orders` — Create, list, detail, cancel
- `/payments` — Create payment, Stripe checkout
- `/wishlists` — Create, items CRUD
- `/reviews` — CRUD, rating summary
- `/categories`, `/brands`, `/stores` — Catalog browsing
- `/flash-sales` — Active sales with items
- `/search` — Product search, history, popular queries
- `/shipping` — Methods, shipments, tracking events
- `/notifications` — List, unread count, mark read
- `/returns` — Create & list return requests
- `/chat` — Threads and messages
- `/coupons` — Validate by code
