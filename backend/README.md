<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="80" alt="NestJS Logo" />
</p>

<h1 align="center">LabVerse E-Commerce Backend API</h1>

<p align="center">
  A multi-vendor e-commerce platform API built with NestJS, TypeORM, and PostgreSQL.
</p>

> **Project Status: Under Active Development — Not Production Ready**
>
> A comprehensive [project audit](docs/FULL-PROJECT-AUDIT.md) (Feb 24, 2026) identified 140+ issues including 22 runtime crash bugs, 15 security vulnerabilities, and 60+ endpoints with missing input validation. See [docs/KNOWN-ISSUES.md](docs/KNOWN-ISSUES.md) for the prioritized issue tracker.
>
> The core architecture, entity design (112 tables), and auth modules are solid. Feature modules require significant bug fixes before deployment.

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-10.2.10-E0234E?style=flat-square&logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-5.3.3-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TypeORM-0.3.19-FE0902?style=flat-square" alt="TypeORM" />
  <img src="https://img.shields.io/badge/Swagger-7.4.2-85EA2D?style=flat-square&logo=swagger" alt="Swagger" />
  <img src="https://img.shields.io/badge/License-UNLICENSED-lightgrey?style=flat-square" alt="License" />
</p>

---

## Table of Contents

1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Getting Started](#3-getting-started)
4. [Environment Variables](#4-environment-variables)
5. [Database Setup & Migrations](#5-database-setup--migrations)
6. [Seeding Data](#6-seeding-data)
7. [Running the Application](#7-running-the-application)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [API Response Format](#9-api-response-format)
10. [Complete API Endpoint Reference](#10-complete-api-endpoint-reference)
    - [Health & Root](#101-health--root)
    - [Authentication](#102-authentication)
    - [Users](#103-users)
    - [Roles](#104-roles)
    - [Permissions](#105-permissions)
    - [Role Permissions](#106-role-permissions)
    - [Products](#107-products)
    - [Categories, Brands & Attributes](#108-categories-brands--attributes)
    - [Cart, Wishlist & Checkout](#109-cart-wishlist--checkout)
    - [Orders & Shipments](#1010-orders--shipments)
    - [Payments, Refunds & Payment Methods](#1011-payments-refunds--payment-methods)
    - [Inventory, Warehouses & Transfers](#1012-inventory-warehouses--transfers)
    - [Sellers & Stores](#1013-sellers--stores)
    - [Reviews](#1014-reviews)
    - [Returns & Return Reasons](#1015-returns--return-reasons)
    - [Disputes](#1016-disputes)
    - [Shipping](#1017-shipping)
    - [Tax](#1018-tax)
    - [Marketing (Campaigns, Flash Sales, Vouchers)](#1019-marketing)
    - [Bundles](#1020-bundles)
    - [Subscriptions](#1021-subscriptions)
    - [Loyalty & Referrals](#1022-loyalty--referrals)
    - [Chat & Messaging](#1023-chat--messaging)
    - [Notifications & Templates](#1024-notifications--templates)
    - [Tickets & Support](#1025-tickets--support)
    - [CMS (Pages & Banners)](#1026-cms-pages--banners)
    - [SEO & URL Redirects](#1027-seo--url-redirects)
    - [Search, Recently Viewed & Recommendations](#1028-search-recently-viewed--recommendations)
    - [Internationalization (i18n)](#1029-internationalization-i18n)
    - [System Settings & Feature Flags](#1030-system-settings--feature-flags)
    - [Operations (Bulk & Import/Export)](#1031-operations-bulk--importexport)
    - [Audit & Activity Logs](#1032-audit--activity-logs)
11. [Role-Based Access Control (RBAC)](#11-role-based-access-control-rbac)
12. [Error Handling](#12-error-handling)
13. [Validation](#13-validation)
14. [Rate Limiting & Security](#14-rate-limiting--security)
15. [Swagger / OpenAPI Documentation](#15-swagger--openapi-documentation)
16. [Real-Time Features (WebSocket)](#16-real-time-features-websocket)
17. [File Storage (Supabase)](#17-file-storage-supabase)
18. [Testing](#18-testing)
19. [Deployment Guide](#19-deployment-guide)
20. [Project Structure](#20-project-structure)

---

## 1. Project Overview & Architecture

**LabVerse API** is a comprehensive, multi-vendor e-commerce backend platform designed for the Pakistan market. It supports the full lifecycle of an online marketplace — from product catalog management and multi-seller onboarding to order fulfillment, payment processing, loyalty programs, and customer support.

### Key Capabilities

| Domain | Features |
|--------|----------|
| **Multi-Vendor Marketplace** | Seller registration, store management, document verification, wallet & payouts |
| **Product Catalog** | Products, variants, images, categories, brands, attributes, price history |
| **Orders & Fulfillment** | Order lifecycle, shipments, tracking, status history |
| **Payments** | Multiple payment methods, refunds, saved payment methods, payment attempts |
| **Inventory** | Multi-warehouse, stock movements, reservations, inter-warehouse transfers |
| **Marketing** | Campaigns, flash sales, vouchers/coupons with validation & stacking rules |
| **Loyalty** | Points earning/redemption, tier system, referral codes |
| **Customer Support** | Support tickets, live chat, dispute resolution |
| **CMS** | Pages, banners with scheduling and positioning |
| **Internationalization** | Multi-language, multi-currency with exchange rate conversion |
| **SEO** | Per-entity metadata, URL redirects, structured data |
| **Subscriptions** | Recurring product deliveries with pause/resume |
| **Notifications** | In-app, email templates, push notification support |
| **Audit** | Complete audit logs, user activity tracking |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Client Applications                   │
│          (Web, Mobile, Admin Dashboard)                  │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────────┐
│                   NestJS Application                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Security Layer                      │    │
│  │  Helmet ─ CORS ─ Rate Limiting ─ Throttler      │    │
│  └────────────────────┬────────────────────────────┘    │
│  ┌────────────────────▼────────────────────────────┐    │
│  │           Global Pipes & Interceptors            │    │
│  │  GlobalValidationPipe ─ ResponseInterceptor      │    │
│  │  GlobalExceptionFilter                           │    │
│  └────────────────────┬────────────────────────────┘    │
│  ┌────────────────────▼────────────────────────────┐    │
│  │              Guards Layer                        │    │
│  │  JwtAuthGuard ─ RolesGuard ─ PermissionsGuard   │    │
│  └────────────────────┬────────────────────────────┘    │
│  ┌────────────────────▼────────────────────────────┐    │
│  │        34 Feature Modules (Controllers)          │    │
│  │  Auth │ Users │ Products │ Orders │ Payments ... │    │
│  └────────────────────┬────────────────────────────┘    │
│  ┌────────────────────▼────────────────────────────┐    │
│  │             Services & Business Logic            │    │
│  └────────────────────┬────────────────────────────┘    │
│  ┌────────────────────▼────────────────────────────┐    │
│  │         TypeORM Repositories & Entities          │    │
│  └────────────────────┬────────────────────────────┘    │
└───────────────────────┼─────────────────────────────────┘
                        │
          ┌─────────────▼──────────────┐
          │       PostgreSQL DB        │
          │    112 tables, 35 migrations│
          └────────────────────────────┘
              │                    │
    ┌─────────▼────────┐  ┌───────▼────────┐
    │  Supabase Storage │  │  Socket.IO     │
    │  (File Uploads)   │  │  (Real-time)   │
    └──────────────────┘  └────────────────┘
```

### Module Organization

The application is organized into **34 modules** (7 core + 26 feature + MailModule):

**Core Modules:** `GuardsModule`, `SharedModule`, `MailModule`, `UsersModule`, `RolesModule`, `AuthModule`, `PermissionsModule`, `RolePermissionsModule`

**Feature Modules:** `CartModule`, `ChatModule`, `CategoriesModule`, `I18nModule`, `DisputesModule`, `CmsModule`, `TaxModule`, `ShippingModule`, `SubscriptionsModule`, `SystemModule`, `TicketsModule`, `SearchModule`, `SellersModule`, `ReviewsModule`, `ProductsModule`, `ReturnsModule`, `OrdersModule`, `PaymentsModule`, `SeoModule`, `OperationsModule`, `MarketingModule`, `NotificationsModule`, `BundlesModule`, `InventoryModule`, `LoyaltyModule`, `AuditModule`

---

## 2. Tech Stack & Dependencies

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `@nestjs/core` | ^10.2.10 | NestJS core framework |
| `@nestjs/common` | ^10.2.10 | Common utilities, decorators, pipes |
| `@nestjs/platform-express` | ^10.2.10 | Express HTTP adapter |
| `@nestjs/config` | ^3.3.0 | Configuration management |
| `typescript` | ^5.3.3 | TypeScript compiler |
| `rxjs` | ^7.8.2 | Reactive extensions |

### Database & ORM

| Package | Version | Purpose |
|---------|---------|---------|
| `typeorm` | ^0.3.19 | Object-Relational Mapping |
| `@nestjs/typeorm` | ^10.0.0 | NestJS TypeORM integration |
| `pg` | ^8.11.3 | PostgreSQL driver |
| `typeorm-naming-strategies` | ^4.1.0 | Snake-case column naming |

### Authentication & Security

| Package | Version | Purpose |
|---------|---------|---------|
| `@nestjs/passport` | ^10.0.1 | Passport.js integration |
| `@nestjs/jwt` | ^10.0.0 | JWT token handling |
| `passport` | ^0.7.0 | Authentication middleware |
| `passport-jwt` | ^4.0.1 | JWT strategy for Passport |
| `bcryptjs` | ^3.0.2 | Password hashing |
| `helmet` | ^8.1.0 | HTTP security headers |
| `express-rate-limit` | ^8.0.1 | Request rate limiting |
| `@nestjs/throttler` | ^6.4.0 | NestJS throttler guard |

### API Documentation

| Package | Version | Purpose |
|---------|---------|---------|
| `@nestjs/swagger` | ^7.4.2 | Swagger/OpenAPI generator |
| `swagger-ui-express` | ^4.6.3 | Swagger UI |

### Validation & Transformation

| Package | Version | Purpose |
|---------|---------|---------|
| `class-validator` | ^0.14.2 | Decorator-based validation |
| `class-transformer` | ^0.5.1 | Object transformation |
| `@nestjs/mapped-types` | ^2.1.0 | DTO mapping utilities |

### File Storage & Real-Time

| Package | Version | Purpose |
|---------|---------|---------|
| `@supabase/supabase-js` | ^2.56.0 | Supabase client (file storage) |
| `@nestjs/websockets` | ^10.0.0 | WebSocket support |
| `@nestjs/platform-socket.io` | ^10.0.0 | Socket.IO adapter |
| `multer` | ^1.4.5-lts.1 | File upload handling |

### Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| `uuid` | ^11.1.0 | UUID generation |
| `reflect-metadata` | ^0.1.13 | Decorator metadata support |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@nestjs/cli` | ^11.0.10 | NestJS CLI |
| `@nestjs/testing` | ^10.0.0 | Testing utilities |
| `jest` | ^29.7.0 | Test runner |
| `ts-jest` | ^29.1.1 | TypeScript Jest transformer |
| `supertest` | ^6.3.3 | HTTP assertions |
| `eslint` | ^8.49.0 | Code linting |
| `prettier` | ^3.0.3 | Code formatting |

---

## 3. Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **PostgreSQL** >= 14.x
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/labverse-api.git
cd labverse-api

# Install dependencies
npm install
```

### Quick Setup (One Command)

```bash
# Install dependencies, run migrations, and seed data
npm run dev:setup
```

This runs `npm install && npm run migration:run && npm run seed`.

### Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Configure your .env file (see Section 4)

# 4. Run database migrations
npm run migration:run

# 5. Seed initial data (roles, permissions, super admin)
npm run seed:all

# 6. Start the development server
npm run start:dev
```

The API will be available at `http://localhost:3001` and Swagger docs at `http://localhost:3001/api/docs`.

---

## 4. Environment Variables

Create a `.env` file in the project root with the following variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3001` | Application port |
| `NODE_ENV` | No | `development` | Environment (`development`, `production`, `test`) |
| `FRONTEND_URLS` | No | — | Comma-separated list of allowed CORS origins |
| **Database** | | | |
| `DB_HOST` | Yes | `localhost` | PostgreSQL host |
| `DB_PORT` | Yes | `5432` | PostgreSQL port |
| `DB_USERNAME` | Yes | `postgres` | Database username |
| `DB_PASSWORD` | Yes | — | Database password |
| `DB_DATABASE` | Yes | `postgres` | Database name |
| `TYPEORM_LOGGING` | No | `false` | Enable TypeORM SQL logging (`true`/`false`) |
| **Authentication** | | | |
| `JWT_SECRET` | Yes | — | Secret key for JWT token signing |
| `JWT_EXPIRES_IN` | No | `15m` | JWT access token expiry |
| **Rate Limiting** | | | |
| `THROTTLE_TTL` | No | `60000` | Throttle window in milliseconds |
| `THROTTLE_LIMIT` | No | `100` | Max requests per throttle window |
| **Supabase (File Storage)** | | | |
| `SUPABASE_URL` | No | — | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | No | — | Supabase service role key |
| `SUPABASE_ANON_KEY` | No | — | Supabase anonymous key |
| `SUPABASE_BUCKET_NAME` | No | — | Supabase storage bucket name |
| **Super Admin Seed** | | | |
| `SUPER_ADMIN_NAME` | No | — | Name for seeded super admin user |
| `SUPER_ADMIN_EMAIL` | No | — | Email for seeded super admin user |
| `SUPER_ADMIN_PASSWORD` | No | — | Password for seeded super admin user |

### Example `.env` File

```env
# Application
PORT=3001
NODE_ENV=development
FRONTEND_URLS=http://localhost:3000,https://labverse.org

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
DB_DATABASE=ecommerce
TYPEORM_LOGGING=false

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_BUCKET_NAME=uploads

# Super Admin
SUPER_ADMIN_NAME=Super Admin
SUPER_ADMIN_EMAIL=admin@labverse.org
SUPER_ADMIN_PASSWORD=SuperAdmin123!
```

---

## 5. Database Setup & Migrations

### Database Configuration

The application uses PostgreSQL with TypeORM. The configuration is in `src/config/database.config.ts`:

- **Naming Strategy:** `SnakeNamingStrategy` — all column names are automatically converted to `snake_case`
- **Synchronize:** `false` — schema changes are managed exclusively through migrations
- **Entities:** Auto-discovered from `src/modules/**/entities/*.entity.{ts,js}`

### Migration Commands

```bash
# Run all pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert

# Show migration status
npm run migration:show

# Generate a new migration from entity changes
npm run migration:generate
```

### Migration Files

The project includes 35 sequential migrations in `src/migrations/`:

| Migration | Description |
|-----------|-------------|
| `1700000000001` | CreateEcommerceExtensions — uuid-ossp, pgcrypto, pg_trgm, btree_gist |
| `1700000000002` | CreateEcommerceEnums — all custom enum types |
| `1700000000003` | CreateEcommerceSequences — auto-increment sequences |
| `1700000000004` | CreateEcommerceUtilityFunctions — DB utility functions |
| `1700000000005` | CreateEcommerceAuthUsers — users, roles, permissions, sessions, addresses, login history |
| `1700000000006` | CreateEcommerceSellersStores — sellers, stores, documents, wallets, followers |
| `1700000000007` | CreateEcommerceCategoriesBrands — categories, brands, attributes, groups |
| `1700000000008` | CreateEcommerceProducts — products, variants, images, questions, answers, price history |
| `1700000000009` | CreateEcommerceInventory — inventory, warehouses, stock movements, reservations, transfers |
| `1700000000010` | CreateEcommerceCartCheckout — carts, cart items, wishlists, checkout sessions |
| `1700000000011` | CreateEcommerceOrders — orders, order items, status history, snapshots, shipments |
| `1700000000012` | CreateEcommercePayments — payments, payment attempts, refunds, saved methods |
| `1700000000013` | CreateEcommerceReturns — return requests, reasons, shipments, images |
| `1700000000014` | CreateEcommerceDisputes — disputes, messages, evidence |
| `1700000000015` | CreateEcommerceReviews — reviews, helpfulness, reports |
| `1700000000016` | CreateEcommerceMarketing — campaigns, flash sales, vouchers, conditions |
| `1700000000017` | CreateEcommerceTax — tax zones, rates, classes, order tax lines |
| `1700000000018` | CreateEcommerceShipping — carriers, methods, zones, rates, delivery slots |
| `1700000000019` | CreateEcommerceSearch — search history, recently viewed, comparisons, recommendations |
| `1700000000020` | CreateEcommerceNotifications — notifications, templates, preferences |
| `1700000000021` | CreateEcommerceChat — conversations, messages |
| `1700000000022` | CreateEcommerceTickets — tickets, messages, categories |
| `1700000000023` | CreateEcommerceLoyalty — points, transactions, tiers, referral codes, referrals |
| `1700000000024` | CreateEcommerceBundles — product bundles, bundle items |
| `1700000000025` | CreateEcommerceSubscriptions — subscriptions, subscription orders |
| `1700000000026` | CreateEcommerceCms — pages, banners |
| `1700000000027` | CreateEcommerceSeo — SEO metadata, URL redirects |
| `1700000000028` | CreateEcommerceI18n — languages, currencies, translations, rate history |
| `1700000000029` | CreateEcommerceSystem — system settings, feature flags |
| `1700000000030` | CreateEcommerceAudit — audit logs, user activity logs |
| `1700000000031` | CreateEcommerceOperations — bulk operations, import/export jobs |
| `1700000000032` | CreateEcommerceTriggers — database triggers |
| `1700000000033` | CreateEcommerceStoredProcedures — stored procedures |
| `1700000000034` | CreateEcommerceMaterializedViews — materialized views |
| `1700000000035` | CreateEcommerceMaintenance — DB maintenance routines |

---

## 6. Seeding Data

The project includes three seed scripts that must be run in order:

```bash
# Run all seeds in correct order (recommended)
npm run seed:all
```

This is equivalent to:

```bash
# Step 1: Create system roles and permissions for 42 resource modules
npm run seed:permissions-super-admin

# Step 2: Assign scoped permissions to admin, seller, and customer roles
npm run seed:role-permissions

# Step 3: Create the super admin user account
npm run seed:super-admin
```

### What Gets Seeded

**Step 1 — Roles & Permissions:**
- Creates 5 system roles: `super_admin`, `admin`, `seller`, `customer`, `support_agent`
- Creates permissions for 42 resource modules (CRUD + custom actions each)

**Step 2 — Role-Permission Assignments:**
- `admin` — Full access to most modules
- `seller` — Access to products, inventory, orders (own), store management
- `customer` — Access to cart, wishlist, orders (own), reviews, returns

**Step 3 — Super Admin User:**
- Creates a user with `super_admin` role using the `SUPER_ADMIN_*` environment variables
- Super admins bypass all permission and role checks

> **Note:** The `npm run seed` and `npm run seed:permissions` scripts reference files (`seeds/seed.ts` and `seeds/permissions-seed.ts`) that do not exist—use `npm run seed:all` instead, which runs the 3 working seed scripts above.

---

## 7. Running the Application

### Development

```bash
# Start with hot-reload
npm run start:dev

# Start with debug mode
npm run start:debug
```

### Production

```bash
# Build the project
npm run build

# Start production server
npm run start:prod
```

### Other Commands

```bash
# Lint and auto-fix
npm run lint

# Check lint without fixing
npm run lint:check

# Format code with Prettier
npm run format

# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:cov

# Full check (lint + test + build)
npm run check:all
```

---

## 8. Authentication & Authorization

### Authentication Flow

The API uses **JWT (JSON Web Token)** authentication with access and refresh tokens.

```
┌──────────────┐               ┌──────────────┐
│    Client     │               │   API Server  │
└──────┬───────┘               └──────┬───────┘
       │  POST /auth/login             │
       │  { email, password }          │
       ├──────────────────────────────►│
       │                               │ Validate credentials
       │                               │ Hash compare with bcrypt
       │  { accessToken, refreshToken, │
       │    user }                     │
       │◄──────────────────────────────┤
       │                               │
       │  GET /products (with token)   │
       │  Authorization: Bearer <jwt>  │
       ├──────────────────────────────►│
       │                               │ Verify JWT
       │                               │ Extract user from payload
       │  200 OK { data }              │
       │◄──────────────────────────────┤
       │                               │
       │  POST /auth/refresh           │
       │  { refreshToken }             │
       ├──────────────────────────────►│
       │                               │ Validate refresh token
       │  { accessToken, refreshToken }│
       │◄──────────────────────────────┤
       └───────────────────────────────┘
```

### Token Details

| Token | Expiry | Purpose |
|-------|--------|---------|
| **Access Token** | 15 minutes (configurable via `JWT_EXPIRES_IN`) | Authenticate API requests |
| **Refresh Token** | 7 days | Obtain new access tokens |

### How to Authenticate

1. **Register** or **Login** to get tokens
2. Include the access token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. When the access token expires, use the refresh token to get a new pair

### JWT Payload Structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "customer",
  "iat": 1700000000,
  "exp": 1700000900
}
```

### Authorization Guards

The API uses a layered guard system. Guards are applied **per-controller via decorators** (not globally), except for `ThrottlerGuard` which is the only global guard:

| Guard | Purpose | Bypass | Scope |
|-------|---------|--------|-------|
| `ThrottlerGuard` | Rate limiting (100 req/min) | — | **Global** (APP_GUARD) |
| `JwtAuthGuard` | Verifies JWT token is valid and extracts user | — | Per-controller |
| `RolesGuard` | Checks if user has the required role | `super_admin` and `admin` bypass all role checks | Per-controller |
| `PermissionsGuard` | Checks if user's role has the required permission | `super_admin` and `admin` bypass all permission checks | Per-controller |

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- Pattern: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/`

---

## 9. API Response Format

### Success Response

All successful responses are wrapped by the `ResponseInterceptor`:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

### Error Response

All errors are handled by the `GlobalExceptionFilter`:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Error Type",
  "statusCode": 400,
  "timestamp": "2026-02-25T12:00:00.000Z",
  "path": "/api/endpoint",
  "details": ["field: validation message"]
}
```

### Common HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| `200` | OK | Successful GET, PATCH, DELETE |
| `201` | Created | Successful POST (resource created) |
| `400` | Bad Request | Validation error, missing fields, FK violation, NOT NULL violation |
| `401` | Unauthorized | Missing/invalid/expired JWT token |
| `403` | Forbidden | Insufficient role or permissions |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Duplicate key violation (unique constraint) |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server error |

---

## 10. Complete API Endpoint Reference

> **Base URL:** `http://localhost:3001`
>
> **Authentication:** Unless marked as 🌐 **Public**, all endpoints require `Authorization: Bearer <token>` header.
>
> **Permissions:** Shown as `resource.action` (e.g., `products.create`). Users with `super_admin` or `admin` roles bypass all permission checks.

---

### 10.1. Health & Root

#### GET `/`

🌐 **Public** — No authentication required.

Returns a basic hello message.

**Response:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": "Hello World!",
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

#### GET `/health`

🌐 **Public** — No authentication required.

Health check endpoint for load balancers and monitoring.

**Response:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "status": "ok",
    "timestamp": "2026-02-25T12:00:00.000Z"
  },
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

### 10.2. Authentication

All authentication endpoints are 🌐 **Public** — no token required.

#### POST `/auth/register`

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass1",
  "phone": "+923001234567"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | Max 100 chars, trimmed |
| `email` | string | Yes | Valid email, max 150 chars, lowercased |
| `password` | string | Yes | Min 8 chars, max 128, must contain uppercase + lowercase + digit |
| `phone` | string | No | Max 20 chars |

**Success Response (201):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  },
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

**Error Response (409 — Email already exists):**

```json
{
  "success": false,
  "message": "Duplicate entry detected",
  "error": "Conflict",
  "statusCode": 409,
  "timestamp": "2026-02-25T12:00:00.000Z",
  "path": "/auth/register"
}
```

---

#### POST `/auth/login`

Authenticate and get access + refresh tokens.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass1"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | Valid email, max 255 chars, lowercased |
| `password` | string | Yes | Min 1 char, max 255 |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  },
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

**Error Response (401 — Invalid credentials):**

```json
{
  "success": false,
  "message": "Invalid credentials",
  "error": "Unauthorized",
  "statusCode": 401,
  "timestamp": "2026-02-25T12:00:00.000Z",
  "path": "/auth/login"
}
```

---

#### POST `/auth/refresh`

Get a new access token using a refresh token.

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `refreshToken` | string | Yes | Non-empty, trimmed |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

#### POST `/auth/logout`

Invalidate a refresh token.

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": null,
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

#### POST `/auth/password-forgot`

Request a password reset email.

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | Valid email, max 255 chars, lowercased |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "message": "If that email exists, a reset link has been sent"
  },
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

#### POST `/auth/reset-password`

Reset password using the token received via email.

**Request Body:**

```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePass1"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `token` | string | Yes | Non-empty, trimmed |
| `password` | string | Yes | Min 8, max 128, must contain uppercase + lowercase + digit |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "message": "Password reset successful"
  },
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

### 10.3. Users

🔒 **Guards:** `JwtAuthGuard`, `RolesGuard`, `PermissionsGuard` (class-level)

#### POST `/users`

Create a new user. **Permission:** `users.create`

**Request Body:**

```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "SecurePass1",
  "phone": "+923009876543",
  "role": "customer",
  "dateOfBirth": "1995-06-15",
  "gender": "female"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | Max 100 chars, trimmed |
| `email` | string | Yes | Valid email, max 150 chars |
| `password` | string | Yes | Min 8, max 128, uppercase + lowercase + digit |
| `phone` | string | No | Max 20 chars |
| `role` | enum | No | `super_admin`, `admin`, `seller`, `customer`, `support_agent`. Default: `customer` |
| `dateOfBirth` | string | No | ISO date string |
| `gender` | enum | No | `male`, `female`, `other` |

**Success Response (201):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+923009876543",
    "role": "customer",
    "dateOfBirth": "1995-06-15",
    "gender": "female",
    "isActive": true,
    "createdAt": "2026-02-25T12:00:00.000Z",
    "updatedAt": "2026-02-25T12:00:00.000Z"
  },
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

#### GET `/users/me`

Get the currently authenticated user's profile. No special permissions required (from auth token).

**Headers:** `Authorization: Bearer <token>`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+923001234567",
    "role": "customer",
    "isActive": true,
    "createdAt": "2026-02-25T12:00:00.000Z",
    "updatedAt": "2026-02-25T12:00:00.000Z"
  },
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

#### GET `/users`

List all users. **Permission:** `users.read`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "isActive": true,
      "createdAt": "2026-02-25T12:00:00.000Z"
    }
  ],
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

#### GET `/users/:id`

Get a user by ID. **Permission:** `users.read`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+923001234567",
    "role": "customer",
    "isActive": true,
    "createdAt": "2026-02-25T12:00:00.000Z",
    "updatedAt": "2026-02-25T12:00:00.000Z"
  },
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

#### GET `/users/:id/permissions`

Get all permissions for a specific user. **Permission:** `users.read`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "id": "perm-uuid",
      "module": "products",
      "action": "read"
    },
    {
      "id": "perm-uuid-2",
      "module": "products",
      "action": "create"
    }
  ],
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

#### PATCH `/users/:id`

Update a user. **Permission:** `users.update`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User ID |

**Request Body (partial):**

```json
{
  "name": "John Updated",
  "phone": "+923001111111"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Updated",
    "email": "john@example.com",
    "phone": "+923001111111",
    "role": "customer",
    "isActive": true,
    "updatedAt": "2026-02-25T12:05:00.000Z"
  },
  "timestamp": "2026-02-25T12:05:00.000Z"
}
```

---

#### DELETE `/users/:id`

Delete a user. **Permission:** `users.delete`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | User ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": null,
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

### 10.4. Roles

🔒 **Guards:** `JwtAuthGuard`, `RolesGuard`, `PermissionsGuard` (class-level)
🔑 **Required Role:** `ADMIN`

#### POST `/roles`

Create a new role. **Permission:** `roles.create`

**Request Body:**

```json
{
  "name": "moderator",
  "displayName": "Moderator",
  "description": "Content moderator role",
  "isSystem": false
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | Max 50 chars, unique |
| `displayName` | string | No | Max 100 chars |
| `description` | string | No | — |
| `isSystem` | boolean | No | Default: `false` |

**Success Response (201):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "role-uuid",
    "name": "moderator",
    "displayName": "Moderator",
    "description": "Content moderator role",
    "isSystem": false,
    "createdAt": "2026-02-25T12:00:00.000Z"
  },
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

#### GET `/roles`

List all roles. **Permission:** `roles.read`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": [
    { "id": "uuid-1", "name": "super_admin", "displayName": "Super Admin", "isSystem": true },
    { "id": "uuid-2", "name": "admin", "displayName": "Admin", "isSystem": true },
    { "id": "uuid-3", "name": "seller", "displayName": "Seller", "isSystem": true },
    { "id": "uuid-4", "name": "customer", "displayName": "Customer", "isSystem": true },
    { "id": "uuid-5", "name": "support_agent", "displayName": "Support Agent", "isSystem": true }
  ],
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

#### GET `/roles/:id`

Get a role by ID. **Permission:** `roles.read`

---

#### PATCH `/roles/:id`

Update a role. **Permission:** `roles.update`

**Request Body (partial):**

```json
{
  "displayName": "Updated Role Name",
  "description": "Updated description"
}
```

---

#### DELETE `/roles/:id`

Delete a role. **Permission:** `roles.delete`

---

### 10.5. Permissions

🔒 **Guards:** `JwtAuthGuard`, `RolesGuard`, `PermissionsGuard` (class-level)

#### POST `/permissions`

Create a new permission. **Role:** `ADMIN` | **Permission:** `permissions.create`

**Request Body:**

```json
{
  "roleId": "role-uuid",
  "module": "products",
  "action": "export"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `roleId` | UUID | Yes | Valid UUID |
| `module` | string | Yes | Max 50 chars |
| `action` | string | Yes | Max 50 chars |

**Success Response (201):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "perm-uuid",
    "roleId": "role-uuid",
    "module": "products",
    "action": "export",
    "createdAt": "2026-02-25T12:00:00.000Z"
  },
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

#### GET `/permissions`

List all permissions. **Permission:** `permissions.read`

---

#### GET `/permissions/by-module?module=products`

Get permissions filtered by module. **Permission:** `permissions.read`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `module` | string | Yes | Module name to filter by |

---

#### GET `/permissions/:id`

Get a permission by ID. **Permission:** `permissions.read`

---

#### PATCH `/permissions/:id`

Update a permission. **Role:** `ADMIN` | **Permission:** `permissions.update`

---

#### DELETE `/permissions/:id`

Delete a permission. **Role:** `ADMIN` | **Permission:** `permissions.delete`

---

### 10.6. Role Permissions

🔒 **Guard:** `JwtAuthGuard`

#### POST `/role-permissions/:roleId`

Assign permissions to a role.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `roleId` | UUID | Role ID |

**Request Body:**

```json
{
  "permissionIds": [
    "perm-uuid-1",
    "perm-uuid-2",
    "perm-uuid-3"
  ],
  "action": "create"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `permissionIds` | UUID[] | Yes | Array of permission UUIDs |
| `action` | enum | No | Permission action enum |

---

#### GET `/role-permissions/:roleId`

Get all permissions assigned to a role.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `roleId` | UUID | Role ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "id": "rp-uuid",
      "roleId": "role-uuid",
      "permissionId": "perm-uuid",
      "permission": {
        "id": "perm-uuid",
        "module": "products",
        "action": "read"
      }
    }
  ],
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

#### DELETE `/role-permissions/:roleId/:permissionId`

Remove a permission from a role.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `roleId` | UUID | Role ID |
| `permissionId` | UUID | Permission ID |

---

### 10.7. Products

#### POST `/products`

🔒 **Guards:** `JwtAuthGuard`, `PermissionsGuard` | **Permission:** `products.create`

Create a new product.

**Request Body:**

```json
{
  "sellerId": "seller-uuid",
  "categoryId": "category-uuid",
  "brandId": "brand-uuid",
  "name": "Premium Wireless Headphones",
  "slug": "premium-wireless-headphones",
  "description": "High-quality wireless headphones with noise cancellation",
  "shortDescription": "Premium wireless headphones with ANC",
  "price": 15999.99,
  "compareAtPrice": 19999.99,
  "costPrice": 8000.00,
  "currencyCode": "PKR",
  "stock": 100,
  "lowStockThreshold": 10,
  "sku": "WH-PRO-001",
  "barcode": "8901234567890",
  "weight": 0.35,
  "weightUnit": "kg",
  "length": 20,
  "width": 18,
  "height": 8,
  "dimensionUnit": "cm",
  "warrantyType": "manufacturer",
  "warrantyDurationMonths": 12,
  "tags": ["wireless", "headphones", "audio", "premium"],
  "status": "draft",
  "isFeatured": false,
  "isDigital": false,
  "requiresShipping": true,
  "isTaxable": true,
  "metaTitle": "Premium Wireless Headphones - LabVerse",
  "metaDescription": "Buy premium wireless headphones with ANC at LabVerse"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `sellerId` | UUID | Yes | Valid seller UUID |
| `categoryId` | UUID | Yes | Valid category UUID |
| `brandId` | UUID | No | Valid brand UUID |
| `name` | string | Yes | Max 300 chars, trimmed |
| `slug` | string | No | Max 300 chars, pattern: `^[a-z0-9-]+$` |
| `description` | string | No | — |
| `shortDescription` | string | No | Max 500 chars |
| `price` | number | Yes | Min 0 |
| `compareAtPrice` | number | No | Min 0 |
| `costPrice` | number | No | Min 0 |
| `currencyCode` | string | No | Max 3 chars, default: `PKR` |
| `stock` | number | No | Min 0, default: 0 |
| `lowStockThreshold` | number | No | Min 0, default: 5 |
| `sku` | string | No | Max 100 chars |
| `barcode` | string | No | Max 50 chars |
| `weight` | number | No | Min 0 |
| `weightUnit` | string | No | Max 10, default: `kg` |
| `length`, `width`, `height` | number | No | Min 0 |
| `dimensionUnit` | string | No | Max 10, default: `cm` |
| `warrantyType` | enum | No | Warranty type enum |
| `warrantyDurationMonths` | number | No | Min 0, max 120 |
| `tags` | string[] | No | Array of strings |
| `status` | enum | No | `draft`, `active`, `inactive`, etc. Default: `draft` |
| `isFeatured` | boolean | No | Default: `false` |
| `isDigital` | boolean | No | Default: `false` |
| `requiresShipping` | boolean | No | Default: `true` |
| `isTaxable` | boolean | No | Default: `true` |
| `metaTitle` | string | No | Max 255 chars |
| `metaDescription` | string | No | Max 500 chars |

**Success Response (201):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "product-uuid",
    "sellerId": "seller-uuid",
    "categoryId": "category-uuid",
    "name": "Premium Wireless Headphones",
    "slug": "premium-wireless-headphones",
    "price": 15999.99,
    "stock": 100,
    "status": "draft",
    "createdAt": "2026-02-25T12:00:00.000Z"
  },
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

#### GET `/products`

🌐 **Public** — No authentication required.

List all products with optional filters.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `categoryId` | UUID | No | Filter by category |
| `brandId` | UUID | No | Filter by brand |
| `sellerId` | UUID | No | Filter by seller |
| `status` | enum | No | Filter by status |
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "id": "product-uuid",
      "name": "Premium Wireless Headphones",
      "slug": "premium-wireless-headphones",
      "price": 15999.99,
      "compareAtPrice": 19999.99,
      "stock": 100,
      "status": "active",
      "isFeatured": false,
      "category": { "id": "cat-uuid", "name": "Electronics" },
      "brand": { "id": "brand-uuid", "name": "AudioTech" }
    }
  ],
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

#### GET `/products/:id`

🌐 **Public** — Get a product by ID.

---

#### GET `/products/slug/:slug`

🌐 **Public** — Get a product by slug.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | string | Product slug |

---

#### PATCH `/products/:id`

🔒 **Permission:** `products.update` — Update a product.

**Request Body (partial):** Any fields from `CreateProductDto`.

---

#### DELETE `/products/:id`

🔒 **Permission:** `products.delete` — Delete a product.

---

#### PATCH `/products/:id/status`

🔒 **Permission:** `products.update` — Update product status.

**Request Body:**

```json
{
  "status": "active"
}
```

---

#### POST `/products/:productId/variants`

🔒 **Permission:** `products.update` — Create a product variant.

**Request Body:**

```json
{
  "productId": "product-uuid",
  "name": "Black - XL",
  "sku": "WH-PRO-001-BK-XL",
  "price": 16999.99,
  "compareAtPrice": 19999.99,
  "costPrice": 8500.00,
  "stock": 50,
  "weight": 0.35,
  "options": {
    "color": "Black",
    "size": "XL"
  },
  "imageUrl": "https://storage.example.com/variant-black-xl.jpg",
  "isActive": true,
  "sortOrder": 0
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `productId` | UUID | Yes | Valid UUID |
| `name` | string | No | Max 200 chars |
| `sku` | string | No | Max 100 chars |
| `barcode` | string | No | Max 50 chars |
| `price` | number | Yes | Min 0 |
| `compareAtPrice` | number | No | Min 0 |
| `costPrice` | number | No | Min 0 |
| `stock` | number | No | Min 0, default: 0 |
| `weight` | number | No | Min 0 |
| `length`, `width`, `height` | number | No | Min 0 |
| `options` | object | No | Key-value pairs (e.g., `{size, color}`) |
| `imageUrl` | string | No | Max 500 chars |
| `isActive` | boolean | No | Default: `true` |
| `sortOrder` | number | No | Default: 0 |

---

#### GET `/products/:productId/variants`

🌐 **Public** — Get all variants for a product.

---

#### PATCH `/products/variants/:id`

🔒 **Permission:** `products.update` — Update a variant.

---

#### DELETE `/products/variants/:id`

🔒 **Permission:** `products.update` — Delete a variant.

---

#### POST `/products/:productId/images`

🔒 **Permission:** `products.update` — Add an image to a product.

**Request Body:**

```json
{
  "productId": "product-uuid",
  "url": "https://storage.example.com/product-image.jpg",
  "altText": "Premium headphones front view",
  "isPrimary": true,
  "sortOrder": 0,
  "variantId": null
}
```

---

#### DELETE `/products/images/:id`

🔒 **Permission:** `products.update` — Remove a product image.

---

#### GET `/products/:productId/questions`

🌐 **Public** — Get questions for a product.

---

#### POST `/products/:productId/questions`

🔒 **Guard:** `JwtAuthGuard` — Ask a question about a product.

**Request Body:**

```json
{
  "question": "Does this come with a carrying case?"
}
```

---

#### POST `/products/questions/:questionId/answers`

🔒 **Guard:** `JwtAuthGuard` — Answer a product question.

**Request Body:**

```json
{
  "answer": "Yes, it includes a premium carrying case.",
  "isSellerAnswer": true
}
```

---

#### GET `/products/:productId/price-history`

🌐 **Public** — Get the price history for a product.

---

### 10.8. Categories, Brands & Attributes

#### Categories

##### POST `/categories`

🔒 **Permission:** `categories.create`

**Request Body:**

```json
{
  "name": "Electronics",
  "slug": "electronics",
  "parentId": null,
  "imageUrl": "https://storage.example.com/electronics.jpg",
  "iconUrl": "https://storage.example.com/electronics-icon.svg",
  "description": "All electronic products",
  "metaTitle": "Electronics - LabVerse",
  "metaDescription": "Shop electronics at LabVerse",
  "commissionRate": 8.5,
  "isActive": true,
  "isFeatured": true,
  "sortOrder": 1
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | Max 100 chars, trimmed |
| `slug` | string | No | Max 100, pattern: `^[a-z0-9-]+$` |
| `parentId` | UUID | No | For sub-categories |
| `imageUrl` | string | No | Max 500 |
| `iconUrl` | string | No | Max 500 |
| `description` | string | No | — |
| `metaTitle` | string | No | Max 255 |
| `metaDescription` | string | No | Max 500 |
| `commissionRate` | number | No | 0–100 |
| `isActive` | boolean | No | Default: `true` |
| `isFeatured` | boolean | No | Default: `false` |
| `sortOrder` | number | No | Default: 0 |

---

##### GET `/categories`

🌐 **Public** — List all categories.

---

##### GET `/categories/root`

🌐 **Public** — List root (top-level) categories only.

---

##### GET `/categories/:id`

🌐 **Public** — Get a category by ID.

---

##### GET `/categories/slug/:slug`

🌐 **Public** — Get a category by slug.

---

##### PATCH `/categories/:id`

🔒 **Permission:** `categories.update` — Update a category.

---

##### DELETE `/categories/:id`

🔒 **Permission:** `categories.delete` — Delete a category.

---

##### POST `/categories/:categoryId/brands/:brandId`

🔒 **Permission:** `categories.update` — Assign a brand to a category.

---

##### DELETE `/categories/:categoryId/brands/:brandId`

🔒 **Permission:** `categories.update` — Remove a brand from a category.

---

#### Brands

##### POST `/brands`

🔒 **Permission:** `brands.create`

**Request Body:**

```json
{
  "name": "AudioTech",
  "slug": "audiotech",
  "logoUrl": "https://storage.example.com/audiotech-logo.png",
  "description": "Premium audio equipment manufacturer",
  "websiteUrl": "https://audiotech.com",
  "countryOfOrigin": "US",
  "isActive": true,
  "isFeatured": false,
  "metaTitle": "AudioTech - LabVerse",
  "metaDescription": "Shop AudioTech products"
}
```

---

##### GET `/brands`

🌐 **Public** — List all brands.

---

##### GET `/brands/:id`

🌐 **Public** — Get a brand by ID.

---

##### GET `/brands/slug/:slug`

🌐 **Public** — Get a brand by slug.

---

##### PATCH `/brands/:id`

🔒 **Permission:** `brands.update`

---

##### DELETE `/brands/:id`

🔒 **Permission:** `brands.delete`

---

#### Attributes

🔒 **Guards:** `JwtAuthGuard`, `PermissionsGuard` (class-level)

##### POST `/attributes`

**Permission:** `attributes.create`

**Request Body:**

```json
{
  "name": "Color",
  "slug": "color",
  "type": "text",
  "unit": null,
  "isFilterable": true,
  "isRequired": false,
  "isVariantAttribute": true
}
```

---

##### GET `/attributes`

List all attributes.

---

##### GET `/attributes/:id`

Get an attribute by ID.

---

##### PATCH `/attributes/:id`

**Permission:** `attributes.update`

---

##### DELETE `/attributes/:id`

**Permission:** `attributes.delete`

---

### 10.9. Cart, Wishlist & Checkout

All cart, wishlist, and checkout endpoints require 🔒 **Guard:** `JwtAuthGuard`.

#### Cart

##### GET `/cart`

Get the authenticated user's cart.

**Success Response (200):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "cart-uuid",
    "userId": "user-uuid",
    "items": [
      {
        "id": "item-uuid",
        "productId": "product-uuid",
        "variantId": null,
        "quantity": 2,
        "priceAtAddition": 15999.99,
        "product": {
          "id": "product-uuid",
          "name": "Premium Headphones",
          "price": 15999.99
        }
      }
    ],
    "currencyCode": "PKR",
    "discountAmount": 0
  },
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

##### POST `/cart/items`

Add an item to the cart.

**Request Body:**

```json
{
  "productId": "product-uuid",
  "variantId": "variant-uuid",
  "quantity": 2
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `productId` | UUID | Yes | Valid UUID |
| `variantId` | UUID | No | Product variant ID |
| `quantity` | number | No | Min 1, default: 1 |

---

##### PATCH `/cart/items/:id`

Update a cart item's quantity.

**Request Body:**

```json
{
  "quantity": 3
}
```

---

##### DELETE `/cart/items/:id`

Remove an item from the cart.

---

##### DELETE `/cart`

Clear the entire cart.

---

#### Wishlist

##### GET `/wishlist`

Get the authenticated user's wishlist.

---

##### POST `/wishlist`

Add a product to the wishlist.

**Request Body:**

```json
{
  "productId": "product-uuid",
  "notifyOnSale": true,
  "notifyOnRestock": false
}
```

---

##### DELETE `/wishlist/:productId`

Remove a product from the wishlist.

---

##### GET `/wishlist/check/:productId`

Check if a product is in the wishlist.

**Success Response (200):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "isInWishlist": true
  },
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

#### Checkout

##### POST `/checkout/session`

Create a new checkout session.

**Request Body:**

```json
{
  "cartId": "cart-uuid",
  "sessionToken": "unique-session-token",
  "shippingAddressId": "address-uuid",
  "billingAddressId": "address-uuid",
  "shippingMethodId": "method-uuid",
  "paymentMethod": "credit_card",
  "subtotal": 31999.98,
  "taxAmount": 5120.00,
  "shippingAmount": 250.00,
  "totalAmount": 37369.98,
  "loyaltyPointsUsed": 0,
  "giftWrapRequested": false
}
```

---

##### GET `/checkout/session/:id`

Get a checkout session by ID.

---

##### PATCH `/checkout/session/:id`

Update a checkout session.

---

##### POST `/checkout/session/:id/complete`

Complete a checkout session (finalizes the order).

---

### 10.10. Orders & Shipments

🔒 **Guard:** `JwtAuthGuard` (class-level)

#### Orders

##### POST `/orders`

Create a new order.

**Request Body:**

```json
{
  "userId": "user-uuid",
  "storeId": "store-uuid",
  "subtotal": 31999.98,
  "discountAmount": 0,
  "taxAmount": 5120.00,
  "shippingAmount": 250.00,
  "totalAmount": 37369.98,
  "currencyCode": "PKR",
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "+923001234567",
    "country": "Pakistan",
    "province": "Punjab",
    "city": "Lahore",
    "streetAddress": "123 Main Street",
    "postalCode": "54000"
  },
  "billingAddress": null,
  "shippingMethod": "standard",
  "paymentMethod": "cod",
  "customerNotes": "Please leave at the door",
  "isGift": false,
  "loyaltyPointsUsed": 0,
  "sourcePlatform": "web"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `userId` | UUID | Yes | — |
| `storeId` | UUID | Yes | — |
| `subtotal` | number | Yes | Min 0 |
| `totalAmount` | number | Yes | Min 0 |
| `shippingAddress` | object | Yes | JSON object |
| `discountAmount` | number | No | Min 0, default: 0 |
| `taxAmount` | number | No | Min 0, default: 0 |
| `shippingAmount` | number | No | Min 0, default: 0 |
| `currencyCode` | string | No | Max 3, default: `PKR` |
| `billingAddress` | object | No | JSON object |
| `shippingMethod` | string | No | Max 100 |
| `paymentMethod` | string | No | Max 50 |
| `customerNotes` | string | No | — |
| `isGift` | boolean | No | Default: `false` |
| `giftMessage` | string | No | Max 500 |
| `loyaltyPointsUsed` | number | No | Min 0, default: 0 |
| `sourcePlatform` | string | No | Max 50, default: `web` |

---

##### GET `/orders`

🔒 **Permission:** `orders.read` — List all orders.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | UUID | No | Filter by user |
| `sellerId` | UUID | No | Filter by seller |
| `status` | enum | No | Filter by status |
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |

---

##### GET `/orders/my-orders`

Get the authenticated user's orders. No special permissions.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |

---

##### GET `/orders/:id`

Get an order by ID.

---

##### GET `/orders/number/:orderNumber`

Get an order by order number.

---

##### PATCH `/orders/:id`

🔒 **Permission:** `orders.update` — Update an order.

---

##### PATCH `/orders/:id/status`

🔒 **Permission:** `orders.update` — Update order status.

**Request Body:**

```json
{
  "status": "processing",
  "comment": "Order is being prepared for shipment"
}
```

---

##### POST `/orders/:id/cancel`

Cancel an order (own orders).

**Request Body:**

```json
{
  "reason": "Changed my mind"
}
```

---

##### GET `/orders/:id/status-history`

Get order status change history.

---

##### POST `/orders/:orderId/shipments`

🔒 **Permission:** `orders.update` — Create a shipment for an order.

**Request Body:**

```json
{
  "orderId": "order-uuid",
  "shipmentNumber": "SHP-2026-001",
  "carrierName": "TCS",
  "trackingNumber": "TCS1234567890",
  "trackingUrl": "https://tcs.com.pk/track/TCS1234567890",
  "shippingCost": 250.00,
  "weightKg": 0.5,
  "estimatedDeliveryAt": "2026-03-01T12:00:00Z",
  "deliveryAddress": {
    "fullName": "John Doe",
    "city": "Lahore",
    "streetAddress": "123 Main Street"
  }
}
```

---

##### GET `/orders/:orderId/shipments`

Get all shipments for an order.

---

#### Shipments

🔒 **Guards:** `JwtAuthGuard`, `PermissionsGuard` (class-level)

##### PATCH `/shipments/:id`

**Permission:** `orders.update` — Update a shipment.

---

##### PATCH `/shipments/:id/status`

**Permission:** `orders.update` — Update shipment status.

**Request Body:**

```json
{
  "status": "in_transit"
}
```

---

##### GET `/shipments/track/:trackingNumber`

Track a shipment by tracking number.

---

### 10.11. Payments, Refunds & Payment Methods

🔒 **Guard:** `JwtAuthGuard` (class-level)

#### Payments

##### POST `/payments`

🔒 **Permission:** `payments.create` — Create a payment.

**Request Body:**

```json
{
  "orderId": "order-uuid",
  "userId": "user-uuid",
  "amount": 37369.98,
  "currencyCode": "PKR",
  "paymentMethod": "credit_card",
  "gatewayName": "stripe",
  "gatewayTransactionId": "pi_1234567890",
  "metadata": {}
}
```

---

##### GET `/payments`

🔒 **Permission:** `payments.read` — List payments.

**Query Parameters:** `orderId`, `userId`, `status`, `page`, `limit`

---

##### GET `/payments/:id`

Get a payment by ID.

---

##### PATCH `/payments/:id`

🔒 **Permission:** `payments.update` — Update a payment.

---

##### POST `/payments/:id/process`

🔒 **Permission:** `payments.update` — Process a pending payment.

---

##### GET `/payments/:id/attempts`

Get payment attempts for a payment.

---

#### Refunds

##### POST `/refunds`

Create a refund request (no special permissions — user's own).

**Request Body:**

```json
{
  "paymentId": "payment-uuid",
  "amount": 15999.99,
  "reason": "product_defective",
  "reasonDetails": "The headphones have a faulty left speaker"
}
```

---

##### GET `/refunds`

🔒 **Permission:** `payments.read` — List refunds.

**Query Parameters:** `paymentId`, `status`, `page`, `limit`

---

##### GET `/refunds/:id`

Get a refund by ID.

---

##### POST `/refunds/:id/process`

🔒 **Permission:** `payments.update` — Process a refund.

---

##### POST `/refunds/:id/reject`

🔒 **Permission:** `payments.update` — Reject a refund.

**Request Body:**

```json
{
  "reason": "Item is outside the return window"
}
```

---

#### Payment Methods

##### POST `/payment-methods`

Save a payment method.

**Request Body:**

```json
{
  "userId": "user-uuid",
  "paymentMethod": "credit_card",
  "nickname": "Personal Visa",
  "isDefault": true,
  "cardLastFour": "4242",
  "cardBrand": "Visa",
  "cardExpiryMonth": 12,
  "cardExpiryYear": 2028
}
```

---

##### GET `/payment-methods`

Get saved payment methods for the authenticated user.

---

##### DELETE `/payment-methods/:id`

Remove a saved payment method.

---

##### POST `/payment-methods/:id/default`

Set a payment method as default.

---

### 10.12. Inventory, Warehouses & Transfers

🔒 **Guards:** `JwtAuthGuard`, `PermissionsGuard` (class-level)

#### Warehouses

##### POST `/warehouses`

**Permission:** `inventory.create`

**Request Body:**

```json
{
  "name": "Lahore Central Warehouse",
  "code": "WH-LHR-01",
  "addressLine1": "Industrial Area, Plot 42",
  "city": "Lahore",
  "state": "Punjab",
  "postalCode": "54000",
  "countryCode": "PK",
  "contactName": "Ahmed Khan",
  "contactPhone": "+923001234567",
  "contactEmail": "warehouse@labverse.org",
  "isActive": true,
  "isDefault": true,
  "priority": 1
}
```

---

##### GET `/warehouses`

**Permission:** `inventory.read` — List warehouses.

**Query Parameters:** `sellerId`

---

##### GET `/warehouses/:id`

**Permission:** `inventory.read`

---

##### PATCH `/warehouses/:id`

**Permission:** `inventory.update`

---

##### DELETE `/warehouses/:id`

**Permission:** `inventory.delete`

---

##### GET `/warehouses/:id/inventory`

**Permission:** `inventory.read` — Get all inventory for a warehouse.

---

#### Inventory

##### GET `/inventory/product/:productId`

**Permission:** `inventory.read` — Get inventory for a product.

**Query Parameters:** `variantId`

---

##### POST `/inventory/adjust`

**Permission:** `inventory.update` — Adjust stock manually.

**Request Body:**

```json
{
  "productId": "product-uuid",
  "warehouseId": "warehouse-uuid",
  "adjustment": -5,
  "reason": "Damaged items removed",
  "variantId": null
}
```

---

##### POST `/inventory/reserve`

**Permission:** `inventory.update` — Reserve stock for an order.

**Request Body:**

```json
{
  "productId": "product-uuid",
  "warehouseId": "warehouse-uuid",
  "quantity": 2,
  "orderId": "order-uuid",
  "variantId": null
}
```

---

##### POST `/inventory/release/:reservationId`

**Permission:** `inventory.update` — Release a stock reservation.

---

##### GET `/inventory/movements/:productId`

**Permission:** `inventory.read` — Get stock movements.

**Query Parameters:** `warehouseId`, `page`, `limit`

---

##### POST `/inventory/movements`

**Permission:** `inventory.update` — Create a stock movement.

**Request Body:**

```json
{
  "inventoryId": "inventory-uuid",
  "type": "purchase",
  "quantity": 100,
  "referenceType": "purchase_order",
  "referenceId": "po-uuid",
  "costPerUnit": 8000.00,
  "note": "New shipment from supplier"
}
```

---

#### Inventory Transfers

##### POST `/inventory/transfers`

**Permission:** `inventory.create` — Create inter-warehouse transfer.

**Request Body:**

```json
{
  "fromWarehouseId": "warehouse-uuid-1",
  "toWarehouseId": "warehouse-uuid-2",
  "note": "Monthly stock rebalancing",
  "items": [
    {
      "productId": "product-uuid",
      "productVariantId": null,
      "quantityRequested": 25
    }
  ]
}
```

---

##### GET `/inventory/transfers`

**Permission:** `inventory.read` — List transfers.

**Query Parameters:** `warehouseId`

---

##### POST `/inventory/transfers/:id/complete`

**Permission:** `inventory.update` — Mark a transfer as completed.

---

### 10.13. Sellers & Stores

🔒 **Guards:** `JwtAuthGuard`, `PermissionsGuard` (class-level)

#### Sellers

##### POST `/sellers`

Register as a seller.

**Request Body:**

```json
{
  "userId": "user-uuid",
  "businessName": "Tech World Store",
  "businessNameAr": null,
  "cnic": "35201-1234567-1",
  "cnicFrontImage": "https://storage.example.com/cnic-front.jpg",
  "cnicBackImage": "https://storage.example.com/cnic-back.jpg",
  "bankName": "HBL",
  "bankAccountNumber": "1234567890",
  "bankAccountTitle": "Tech World",
  "bankIban": "PK36SCBL0000001123456789",
  "bankSwift": "HABORPKAXXX",
  "payoutFrequency": "weekly",
  "commissionRate": 10
}
```

---

##### GET `/sellers`

**Permission:** `sellers.read` — List all sellers.

---

##### GET `/sellers/:id`

Get a seller by ID.

---

##### PATCH `/sellers/:id`

**Permission:** `sellers.update`

---

##### DELETE `/sellers/:id`

**Permission:** `sellers.delete`

---

##### POST `/sellers/:sellerId/stores`

Create a store for a seller.

**Request Body:**

```json
{
  "sellerId": "seller-uuid",
  "name": "Tech World Official Store",
  "slug": "tech-world",
  "logoUrl": "https://storage.example.com/store-logo.png",
  "bannerUrl": "https://storage.example.com/store-banner.jpg",
  "description": "Official store for premium tech products",
  "returnPolicy": "30-day return policy",
  "shippingPolicy": "Free shipping on orders above Rs. 5000",
  "isActive": true
}
```

---

##### GET `/sellers/:sellerId/documents`

Get seller documents.

---

##### POST `/sellers/:sellerId/documents`

Upload a seller document.

**Request Body:**

```json
{
  "sellerId": "seller-uuid",
  "documentType": "tax_certificate",
  "fileUrl": "https://storage.example.com/tax-cert.pdf",
  "expiresAt": "2027-12-31T00:00:00Z"
}
```

---

##### GET `/sellers/:sellerId/wallet`

Get seller wallet balance.

---

##### GET `/sellers/:sellerId/wallet/transactions`

Get seller wallet transactions.

---

#### Stores

##### GET `/stores`

List all stores.

---

##### GET `/stores/:id`

Get a store by ID.

---

##### GET `/stores/slug/:slug`

Get a store by slug.

---

##### PATCH `/stores/:id`

**Permission:** `stores.update` — Update a store.

---

##### DELETE `/stores/:id`

**Permission:** `stores.delete` — Delete a store.

---

##### POST `/stores/:id/follow`

Follow a store.

---

##### DELETE `/stores/:id/follow`

Unfollow a store.

---

### 10.14. Reviews

#### POST `/reviews`

🔒 **Guard:** `JwtAuthGuard` — Create a review.

**Request Body:**

```json
{
  "productId": "product-uuid",
  "userId": "user-uuid",
  "orderId": "order-uuid",
  "rating": 5,
  "title": "Excellent headphones!",
  "content": "The sound quality is amazing and the ANC works perfectly.",
  "pros": ["Great sound", "Comfortable", "Long battery life"],
  "cons": ["Slightly heavy"],
  "images": ["https://storage.example.com/review-img-1.jpg"],
  "isVerifiedPurchase": true
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `productId` | UUID | Yes | — |
| `userId` | UUID | Yes | — |
| `orderId` | UUID | No | For verified purchase link |
| `rating` | number | Yes | Integer, 1–5 |
| `title` | string | No | Max 255 |
| `content` | string | No | — |
| `pros` | string[] | No | — |
| `cons` | string[] | No | — |
| `images` | string[] | No | Image URLs |
| `isVerifiedPurchase` | boolean | No | Default: `false` |

---

#### GET `/reviews`

🌐 **Public** — List reviews.

**Query Parameters:** `productId`, `userId`, `status`, `minRating`, `page`, `limit`

---

#### GET `/reviews/product/:productId/summary`

🌐 **Public** — Get rating summary for a product.

**Success Response (200):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "averageRating": 4.5,
    "totalReviews": 128,
    "ratingBreakdown": {
      "5": 72,
      "4": 35,
      "3": 12,
      "2": 6,
      "1": 3
    }
  },
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

#### GET `/reviews/:id`

🌐 **Public** — Get a review by ID.

---

#### PATCH `/reviews/:id`

🔒 **Guard:** `JwtAuthGuard` — Update own review.

---

#### DELETE `/reviews/:id`

🔒 **Guard:** `JwtAuthGuard` — Delete own review.

---

#### PATCH `/reviews/:id/status`

🔒 **Permission:** `reviews.update` — Moderate review status.

**Request Body:**

```json
{
  "status": "approved"
}
```

---

#### POST `/reviews/:id/helpful`

🔒 **Guard:** `JwtAuthGuard` — Mark a review as helpful/not helpful.

**Request Body:**

```json
{
  "isHelpful": true
}
```

---

#### POST `/reviews/:id/report`

🔒 **Guard:** `JwtAuthGuard` — Report a review.

**Request Body:**

```json
{
  "reason": "spam"
}
```

---

### 10.15. Returns & Return Reasons

🔒 **Guard:** `JwtAuthGuard` (class-level)

#### Returns

##### POST `/returns`

Create a return request.

**Request Body:**

```json
{
  "orderId": "order-uuid",
  "orderItemId": "order-item-uuid",
  "userId": "user-uuid",
  "reasonId": "reason-uuid",
  "reasonDetails": "Item arrived damaged with scratches on the surface",
  "type": "return",
  "quantity": 1,
  "refundAmount": 15999.99,
  "resolution": "refund",
  "customerNotes": "Photos attached showing damage"
}
```

---

##### GET `/returns`

🔒 **Permission:** `returns.read` — List returns.

**Query Parameters:** `userId`, `orderId`, `status`, `page`, `limit`

---

##### GET `/returns/:id`

Get a return request by ID.

---

##### PATCH `/returns/:id`

🔒 **Permission:** `returns.update` — Update a return request.

---

##### PATCH `/returns/:id/status`

🔒 **Permission:** `returns.update` — Update return status.

**Request Body:**

```json
{
  "status": "approved",
  "notes": "Return approved, please ship item back"
}
```

---

##### POST `/returns/:id/images`

Add an image to a return request.

**Request Body:**

```json
{
  "imageUrl": "https://storage.example.com/return-damage-photo.jpg"
}
```

---

#### Return Reasons

##### GET `/return-reasons`

🌐 **Public** — List all return reasons.

---

##### POST `/return-reasons`

🔒 **Permission:** `returns.create`

**Request Body:**

```json
{
  "name": "Defective Product",
  "description": "Product has manufacturing defects",
  "isActive": true,
  "requiresImages": true,
  "sortOrder": 1
}
```

---

##### PATCH `/return-reasons/:id`

🔒 **Permission:** `returns.update`

---

### 10.16. Disputes

🔒 **Guard:** `JwtAuthGuard` (class-level)

#### POST `/disputes`

Create a dispute.

**Request Body:**

```json
{
  "orderId": "order-uuid",
  "customerId": "customer-uuid",
  "sellerId": "seller-uuid",
  "type": "quality_issue",
  "subject": "Product does not match description",
  "description": "The headphones received are different from what was advertised",
  "disputedAmount": 15999.99
}
```

---

#### GET `/disputes`

🔒 **Permission:** `disputes.read` — List disputes.

**Query Parameters:** `customerId`, `orderId`, `status`, `page`, `limit`

---

#### GET `/disputes/:id`

Get a dispute by ID.

---

#### PATCH `/disputes/:id/status`

🔒 **Permission:** `disputes.update` — Update dispute status.

**Request Body:**

```json
{
  "status": "resolved",
  "resolution": "full_refund"
}
```

---

#### POST `/disputes/:id/evidence`

Add evidence to a dispute.

**Request Body:**

```json
{
  "disputeId": "dispute-uuid",
  "submittedBy": "user-uuid",
  "type": "screenshot",
  "fileUrl": "https://storage.example.com/evidence-1.jpg",
  "description": "Screenshot of product listing showing different specs"
}
```

---

#### GET `/disputes/:id/messages`

Get messages for a dispute.

---

#### POST `/disputes/:id/messages`

Add a message to a dispute.

**Request Body:**

```json
{
  "disputeId": "dispute-uuid",
  "senderId": "user-uuid",
  "message": "I have attached additional photos of the product received.",
  "isInternal": false,
  "attachments": []
}
```

---

### 10.17. Shipping

#### Shipping Zones

🔒 **Guards:** `JwtAuthGuard`, `PermissionsGuard`

##### POST `/shipping/zones`

**Permission:** `shipping.create`

**Request Body:**

```json
{
  "name": "Punjab",
  "description": "Punjab province delivery zone",
  "countries": ["PK"],
  "states": ["Punjab"],
  "postcodes": [],
  "isDefault": false
}
```

---

##### GET `/shipping/zones`

**Permission:** `shipping.read`

---

##### GET `/shipping/zones/:id`

**Permission:** `shipping.read`

---

##### PATCH `/shipping/zones/:id`

**Permission:** `shipping.update`

---

##### DELETE `/shipping/zones/:id`

**Permission:** `shipping.delete`

---

#### Shipping Methods

##### POST `/shipping/methods`

**Permission:** `shipping.create`

**Request Body:**

```json
{
  "name": "Standard Delivery",
  "description": "Delivery within 3-5 business days",
  "isActive": true,
  "estimatedDaysMin": 3,
  "estimatedDaysMax": 5,
  "sortOrder": 1
}
```

---

##### GET `/shipping/methods`

**Permission:** `shipping.read`

**Query Parameters:** `isActive`

---

##### PATCH `/shipping/methods/:id`

**Permission:** `shipping.update`

---

##### DELETE `/shipping/methods/:id`

**Permission:** `shipping.delete`

---

#### Shipping Carriers

##### POST `/shipping/carriers`

**Permission:** `shipping.create`

**Request Body:**

```json
{
  "name": "TCS",
  "code": "tcs",
  "logo": "https://storage.example.com/tcs-logo.png",
  "trackingUrlTemplate": "https://tcs.com.pk/track/{tracking_number}",
  "isActive": true,
  "settings": {}
}
```

---

##### GET `/shipping/carriers`

**Permission:** `shipping.read`

---

##### PATCH `/shipping/carriers/:id`

**Permission:** `shipping.update`

---

#### Shipping Rates

##### POST `/shipping/rates`

**Permission:** `shipping.create`

**Request Body:**

```json
{
  "shippingMethodId": "method-uuid",
  "shippingZoneId": "zone-uuid",
  "rateType": "flat",
  "baseRate": 250.00,
  "perKgRate": 50.00,
  "perItemRate": 0,
  "freeShippingThreshold": 5000.00
}
```

---

##### GET `/shipping/rates`

**Permission:** `shipping.read`

**Query Parameters:** `zoneId`, `methodId`

---

##### PATCH `/shipping/rates/:id`

**Permission:** `shipping.update`

---

#### Shipping Calculator

##### POST `/shipping/calculate`

🌐 **Public** — Calculate shipping cost.

**Request Body:**

```json
{
  "zoneId": "zone-uuid",
  "weight": 0.5,
  "totalAmount": 31999.98
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "shippingCost": 275.00,
    "method": "Standard Delivery",
    "estimatedDays": "3-5 business days"
  },
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

#### Delivery Slots

##### POST `/shipping/slots`

🔒 **Permission:** `shipping.create`

**Request Body:**

```json
{
  "name": "Morning Delivery",
  "startTime": "09:00:00",
  "endTime": "12:00:00",
  "daysOfWeek": [1, 2, 3, 4, 5],
  "maxOrders": 50,
  "additionalFee": 100.00,
  "isActive": true
}
```

---

##### GET `/shipping/slots`

🌐 **Public** — Get available delivery slots.

---

### 10.18. Tax

#### Tax Zones

🔒 **Guards:** `JwtAuthGuard`, `PermissionsGuard`

##### POST `/tax/zones`

**Permission:** `tax.create`

**Request Body:**

```json
{
  "name": "Pakistan Federal",
  "description": "Federal tax zone for Pakistan",
  "countries": ["PK"],
  "states": [],
  "postcodes": [],
  "isDefault": true
}
```

---

##### GET `/tax/zones` | GET `/tax/zones/:id`

**Permission:** `tax.read`

---

##### PATCH `/tax/zones/:id`

**Permission:** `tax.update`

---

##### DELETE `/tax/zones/:id`

**Permission:** `tax.delete`

---

#### Tax Rates

##### POST `/tax/rates`

**Permission:** `tax.create`

**Request Body:**

```json
{
  "taxClassId": "class-uuid",
  "taxZoneId": "zone-uuid",
  "name": "Sales Tax",
  "rate": 17.00,
  "priority": 0,
  "isCompound": false,
  "isShipping": false
}
```

---

##### GET `/tax/rates`

**Permission:** `tax.read`

**Query Parameters:** `zoneId`

---

##### PATCH `/tax/rates/:id`

**Permission:** `tax.update`

---

##### DELETE `/tax/rates/:id`

**Permission:** `tax.delete`

---

#### Tax Classes

##### POST `/tax/classes`

**Permission:** `tax.create`

**Request Body:**

```json
{
  "name": "Standard Rate",
  "description": "Standard tax rate for most products",
  "isDefault": true
}
```

---

##### GET `/tax/classes`

**Permission:** `tax.read`

---

##### PATCH `/tax/classes/:id`

**Permission:** `tax.update`

---

#### Tax Calculator

##### POST `/tax/calculate`

🌐 **Public** — Calculate tax for an amount.

**Request Body:**

```json
{
  "amount": 15999.99,
  "countryCode": "PK",
  "stateCode": "PB",
  "taxClassId": "class-uuid"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "taxAmount": 2720.00,
    "effectiveRate": 17.00,
    "breakdown": [
      {
        "name": "Sales Tax",
        "rate": 17.00,
        "amount": 2720.00
      }
    ]
  },
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

### 10.19. Marketing

#### Campaigns

🔒 **Guards:** `JwtAuthGuard`, `PermissionsGuard` (class-level)

##### POST `/marketing/campaigns`

**Permission:** `marketing.create`

**Request Body:**

```json
{
  "name": "Summer Sale 2026",
  "description": "Massive discounts on electronics and fashion",
  "type": "seasonal",
  "startsAt": "2026-06-01T00:00:00Z",
  "endsAt": "2026-06-30T23:59:59Z",
  "bannerImage": "https://storage.example.com/summer-sale-banner.jpg",
  "landingPageUrl": "/sale/summer-2026",
  "metadata": { "targetAudience": "all" }
}
```

---

##### GET `/marketing/campaigns`

**Permission:** `marketing.read`

**Query Parameters:** `isActive`

---

##### GET `/marketing/campaigns/:id`

**Permission:** `marketing.read`

---

##### PATCH `/marketing/campaigns/:id`

**Permission:** `marketing.update`

---

#### Flash Sales

##### POST `/marketing/flash-sales`

🔒 **Permission:** `marketing.create`

**Request Body:**

```json
{
  "name": "Flash Friday",
  "description": "4-hour flash sale on premium headphones",
  "startsAt": "2026-03-01T10:00:00Z",
  "endsAt": "2026-03-01T14:00:00Z",
  "bannerImage": "https://storage.example.com/flash-sale.jpg"
}
```

---

##### GET `/marketing/flash-sales/active`

🌐 **Public** — Get currently active flash sales.

---

##### GET `/marketing/flash-sales/:id`

🌐 **Public** — Get a flash sale by ID.

---

#### Vouchers

##### POST `/marketing/vouchers`

🔒 **Permission:** `marketing.create`

**Request Body:**

```json
{
  "code": "SUMMER20",
  "name": "Summer 20% Off",
  "description": "20% discount on all electronics",
  "type": "standard",
  "discountType": "percentage",
  "discountValue": 20,
  "maxDiscountAmount": 5000.00,
  "minOrderAmount": 3000.00,
  "usageLimit": 1000,
  "usageLimitPerUser": 1,
  "startsAt": "2026-06-01T00:00:00Z",
  "endsAt": "2026-06-30T23:59:59Z",
  "isStackable": false,
  "appliesToSaleItems": false
}
```

---

##### GET `/marketing/vouchers`

🔒 **Permission:** `marketing.read`

---

##### GET `/marketing/vouchers/code/:code`

🌐 **Public** — Look up a voucher by code.

---

##### POST `/marketing/vouchers/validate`

🔒 **Guard:** `JwtAuthGuard` — Validate a voucher code.

**Request Body:**

```json
{
  "code": "SUMMER20",
  "orderTotal": 15000.00
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "valid": true,
    "discountAmount": 3000.00,
    "voucher": {
      "code": "SUMMER20",
      "type": "percentage",
      "discountValue": 20,
      "maxDiscountAmount": 5000.00
    }
  },
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

##### POST `/marketing/vouchers/apply`

🔒 **Guard:** `JwtAuthGuard` — Apply a voucher to an order.

**Request Body:**

```json
{
  "code": "SUMMER20",
  "orderId": "order-uuid"
}
```

---

### 10.20. Bundles

#### POST `/bundles`

🔒 **Permission:** `bundles.create`

**Request Body:**

```json
{
  "name": "Audio Essentials Bundle",
  "slug": "audio-essentials-bundle",
  "description": "Get headphones, earbuds, and a speaker at a discount",
  "imageUrl": "https://storage.example.com/audio-bundle.jpg",
  "discountType": "percentage",
  "discountValue": 15,
  "startsAt": "2026-03-01T00:00:00Z",
  "endsAt": "2026-03-31T23:59:59Z",
  "isActive": true,
  "items": [
    { "productId": "product-uuid-1", "quantity": 1 },
    { "productId": "product-uuid-2", "quantity": 1 },
    { "productId": "product-uuid-3", "quantity": 1 }
  ]
}
```

---

#### GET `/bundles`

🌐 **Public** — List bundles.

**Query Parameters:** `isActive`, `page`, `limit`

---

#### GET `/bundles/active`

🌐 **Public** — List active bundles only.

---

#### GET `/bundles/:id`

🌐 **Public** — Get a bundle by ID.

---

#### GET `/bundles/slug/:slug`

🌐 **Public** — Get a bundle by slug.

---

#### PATCH `/bundles/:id`

🔒 **Permission:** `bundles.update`

---

#### DELETE `/bundles/:id`

🔒 **Permission:** `bundles.delete`

---

#### PATCH `/bundles/:id/toggle-active`

🔒 **Permission:** `bundles.update` — Toggle bundle active status.

---

#### POST `/bundles/:id/items`

🔒 **Permission:** `bundles.update` — Add an item to a bundle.

**Request Body:**

```json
{
  "productId": "product-uuid",
  "variantId": null,
  "quantity": 2
}
```

---

#### GET `/bundles/:id/items`

🌐 **Public** — Get items in a bundle.

---

#### PATCH `/bundles/:id/items/:itemId`

🔒 **Permission:** `bundles.update` — Update a bundle item.

---

#### DELETE `/bundles/:id/items/:itemId`

🔒 **Permission:** `bundles.update` — Remove an item from a bundle.

---

#### GET `/bundles/:id/price`

🌐 **Public** — Calculate the total/discounted price for a bundle.

---

### 10.21. Subscriptions

🔒 **Guard:** `JwtAuthGuard` (class-level)

#### POST `/subscriptions`

Create a subscription.

**Request Body:**

```json
{
  "productId": "product-uuid",
  "variantId": null,
  "quantity": 1,
  "frequency": "monthly",
  "deliveryAddressId": "address-uuid",
  "paymentMethodId": "payment-method-uuid",
  "unitPrice": 2500.00,
  "discountPercentage": 10,
  "nextDeliveryDate": "2026-03-15"
}
```

---

#### GET `/subscriptions`

🔒 **Permission:** `subscriptions.read` — List all subscriptions.

**Query Parameters:** `status`, `page`, `limit`

---

#### GET `/subscriptions/my-subscriptions`

Get the authenticated user's subscriptions.

---

#### GET `/subscriptions/due`

🔒 **Permission:** `subscriptions.read` — Get subscriptions due for renewal.

---

#### GET `/subscriptions/:id`

Get a subscription by ID.

---

#### PATCH `/subscriptions/:id`

Update a subscription.

---

#### POST `/subscriptions/:id/cancel`

Cancel a subscription.

**Request Body:**

```json
{
  "reason": "No longer needed"
}
```

---

#### POST `/subscriptions/:id/pause`

Pause a subscription.

---

#### POST `/subscriptions/:id/resume`

Resume a paused subscription.

---

#### POST `/subscriptions/:id/renew`

🔒 **Permission:** `subscriptions.update` — Process subscription renewal.

---

#### GET `/subscriptions/:id/orders`

Get orders generated by a subscription.

---

### 10.22. Loyalty & Referrals

🔒 **Guard:** `JwtAuthGuard` (class-level)

#### GET `/loyalty/points`

Get the authenticated user's loyalty points balance.

**Success Response (200):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "userId": "user-uuid",
    "totalPoints": 1500,
    "tier": {
      "name": "Gold",
      "earnMultiplier": 1.5
    }
  },
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

#### POST `/loyalty/points/earn`

🔒 **Permission:** `loyalty.create` — Award points to a user.

**Request Body:**

```json
{
  "userId": "user-uuid",
  "type": "purchase",
  "points": 150,
  "referenceType": "order",
  "referenceId": "order-uuid",
  "description": "Points earned for order #1234",
  "expiresAt": "2027-02-25T00:00:00Z"
}
```

---

#### POST `/loyalty/points/redeem`

Redeem loyalty points.

**Request Body:**

```json
{
  "points": 500,
  "orderId": "order-uuid"
}
```

---

#### GET `/loyalty/transactions`

Get the authenticated user's point transactions.

**Query Parameters:** `page`, `limit`

---

#### GET `/loyalty/tiers`

Get all loyalty tiers.

---

#### POST `/loyalty/tiers`

🔒 **Permission:** `loyalty.create`

**Request Body:**

```json
{
  "name": "Gold",
  "minPoints": 1000,
  "maxPoints": 5000,
  "earnMultiplier": 1.5,
  "benefits": { "freeShipping": true, "earlyAccess": true },
  "iconUrl": "https://storage.example.com/gold-tier.png",
  "colorHex": "#FFD700",
  "sortOrder": 2,
  "isActive": true
}
```

---

#### PATCH `/loyalty/tiers/:id`

🔒 **Permission:** `loyalty.update`

---

#### DELETE `/loyalty/tiers/:id`

🔒 **Permission:** `loyalty.delete`

---

#### GET `/loyalty/referral-code`

Get the authenticated user's referral code.

---

#### POST `/loyalty/referral/apply`

Apply a referral code.

**Request Body:**

```json
{
  "code": "JOHNDOE2026"
}
```

---

#### GET `/loyalty/referrals`

Get the authenticated user's referral history.

---

### 10.23. Chat & Messaging

🔒 **Guard:** `JwtAuthGuard` (class-level)

#### POST `/chat/conversations`

Create a new conversation.

**Request Body:**

```json
{
  "type": "customer_support",
  "customerId": "customer-uuid",
  "storeId": "store-uuid",
  "orderId": "order-uuid",
  "subject": "Question about my order"
}
```

---

#### GET `/chat/conversations`

Get the authenticated user's conversations.

---

#### GET `/chat/conversations/:id`

Get a conversation by ID.

---

#### POST `/chat/conversations/:id/messages`

Send a message in a conversation.

**Request Body:**

```json
{
  "conversationId": "conversation-uuid",
  "senderId": "user-uuid",
  "senderType": "customer",
  "content": "When will my order be shipped?",
  "attachments": [],
  "isSystem": false
}
```

---

#### GET `/chat/conversations/:id/messages`

Get messages in a conversation.

**Query Parameters:** `page`, `limit`

---

#### POST `/chat/conversations/:id/read`

Mark a conversation as read.

---

#### GET `/chat/unread-count`

Get the count of unread messages.

**Success Response (200):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "unreadCount": 3
  },
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

### 10.24. Notifications & Templates

🔒 **Guard:** `JwtAuthGuard` (class-level)

#### GET `/notifications`

Get the authenticated user's notifications.

**Query Parameters:** `isRead`, `type`, `page`, `limit`

---

#### GET `/notifications/unread-count`

Get unread notification count.

---

#### PATCH `/notifications/:id/read`

Mark a notification as read.

---

#### PATCH `/notifications/read-all`

Mark all notifications as read.

---

#### DELETE `/notifications/:id`

Delete a notification.

---

#### GET `/notifications/preferences`

Get notification preferences.

---

#### PATCH `/notifications/preferences/:type`

Update notification preferences for a type.

---

#### Notification Templates

🔒 **Guards:** `JwtAuthGuard`, `PermissionsGuard`

##### GET `/notification-templates`

**Permission:** `notifications.read`

---

##### POST `/notification-templates`

**Permission:** `notifications.create`

**Request Body:**

```json
{
  "code": "order_confirmed",
  "name": "Order Confirmation",
  "type": "transactional",
  "channels": ["in_app", "email"],
  "subject": "Your order has been confirmed!",
  "body": "Your order {{orderNumber}} has been confirmed.",
  "htmlBody": "<h1>Order Confirmed</h1><p>Your order {{orderNumber}} has been confirmed.</p>",
  "pushTitle": "Order Confirmed",
  "pushBody": "Order {{orderNumber}} confirmed",
  "variables": ["orderNumber", "userName", "totalAmount"],
  "isActive": true
}
```

---

##### PATCH `/notification-templates/:id`

**Permission:** `notifications.update`

---

### 10.25. Tickets & Support

🔒 **Guard:** `JwtAuthGuard` (class-level)

#### POST `/tickets`

Create a support ticket.

**Request Body:**

```json
{
  "categoryId": "ticket-category-uuid",
  "subject": "Order not received",
  "description": "I placed an order 10 days ago and it still hasn't arrived.",
  "priority": "high",
  "orderId": "order-uuid",
  "attachments": []
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `categoryId` | UUID | No | Ticket category |
| `subject` | string | Yes | Max 255 |
| `description` | string | Yes | — |
| `priority` | enum | No | `low`, `medium`, `high`, `urgent`. Default: `medium` |
| `orderId` | UUID | No | Related order |
| `attachments` | array | No | File attachment metadata |

---

#### GET `/tickets`

🔒 **Permission:** `tickets.read` — List all tickets.

**Query Parameters:** `userId`, `status`, `priority`, `page`, `limit`

---

#### GET `/tickets/my-tickets`

Get the authenticated user's tickets.

**Query Parameters:** `page`, `limit`

---

#### GET `/tickets/:id`

Get a ticket by ID.

---

#### PATCH `/tickets/:id`

🔒 **Permission:** `tickets.update` — Update a ticket.

---

#### PATCH `/tickets/:id/status`

🔒 **Permission:** `tickets.update` — Update ticket status.

**Request Body:**

```json
{
  "status": "in_progress"
}
```

---

#### PATCH `/tickets/:id/assign`

🔒 **Permission:** `tickets.update` — Assign a ticket to a support agent.

**Request Body:**

```json
{
  "assignedToId": "agent-user-uuid"
}
```

---

#### POST `/tickets/:id/messages`

Add a message to a ticket.

**Request Body:**

```json
{
  "ticketId": "ticket-uuid",
  "message": "Thank you for your patience. We are investigating this.",
  "isStaff": true,
  "isInternal": false,
  "attachments": []
}
```

---

#### GET `/tickets/:id/messages`

Get messages for a ticket.

---

#### GET `/tickets/categories/all`

Get all ticket categories.

---

#### POST `/tickets/categories`

🔒 **Permission:** `tickets.create` — Create a ticket category.

**Request Body:**

```json
{
  "name": "Order Issues",
  "description": "Issues related to order delivery and fulfillment",
  "parentId": null,
  "isActive": true,
  "sortOrder": 1
}
```

---

### 10.26. CMS (Pages & Banners)

#### Pages

##### POST `/cms/pages`

🔒 **Permission:** `cms.create`

**Request Body:**

```json
{
  "slug": "about-us",
  "title": "About Us",
  "content": "<h1>About LabVerse</h1><p>We are a leading e-commerce platform...</p>",
  "excerpt": "Learn about LabVerse",
  "metaTitle": "About Us - LabVerse",
  "metaDescription": "Learn about the LabVerse e-commerce platform",
  "sortOrder": 1,
  "isPublished": true
}
```

---

##### GET `/cms/pages`

🔒 **Permission:** `cms.read` — List all pages (including drafts).

**Query Parameters:** `isPublished`, `page`, `limit`

---

##### GET `/cms/pages/published`

🌐 **Public** — List published pages only.

---

##### GET `/cms/pages/slug/:slug`

🌐 **Public** — Get a page by slug.

---

##### GET `/cms/pages/:id`

🔒 **Permission:** `cms.read`

---

##### PATCH `/cms/pages/:id`

🔒 **Permission:** `cms.update`

---

##### DELETE `/cms/pages/:id`

🔒 **Permission:** `cms.delete`

---

##### POST `/cms/pages/:id/publish`

🔒 **Permission:** `cms.update` — Publish a page.

---

##### POST `/cms/pages/:id/unpublish`

🔒 **Permission:** `cms.update` — Unpublish a page.

---

#### Banners

##### POST `/cms/banners`

🔒 **Permission:** `cms.create`

**Request Body:**

```json
{
  "title": "Summer Sale",
  "subtitle": "Up to 50% off on all electronics",
  "imageUrl": "https://storage.example.com/summer-banner.jpg",
  "mobileImageUrl": "https://storage.example.com/summer-banner-mobile.jpg",
  "linkUrl": "/sale/summer-2026",
  "position": "homepage_hero",
  "sortOrder": 1,
  "startsAt": "2026-06-01T00:00:00Z",
  "endsAt": "2026-06-30T23:59:59Z",
  "isActive": true
}
```

---

##### GET `/cms/banners`

🔒 **Permission:** `cms.read` — List all banners.

**Query Parameters:** `isActive`, `position`, `page`, `limit`

---

##### GET `/cms/banners/active/:position`

🌐 **Public** — Get active banners by position.

---

##### GET `/cms/banners/:id`

🔒 **Permission:** `cms.read`

---

##### PATCH `/cms/banners/:id`

🔒 **Permission:** `cms.update`

---

##### DELETE `/cms/banners/:id`

🔒 **Permission:** `cms.delete`

---

##### PATCH `/cms/banners/:id/toggle-active`

🔒 **Permission:** `cms.update` — Toggle banner active status.

---

### 10.27. SEO & URL Redirects

🔒 **Guards:** `JwtAuthGuard`, `PermissionsGuard` (class-level)

#### SEO Metadata

##### POST `/seo/metadata`

**Permission:** `seo.create`

**Request Body:**

```json
{
  "entityType": "product",
  "entityId": "product-uuid",
  "metaTitle": "Premium Wireless Headphones - LabVerse",
  "metaDescription": "Buy premium wireless headphones with ANC",
  "metaKeywords": ["headphones", "wireless", "ANC"],
  "canonicalUrl": "https://labverse.org/products/premium-wireless-headphones",
  "ogTitle": "Premium Wireless Headphones",
  "ogDescription": "High-quality wireless headphones with noise cancellation",
  "ogImageUrl": "https://storage.example.com/product-og.jpg",
  "ogType": "product",
  "twitterCardType": "summary_large_image",
  "robotsDirective": "index, follow",
  "structuredData": {
    "@type": "Product",
    "name": "Premium Wireless Headphones"
  }
}
```

---

##### GET `/seo/metadata`

**Permission:** `seo.read`

**Query Parameters:** `entityType`, `page`, `limit`

---

##### GET `/seo/metadata/:id`

**Permission:** `seo.read`

---

##### GET `/seo/metadata/entity/:entityType/:entityId`

**Permission:** `seo.read` — Get SEO metadata for a specific entity.

---

##### PATCH `/seo/metadata/:id`

**Permission:** `seo.update`

---

##### DELETE `/seo/metadata/:id`

**Permission:** `seo.delete`

---

##### POST `/seo/metadata/upsert/:entityType/:entityId`

**Permission:** `seo.update` — Create or update SEO metadata for an entity.

---

#### URL Redirects

##### POST `/seo/redirects`

**Permission:** `seo.create`

**Request Body:**

```json
{
  "sourceUrl": "/old-product-page",
  "targetUrl": "/products/new-product-page",
  "redirectType": "permanent_301",
  "isActive": true
}
```

---

##### POST `/seo/redirects/bulk`

**Permission:** `seo.create` — Bulk create redirects.

**Request Body:** Array of redirect objects.

---

##### GET `/seo/redirects`

**Permission:** `seo.read`

**Query Parameters:** `isActive`, `page`, `limit`

---

##### GET `/seo/redirects/:id`

**Permission:** `seo.read`

---

##### PATCH `/seo/redirects/:id`

**Permission:** `seo.update`

---

##### DELETE `/seo/redirects/:id`

**Permission:** `seo.delete`

---

##### PATCH `/seo/redirects/:id/toggle-active`

**Permission:** `seo.update` — Toggle redirect active status.

---

### 10.28. Search, Recently Viewed & Recommendations

🔒 **Guard:** `JwtAuthGuard` (class-level)

#### Search History

##### POST `/search/history`

Save a search query.

**Request Body:**

```json
{
  "query": "wireless headphones"
}
```

---

##### GET `/search/history`

Get search history.

**Query Parameters:** `limit`

---

##### DELETE `/search/history`

Clear search history.

---

#### Recently Viewed

##### POST `/search/recently-viewed/:productId`

Add a product to recently viewed.

---

##### GET `/search/recently-viewed`

Get recently viewed products.

**Query Parameters:** `limit`

---

#### Product Comparison

##### POST `/search/compare/:productId`

Add a product to comparison list.

---

##### GET `/search/compare`

Get the comparison list.

---

##### DELETE `/search/compare/:productId`

Remove a product from comparison.

---

#### Recommendations

##### GET `/search/recommendations`

Get product recommendations.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `productId` | UUID | Yes | Source product for recommendations |

---

### 10.29. Internationalization (i18n)

#### Languages

##### POST `/i18n/languages`

🔒 **Permission:** `i18n.create`

**Request Body:**

```json
{
  "code": "ur",
  "name": "Urdu",
  "nativeName": "اردو",
  "direction": "rtl",
  "isDefault": false,
  "isActive": true,
  "sortOrder": 2
}
```

---

##### GET `/i18n/languages`

🌐 **Public** — List all languages.

**Query Parameters:** `isActive`

---

##### GET `/i18n/languages/active`

🌐 **Public** — List active languages.

---

##### GET `/i18n/languages/code/:code`

🌐 **Public** — Get language by code.

---

##### GET `/i18n/languages/:id`

🌐 **Public** — Get language by ID.

---

##### PATCH `/i18n/languages/:id`

🔒 **Permission:** `i18n.update`

---

##### DELETE `/i18n/languages/:id`

🔒 **Permission:** `i18n.delete`

---

##### POST `/i18n/languages/:id/set-default`

🔒 **Permission:** `i18n.update` — Set a language as default.

---

#### Currencies

##### POST `/i18n/currencies`

🔒 **Permission:** `i18n.create`

**Request Body:**

```json
{
  "code": "PKR",
  "name": "Pakistani Rupee",
  "symbol": "Rs.",
  "symbolPosition": "before",
  "decimalPlaces": 2,
  "thousandsSeparator": ",",
  "decimalSeparator": ".",
  "exchangeRate": 1.0,
  "isDefault": true,
  "isActive": true
}
```

---

##### GET `/i18n/currencies`

🌐 **Public** — List all currencies.

---

##### GET `/i18n/currencies/active`

🌐 **Public** — List active currencies.

---

##### GET `/i18n/currencies/code/:code`

🌐 **Public** — Get currency by code.

---

##### GET `/i18n/currencies/convert`

🌐 **Public** — Convert amount between currencies.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `amount` | number | Yes | Amount to convert |
| `from` | string | Yes | Source currency code |
| `to` | string | Yes | Target currency code |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "originalAmount": 100,
    "convertedAmount": 27850.00,
    "fromCurrency": "USD",
    "toCurrency": "PKR",
    "exchangeRate": 278.50
  },
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

##### GET `/i18n/currencies/:id`

🌐 **Public**

---

##### GET `/i18n/currencies/:id/rate-history`

🔒 **Permission:** `i18n.read` — Exchange rate history.

**Query Parameters:** `limit`

---

##### PATCH `/i18n/currencies/:id`

🔒 **Permission:** `i18n.update`

---

##### DELETE `/i18n/currencies/:id`

🔒 **Permission:** `i18n.delete`

---

##### POST `/i18n/currencies/:id/set-default`

🔒 **Permission:** `i18n.update` — Set a currency as default.

---

#### Translations

🔒 **Guards:** `JwtAuthGuard`, `PermissionsGuard` (class-level)

##### POST `/i18n/translations`

**Permission:** `i18n.create`

**Request Body:**

```json
{
  "languageId": "language-uuid",
  "entityType": "product",
  "entityId": "product-uuid",
  "fieldName": "name",
  "translatedValue": "پریمیم وائرلیس ہیڈفونز",
  "isAutoTranslated": false
}
```

---

##### GET `/i18n/translations`

**Permission:** `i18n.read`

**Query Parameters:** `languageId`, `entityType`, `entityId`

---

##### PATCH `/i18n/translations/:id`

**Permission:** `i18n.update`

---

##### DELETE `/i18n/translations/:id`

**Permission:** `i18n.delete`

---

##### POST `/i18n/translations/upsert`

**Permission:** `i18n.update` — Create or update a translation.

**Request Body:**

```json
{
  "languageId": "language-uuid",
  "entityType": "product",
  "entityId": "product-uuid",
  "field": "name",
  "value": "Updated translation text"
}
```

---

### 10.30. System Settings & Feature Flags

🔒 **Guards:** `JwtAuthGuard`, `PermissionsGuard` (class-level)

#### System Settings

##### POST `/system/settings`

**Permission:** `system.create`

**Request Body:**

```json
{
  "group": "general",
  "key": "site_name",
  "value": "LabVerse",
  "valueType": "string",
  "displayName": "Site Name",
  "description": "The name of the platform",
  "isPublic": true,
  "isEncrypted": false
}
```

---

##### GET `/system/settings`

**Permission:** `system.read`

**Query Parameters:** `group`

---

##### GET `/system/settings/group/:group`

**Permission:** `system.read` — Get settings by group.

---

##### GET `/system/settings/key/:key`

**Permission:** `system.read` — Get a setting by key.

---

##### GET `/system/settings/:id`

**Permission:** `system.read`

---

##### PATCH `/system/settings/:id`

**Permission:** `system.update`

---

##### PATCH `/system/settings/key/:key`

**Permission:** `system.update` — Update setting by key.

**Request Body:**

```json
{
  "value": "New Value"
}
```

---

##### POST `/system/settings/bulk`

**Permission:** `system.update` — Bulk update settings.

**Request Body:**

```json
[
  { "key": "site_name", "value": "LabVerse Store" },
  { "key": "contact_email", "value": "info@labverse.org" }
]
```

---

##### DELETE `/system/settings/:id`

**Permission:** `system.delete`

---

#### Feature Flags

##### POST `/system/features`

**Permission:** `system.create`

**Request Body:**

```json
{
  "name": "dark_mode",
  "description": "Enable dark mode for users",
  "isEnabled": false,
  "rolloutPercentage": 25,
  "conditions": { "minAppVersion": "2.0" },
  "enabledForRoles": ["admin", "seller"],
  "enabledForUsers": []
}
```

---

##### GET `/system/features`

**Permission:** `system.read`

---

##### GET `/system/features/enabled`

**Permission:** `system.read` — Get only enabled features.

---

##### GET `/system/features/:id`

**Permission:** `system.read`

---

##### PATCH `/system/features/:id`

**Permission:** `system.update`

---

##### PATCH `/system/features/:id/toggle`

**Permission:** `system.update` — Toggle a feature flag.

---

##### DELETE `/system/features/:id`

**Permission:** `system.delete`

---

### 10.31. Operations (Bulk & Import/Export)

#### Bulk Operations

🔒 **Guards:** `JwtAuthGuard`, `PermissionsGuard` (class-level)

##### POST `/operations/bulk`

**Permission:** `operations.create`

**Request Body:**

```json
{
  "operationType": "update",
  "entityType": "products",
  "entityIds": ["uuid-1", "uuid-2", "uuid-3"],
  "parameters": {
    "status": "active"
  }
}
```

---

##### GET `/operations/bulk`

**Permission:** `operations.read`

**Query Parameters:** `status`, `operationType`, `page`, `limit`

---

##### GET `/operations/bulk/:id`

**Permission:** `operations.read`

---

##### PATCH `/operations/bulk/:id/progress`

**Permission:** `operations.update` — Update operation progress.

**Request Body:**

```json
{
  "successCount": 50,
  "failureCount": 2
}
```

---

##### POST `/operations/bulk/:id/cancel`

**Permission:** `operations.update` — Cancel a bulk operation.

---

##### POST `/operations/bulk/:id/fail`

**Permission:** `operations.update` — Mark operation as failed.

**Request Body:**

```json
{
  "errorLog": [
    { "entityId": "uuid-1", "error": "Not found" }
  ]
}
```

---

#### Import/Export Jobs

##### POST `/operations/jobs`

🔒 **Permission:** `operations.create`

**Request Body:**

```json
{
  "type": "import",
  "sourceFileUrl": "https://storage.example.com/products-import.csv",
  "totalRows": 500,
  "options": { "skipHeader": true, "delimiter": "," }
}
```

---

##### GET `/operations/jobs`

🔒 **Permission:** `operations.read`

**Query Parameters:** `type`, `status`, `userId`, `page`, `limit`

---

##### GET `/operations/jobs/my-jobs`

Get the authenticated user's jobs.

**Query Parameters:** `jobType`

---

##### GET `/operations/jobs/:id`

Get a job by ID.

---

##### PATCH `/operations/jobs/:id/progress`

🔒 **Permission:** `operations.update`

**Request Body:**

```json
{
  "processedRows": 250,
  "successRows": 248,
  "failedRows": 2
}
```

---

##### POST `/operations/jobs/:id/complete`

🔒 **Permission:** `operations.update`

**Request Body:**

```json
{
  "resultFileUrl": "https://storage.example.com/import-results.csv"
}
```

---

##### POST `/operations/jobs/:id/fail`

🔒 **Permission:** `operations.update`

**Request Body:**

```json
{
  "errorMessage": "CSV parsing failed at row 125",
  "errorDetails": { "row": 125, "column": "price", "value": "invalid" }
}
```

---

### 10.32. Audit & Activity Logs

🔒 **Guards:** `JwtAuthGuard`, `PermissionsGuard` (class-level)

#### Audit Logs

##### GET `/audit/logs`

**Permission:** `audit.read`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | UUID | No | Filter by user |
| `action` | string | No | Filter by action |
| `entityType` | string | No | Filter by entity type |
| `startDate` | string | No | Start date filter |
| `endDate` | string | No | End date filter |
| `page` | number | No | Page number |
| `limit` | number | No | Items per page |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "id": "log-uuid",
      "userId": "user-uuid",
      "action": "update",
      "entityType": "product",
      "entityId": "product-uuid",
      "changedFields": ["price", "stock"],
      "oldValues": { "price": 15999.99, "stock": 100 },
      "newValues": { "price": 14999.99, "stock": 95 },
      "ipAddress": "192.168.1.1",
      "createdAt": "2026-02-25T12:00:00.000Z"
    }
  ],
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

---

##### GET `/audit/logs/entity/:entityType/:entityId`

**Permission:** `audit.read` — Get full change history for a specific entity.

---

##### GET `/audit/logs/user/:userId`

**Permission:** `audit.read` — Get all activity for a user.

**Query Parameters:** `startDate`, `endDate`

---

##### GET `/audit/logs/:id`

**Permission:** `audit.read` — Get a single audit log entry.

---

##### POST `/audit/logs/cleanup`

**Permission:** `audit.delete` — Clean up old audit logs.

**Request Body:**

```json
{
  "daysToKeep": 90
}
```

---

#### Activity Logs

##### GET `/audit/activity`

**Permission:** `audit.read`

**Query Parameters:** `userId`, `activityType`, `startDate`, `endDate`, `page`, `limit`

---

##### GET `/audit/activity/my-activity`

Get the authenticated user's own activity. No special permissions.

**Query Parameters:** `days`

---

##### GET `/audit/activity/user/:userId/summary`

**Permission:** `audit.read` — Get activity summary for a user.

**Query Parameters:** `days`

---

## 11. Role-Based Access Control (RBAC)

### System Roles

| Role | Description | Permission Bypass |
|------|-------------|-------------------|
| `super_admin` | Full system access | Bypasses ALL role and permission checks |
| `admin` | Platform administrator | Bypasses ALL role and permission checks |
| `seller` | Multi-vendor seller | Access to own products, inventory, orders, store |
| `customer` | End user/buyer | Access to own cart, orders, reviews, returns |
| `support_agent` | Customer support staff | Access to tickets, disputes |

### Permission Format

Permissions follow the pattern `module.action`:

```
products.create    products.read    products.update    products.delete
orders.create      orders.read      orders.update      orders.delete
inventory.create   inventory.read   inventory.update   inventory.delete
```

### 42 Permission Modules

```
users, roles, permissions, role_permissions, products, categories,
brands, attributes, cart, wishlist, checkout, orders, shipments,
payments, refunds, payment_methods, inventory, warehouses,
inventory_transfers, sellers, stores, seller_documents, seller_wallets,
reviews, returns, return_reasons, disputes, shipping, tax, marketing,
vouchers, flash_sales, bundles, subscriptions, loyalty, chat,
notifications, tickets, cms, seo, i18n, system, operations, audit
```

### Permission Check Flow

```
Request → JwtAuthGuard (verify token)
        → RolesGuard (check role if @Roles() applied)
        → PermissionsGuard (check permission if @Permissions() applied)
        → Controller Method

If user.role == 'super_admin' or 'admin':
  → Skip all role and permission checks
  → Grant access immediately

Else:
  → Query permissions table joining roles → users
  → Build permission set
  → Check if ANY required permission exists in user's set
  → Allow or throw ForbiddenException
```

---

## 12. Error Handling

### Global Exception Filter

The `GlobalExceptionFilter` catches all exceptions and formats them consistently:

#### HTTP Exceptions

```json
{
  "success": false,
  "message": "Resource not found",
  "error": "Not Found",
  "statusCode": 404,
  "timestamp": "2026-02-25T12:00:00.000Z",
  "path": "/products/invalid-uuid"
}
```

#### Validation Errors

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Bad Request",
  "statusCode": 400,
  "timestamp": "2026-02-25T12:00:00.000Z",
  "path": "/auth/register",
  "details": [
    "name: name must be shorter than or equal to 100 characters",
    "email: email must be an email",
    "password: password must be longer than or equal to 8 characters"
  ]
}
```

#### Database Errors

| Error Type | Status Code | Message |
|------------|-------------|---------|
| Duplicate key (unique violation) | 409 | "Duplicate entry detected" |
| Foreign key violation | 400 | "Related record not found or invalid reference" |
| NOT NULL violation | 400 | "Required field is missing" |
| Other query errors | 400 | "Database operation failed" |

#### General Errors

The filter pattern-matches error messages to determine the appropriate status code:

| Pattern | Status Code |
|---------|-------------|
| `validation`, `invalid`, `required`, `must be` | 400 |
| `unauthorized`, `token`, `jwt`, `auth` | 401 |
| `not found`, `does not exist` | 404 |
| Everything else | 500 |

---

## 13. Validation

### Global Validation Pipe

The `GlobalValidationPipe` is applied globally with these settings:

| Setting | Value | Effect |
|---------|-------|--------|
| `whitelist` | `true` | Strips properties not decorated with validation decorators |
| `forbidNonWhitelisted` | `true` | Throws an error if unknown properties are sent |
| `transform` | `true` | Automatically transforms payloads to DTO class instances |
| `enableImplicitConversion` | `false` | Does not auto-convert types |

### Validation Error Format

```json
{
  "success": false,
  "message": "Validation failed",
  "statusCode": 400,
  "details": [
    "name: name should not be empty",
    "email: email must be an email",
    "password: password must match /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/ regular expression"
  ]
}
```

### Common Validation Decorators Used

| Decorator | Purpose |
|-----------|---------|
| `@IsString()` | Must be a string |
| `@IsEmail()` | Must be a valid email |
| `@IsNotEmpty()` | Must not be empty |
| `@IsOptional()` | Field is optional |
| `@IsUUID('4')` / `@IsUuidString()` | Must be a valid UUID |
| `@IsEnum(EnumType)` | Must be a valid enum value |
| `@IsNumber()` | Must be a number |
| `@IsInt()` | Must be an integer |
| `@IsBoolean()` | Must be a boolean |
| `@IsArray()` | Must be an array |
| `@IsDateString()` | Must be an ISO date string |
| `@IsUrl()` | Must be a valid URL |
| `@IsIP()` | Must be a valid IP address |
| `@MinLength(n)` / `@MaxLength(n)` | String length bounds |
| `@Min(n)` / `@Max(n)` | Numeric bounds |
| `@Matches(regex)` | Must match regex pattern |
| `@Transform()` | Transform value before validation |
| `@ValidateNested()` | Validate nested objects |
| `@Type(() => Class)` | Type hint for nested class |

---

## 14. Rate Limiting & Security

### Rate Limiting

Two layers of rate limiting are applied:

#### Express Rate Limit (Global)

Applied in `main.ts`:

| Setting | Value |
|---------|-------|
| Window | 60 seconds |
| Max Requests | 300 per window |
| Standard Headers | `true` (RFC 6585) |
| Legacy Headers | `false` |

#### NestJS Throttler Guard (Per-route)

Applied globally via `ThrottlerModule`:

| Setting | Default | Configurable Via |
|---------|---------|------------------|
| TTL | 60,000 ms (1 min) | `THROTTLE_TTL` |
| Limit | 100 requests | `THROTTLE_LIMIT` |

### Security Headers (Helmet)

Helmet is configured with:

| Header | Configuration |
|--------|---------------|
| Content-Security-Policy | `img-src: 'self' data: https:`, `script-src: 'self' 'unsafe-inline'`, `style-src: 'self' 'unsafe-inline'` |
| Cross-Origin-Embedder-Policy | Disabled |
| Cross-Origin-Opener-Policy | `same-origin-allow-popups` |
| X-Content-Type-Options | `nosniff` |
| X-Frame-Options | `SAMEORIGIN` |
| X-XSS-Protection | `0` (modern browsers) |
| Strict-Transport-Security | Enabled |

### CORS Configuration

```typescript
{
  origin: (origin, cb) => {
    // Allow: no origin (server-to-server), configured FRONTEND_URLS,
    // and hardcoded domains
    if (!origin) return cb(null, true);
    if (allowed.includes(origin)) return cb(null, true);
    return cb(new Error('CORS blocked'), false);
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type, Authorization',
  exposedHeaders: 'Authorization'
}
```

Default allowed origins:
- `https://adminapi.labverse.org`
- `http://localhost:3000`
- `https://labverse.org`
- `https://www.labverse.org`
- Any origins in `FRONTEND_URLS` env var

### Password Security

- Passwords are hashed with **bcryptjs** before storage
- Minimum 8 characters with uppercase, lowercase, and digit requirements
- Bcrypt salt rounds ensure brute-force resistance

---

## 15. Swagger / OpenAPI Documentation

### Accessing Swagger UI

| URL | Description |
|-----|-------------|
| `http://localhost:3001/api/docs` | Interactive Swagger UI |
| `http://localhost:3001/api/docs-json` | Raw OpenAPI JSON spec |

### Configuration

```typescript
const config = new DocumentBuilder()
  .setTitle('LabVerse API')
  .setDescription('LabVerse E-Commerce Platform API')
  .setVersion('1.0')
  .addBearerAuth(
    { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    'JWT-auth',
  )
  .build();
```

### Using Swagger for API Testing

1. Navigate to `http://localhost:3001/api/docs`
2. Click **Authorize** (🔒 button)
3. Enter your JWT token: `Bearer eyJhbGciOiJIUzI1NiIs...`
4. Enable **Persist authorization** to keep the token across page reloads
5. Try out any endpoint directly from the Swagger UI

---

## 16. Real-Time Features (WebSocket)

> **⚠️ Not Yet Implemented** — The `@nestjs/websockets` and `socket.io` dependencies are installed, and the Chat module has entity definitions for conversations and messages, but **no WebSocket gateway has been implemented yet**. Real-time chat currently operates via REST endpoints only.
>
> To enable real-time features, a WebSocket gateway needs to be created and integrated with the Chat module.

### Planned Architecture

The Chat module (`src/modules/chat/`) provides REST endpoints for:
- Creating conversations
- Sending messages
- Marking messages as read
- Listing conversations and messages

Once the WebSocket gateway is implemented, it will provide:
- Real-time message delivery
- Online presence indicators
- Typing indicators

The application includes WebSocket support via Socket.IO (`@nestjs/platform-socket.io`).

### Chat Module

The `ChatModule` supports real-time messaging for:
- Customer-to-seller conversations
- Customer-to-support conversations
- Order-related discussions

### Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connect', () => {
  console.log('Connected to WebSocket');
});

socket.on('message', (data) => {
  console.log('New message:', data);
});
```

---

## 17. File Storage (Supabase)

> **⚠️ Partially Implemented** — The `SupabaseService` (`src/common/services/supabase.service.ts`) exists with Supabase SDK integration, but it is **not currently wired into any module's upload flow**. File upload endpoints are not yet functional.

The application uses **Supabase Storage** for file uploads (product images, seller documents, review images, etc.).

### Configuration

Set these environment variables:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_BUCKET_NAME=uploads
```

### File Upload Flow

1. Client uploads file via multipart form data (handled by `multer`)
2. Server validates file type and size
3. File is uploaded to Supabase Storage bucket
4. Public URL is returned and stored in the database

### Supported File Types

Files are typically images (JPEG, PNG, WebP) and documents (PDF) uploaded for:
- Product images
- Product variant images
- Review images
- Seller documents (CNIC, tax certificates)
- Store logos and banners
- CMS banner images
- Dispute evidence

---

## 18. Testing

> **⚠️ Test Coverage is Minimal** — The project currently has only 1 basic e2e test (`test/app.e2e-spec.ts` — tests `GET /`) and 1 integration test (`test/integration/auth.integration.spec.ts` — tests auth endpoints). No unit tests exist for individual services or controllers. See [docs/KNOWN-ISSUES.md](docs/KNOWN-ISSUES.md) for details.

### Current Test Status

| Type | Files | Coverage |
|------|-------|----------|
| E2E | `test/app.e2e-spec.ts` | Root endpoint only |
| Integration | `test/integration/auth.integration.spec.ts` | Auth module only |
| Unit tests | None | 0% |

### Test Structure

```
test/
├── app.e2e-spec.ts          # Basic e2e test (GET /)
├── jest-e2e.json             # E2E Jest config
├── jest.config.js            # Module test config
├── integration/              # Integration tests
│   └── auth.integration.spec.ts  # Auth flow tests
└── utils/                    # Test utilities
    └── test-helpers.ts       # Helper functions
```

### Running Tests

```bash
# Unit tests
npm run test

# Unit tests in watch mode
npm run test:watch

# E2E tests
npm run test:e2e

# Module-specific tests
npm run test:modules

# Tests with coverage
npm run test:cov

# Debug mode
npm run test:debug
```

### Test Configuration

**Unit Tests** (`jest` in `package.json`):
- Root dir: `src`
- Test regex: `.*\.spec\.ts$`
- Transform: `ts-jest`
- Environment: `node`

**E2E Tests** (`test/jest-e2e.json`):
- Uses `supertest` for HTTP assertions
- Tests actual HTTP endpoints against a test database

---

## 19. Deployment Guide

### Production Build

```bash
# Install production dependencies only
npm ci --production

# Build the project
npm run build

# The compiled output is in dist/
```

### Running in Production

```bash
# Set environment variables
export NODE_ENV=production
export PORT=3001
export DB_HOST=your-db-host
# ... set all required variables

# Run migrations
npm run migration:run

# Seed initial data (first deployment only)
npm run seed:all

# Start the server
npm run start:prod
```

### Docker Deployment

Example `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/migrations ./src/migrations
EXPOSE 3001
CMD ["node", "dist/main"]
```

### Environment Checklist for Production

- [ ] Set `NODE_ENV=production`
- [ ] Use a strong, unique `JWT_SECRET` (256-bit minimum)
- [ ] Configure `FRONTEND_URLS` with production domains
- [ ] Set `TYPEORM_LOGGING=false`
- [ ] Use a managed PostgreSQL instance
- [ ] Configure Supabase production keys
- [ ] Run migrations: `npm run migration:run`
- [ ] Seed data (first deployment): `npm run seed:all`
- [ ] Set up HTTPS/TLS termination (via reverse proxy)
- [ ] Configure proper CORS origins
- [ ] Set appropriate rate limits for production traffic
- [ ] Set up monitoring and health checks (`GET /health`)
- [ ] Configure log aggregation

### Recommended Infrastructure

| Component | Recommendation |
|-----------|---------------|
| **Reverse Proxy** | Nginx or AWS ALB |
| **Process Manager** | PM2 or Docker containers |
| **Database** | AWS RDS PostgreSQL or Supabase Postgres |
| **File Storage** | Supabase Storage |
| **SSL/TLS** | Let's Encrypt or AWS ACM |
| **Monitoring** | PM2 monitoring, CloudWatch, or Datadog |
| **CI/CD** | GitHub Actions |

---

## 20. Project Structure

```
labverse-api/
├── nest-cli.json                      # NestJS CLI configuration
├── package.json                       # Dependencies and scripts
├── tsconfig.json                      # TypeScript configuration
├── tsconfig.build.json                # TypeScript build configuration
├── .env                               # Environment variables (not committed)
│
├── seeds/                             # Database seed scripts
│   ├── seed-permissions-super-admin.ts  # Step 1: Create roles & permissions
│   ├── seed-role-permissions.ts         # Step 2: Assign role permissions
│   └── seed-super-admin-user.ts         # Step 3: Create super admin user
│
├── src/
│   ├── main.ts                        # Application bootstrap
│   ├── app.module.ts                  # Root module (imports all modules)
│   ├── app.controller.ts             # Health check & root endpoints
│   ├── app.service.ts                # App service
│   │
│   ├── config/                        # Configuration
│   │   ├── data-source.ts            # TypeORM CLI data source
│   │   ├── database.config.ts        # Database configuration
│   │   └── security.config.ts        # Security configuration
│   │
│   ├── common/                        # Shared infrastructure
│   │   ├── controllers/              # Base controllers
│   │   ├── decorators/               # Custom decorators (@CurrentUser, @Permissions, @Roles)
│   │   ├── enums/                    # Shared enums (UserRole, etc.)
│   │   ├── filters/                  # Global exception filter
│   │   ├── guards/                   # Auth, Roles, Permissions guards
│   │   ├── interceptor/             # Response interceptor
│   │   ├── interfaces/              # Shared interfaces
│   │   ├── middleware/              # HTTP middleware
│   │   ├── modules/                 # Guards module, MailModule (nodemailer)
│   │   ├── pipes/                   # Global validation pipe
│   │   ├── services/               # Shared services (SupabaseService)
│   │   └── utils/                  # Utility functions (jwt, logger, security, validation)
│   │
│   ├── migrations/                  # Database migrations (35 files)
│   │   ├── 1700000000001-CreateEcommerceExtensions.ts
│   │   ├── 1700000000002-CreateEcommerceEnums.ts
│   │   ├── ...
│   │   └── 1700000000035-CreateEcommerceMaintenance.ts
│   │
│   └── modules/                     # Feature modules
│       ├── audit/                   # Audit & activity logs
│       │   ├── audit.module.ts
│       │   ├── audit.controller.ts
│       │   ├── audit.service.ts
│       │   ├── dto/
│       │   └── entities/
│       ├── auth/                    # Authentication
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── dto/
│       │   ├── entities/
│       │   └── strategies/          # JWT strategy
│       ├── bundles/                 # Product bundles
│       ├── cart/                    # Cart, Wishlist, Checkout
│       ├── categories/             # Categories, Brands, Attributes
│       ├── chat/                   # Real-time chat
│       ├── cms/                    # CMS pages & banners
│       ├── disputes/               # Dispute resolution
│       ├── i18n/                   # Internationalization
│       ├── inventory/              # Inventory management
│       ├── loyalty/                # Loyalty program
│       ├── marketing/              # Campaigns, vouchers, flash sales
│       ├── notifications/          # Notifications & templates
│       ├── operations/             # Bulk operations, import/export
│       ├── orders/                 # Orders & shipments
│       ├── payments/               # Payments, refunds, saved methods
│       ├── permissions/            # Permission management
│       ├── products/               # Products, variants, images
│       ├── returns/                # Returns & return reasons
│       ├── reviews/                # Product reviews
│       ├── role-permissions/       # Role-permission assignments
│       ├── roles/                  # Role management
│       ├── search/                 # Search, recommendations
│       ├── sellers/                # Sellers & stores
│       ├── seo/                    # SEO metadata & redirects
│       ├── shared/                 # Shared module
│       ├── shipping/               # Shipping zones, methods, rates
│       ├── subscriptions/          # Subscription management
│       ├── system/                 # Settings & feature flags
│       ├── tax/                    # Tax zones, rates, classes
│       ├── tickets/                # Support tickets
│       └── users/                  # User management
│
├── test/                            # Test suites
│   ├── app.e2e-spec.ts
│   ├── jest-e2e.json
│   ├── jest.config.js
│   ├── integration/                 # Integration tests
│   └── utils/                       # Test utilities
│
├── docs/                            # Documentation
├── scripts/                         # Utility scripts
└── test_scripts/                    # PowerShell test scripts
```

### Module Pattern

Each feature module follows this consistent pattern:

```
module-name/
├── module-name.module.ts        # Module definition
├── module-name.controller.ts    # HTTP controllers
├── module-name.service.ts       # Business logic
├── dto/                         # Data Transfer Objects
│   ├── create-*.dto.ts
│   └── update-*.dto.ts
├── entities/                    # TypeORM entities
│   └── *.entity.ts
└── enums/                       # Module-specific enums (optional)
    └── *.enum.ts
```

---

## License

This project is **UNLICENSED** — proprietary software.

---

<p align="center">
  Built with ❤️ using <a href="https://nestjs.com/">NestJS</a>
</p>
