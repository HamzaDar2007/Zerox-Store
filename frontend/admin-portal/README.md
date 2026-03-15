# Admin Portal

Production-ready admin dashboard for the E-Commerce backend.

## Tech Stack

- **React 19** + **TypeScript** (strict mode)
- **Vite 8** for blazing fast builds
- **Tailwind CSS v4** with custom theme
- **Radix UI** primitives (shadcn-style components)
- **TanStack Query** for server state management
- **TanStack Table** for data tables with sorting, filtering, pagination
- **Zustand** for client state (auth, theme)
- **React Hook Form** + **Zod** for form validation
- **Axios** with interceptors for API calls
- **Recharts** for dashboard charts
- **Sonner** for toast notifications
- **Lucide React** for icons
- **React Router v7** with lazy loading

## Features

- **Authentication**: JWT login with auto token refresh, protected routes
- **Dashboard**: Real-time KPIs, charts (bar, line, pie), recent orders
- **22 Modules**: Full CRUD for Users, Roles, Permissions, Categories, Brands, Sellers, Stores, Products, Orders, Payments, Coupons, Flash Sales, Inventory, Shipping, Subscriptions, Returns, Reviews, Notifications, Chat, Audit Logs, Settings
- **Data Tables**: Pagination, sorting, filtering, search, actions
- **Dark/Light Mode**: Toggle theme with persistent preference
- **Responsive Design**: Mobile, tablet, desktop
- **Collapsible Sidebar**: With tooltips when collapsed
- **Error Boundary**: Global error catching
- **Code Splitting**: Every page is lazy loaded

## Getting Started

### Prerequisites

- Node.js 18+
- Backend running on `http://localhost:3001`

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:3001` |
| `VITE_APP_NAME` | Application name | `Admin Portal` |

## Project Structure

```
src/
├── components/
│   ├── layout/          # AppLayout, Sidebar, Header
│   ├── shared/          # DataTable, ConfirmDialog, PageHeader, etc.
│   └── ui/              # Button, Card, Input, Dialog, Badge, etc.
├── config/
│   └── api.ts           # Axios instance with interceptors
├── lib/
│   └── utils.ts         # Utility functions (cn, formatCurrency, etc.)
├── pages/               # All page components (lazy loaded)
├── services/
│   └── api.ts           # All API service calls organized by module
├── store/
│   ├── auth.store.ts    # Authentication state (Zustand + persist)
│   └── theme.store.ts   # Theme/sidebar state (Zustand + persist)
├── types/
│   └── index.ts         # TypeScript interfaces for all entities
├── App.tsx              # Root component with routing
├── main.tsx             # Entry point
└── index.css            # Tailwind + theme variables
```
