# LabVerse E-Commerce Platform

A full-stack e-commerce platform built with NestJS (backend) and React (frontend). This monorepo contains both the API server and the web application for a comprehensive multi-vendor marketplace solution.

## 🏗️ Project Structure

```
projects/
├── backend/          # NestJS API server
│   ├── src/         # Source code (30+ feature modules)
│   ├── migrations/  # TypeORM database migrations
│   ├── seeds/       # Database seeding scripts
│   ├── test/        # E2E and integration tests
│   └── docs/        # Backend documentation
├── frontend/         # React + Vite web application
│   ├── src/         # Source code (components, features, routes)
│   ├── public/      # Static assets
│   └── docs/        # Frontend documentation
└── README.md        # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or higher
- **PostgreSQL** 15+ database server
- **npm** (comes with Node.js)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migration:run
npm run seed:all
npm run start:dev
```

Backend runs at: `http://localhost:3000`  
API Documentation (Swagger): `http://localhost:3000/api`

For detailed backend instructions, see [backend/README.md](backend/README.md)

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with backend API URL
npm run dev
```

Frontend runs at: `http://localhost:5173`

For detailed frontend instructions, see [backend/FRONTEND_README.md](backend/FRONTEND_README.md)

## 🛠️ Tech Stack

### Backend
- **Framework:** NestJS 10.2.10
- **Language:** TypeScript 5.3.3
- **Database:** PostgreSQL with TypeORM 0.3.19
- **Authentication:** Passport JWT, bcrypt
- **API Documentation:** Swagger/OpenAPI
- **File Upload:** Multer
- **Validation:** class-validator, class-transformer

### Frontend
- **Framework:** React 18.3
- **Build Tool:** Vite 5.4
- **Language:** TypeScript 5.5.4
- **State Management:** Redux Toolkit
- **Routing:** React Router 7
- **Styling:** TailwindCSS + shadcn/ui
- **Testing:** Vitest
- **HTTP Client:** Axios

## 📦 Key Features

### Backend (NestJS)
- 🔐 Role-based access control (RBAC) with permissions
- 👤 Multi-user authentication (Super Admin, Admin, Seller, Customer)
- 🏪 Multi-vendor store management
- 📦 Product catalog with categories, brands, and variants
- 🛒 Shopping cart and order management
- 💳 Payment processing integration
- 📊 Audit logging for all critical operations
- 🔍 Full-text search with PostgreSQL
- 📄 Comprehensive API documentation

### Frontend (React)
- 🎨 Responsive design with dark/light theme support
- 🚪 Multiple portals (Customer, Seller, Admin, Super Admin)
- 🛍️ Product browsing and search
- 🛒 Cart and checkout flow
- 👨‍💼 Seller dashboard for store management
- 🔧 Admin panel for platform management
- 🔐 JWT-based authentication
- ♿ Accessible UI components (shadcn/ui)

## 🧪 Development

### Running Tests

**Backend:**
```bash
cd backend
npm run test              # Unit tests
npm run test:e2e          # End-to-end tests
npm run test:cov          # Coverage report
```

**Frontend:**
```bash
cd frontend
npm run test              # Vitest tests
npm run test:ui           # Vitest UI
```

### Database Migrations

```bash
cd backend
npm run migration:generate -- src/migrations/MigrationName
npm run migration:run
npm run migration:revert
```

### Code Quality

Both projects use:
- ESLint for linting
- Prettier for code formatting
- TypeScript for type safety

```bash
npm run lint              # Check for linting errors
npm run format            # Format code with Prettier
```

## 📖 Documentation

- **Backend API:** [backend/README.md](backend/README.md)
- **Frontend Guide:** [backend/FRONTEND_README.md](backend/FRONTEND_README.md)
- **API Contracts:** [frontend/docs/02-API-CONTRACTS.md](frontend/docs/02-API-CONTRACTS.md)
- **Admin Portal:** [frontend/docs/07-PORTAL-ADMIN.md](frontend/docs/07-PORTAL-ADMIN.md)
- **Super Admin Portal:** [frontend/docs/08-PORTAL-SUPERADMIN.md](frontend/docs/08-PORTAL-SUPERADMIN.md)
- **Backend Audit Reports:** [backend/docs/](backend/docs/)

## 🤝 Contributing

Please read [backend/CONTRIBUTING.md](backend/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 🔒 Security

For security concerns, please review [backend/SECURITY.md](backend/SECURITY.md).

## 📝 License

This project is proprietary software. All rights reserved.

## 🐛 Known Issues

See [backend/docs/KNOWN-ISSUES.md](backend/docs/KNOWN-ISSUES.md) for a list of known issues and their workarounds.

## 📧 Support

For support and questions, please refer to the documentation or contact the development team.

---

**Last Updated:** March 2026
