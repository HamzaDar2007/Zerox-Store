# Contributing to LabVerse API

Thank you for contributing to the LabVerse E-Commerce Backend. This guide covers setup, conventions, and the development workflow.

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18+ |
| npm | 9+ |
| PostgreSQL | 14+ (16 recommended) |
| Git | 2.x |

---

## Getting Started

```bash
# 1. Clone the repository
git clone <repo-url>
cd backend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your local PostgreSQL credentials and a JWT_SECRET

# 4. Run database migrations
npm run migration:run

# 5. Seed initial data (roles, permissions, super admin)
npm run seed:all

# 6. Start development server
npm run start:dev
```

The API will be available at `http://localhost:3001` and Swagger docs at `http://localhost:3001/api/docs`.

---

## Development Workflow

### Branch Naming

- `feature/<short-name>` — New features
- `fix/<short-name>` — Bug fixes
- `docs/<short-name>` — Documentation only
- `refactor/<short-name>` — Code restructuring

### Making Changes

1. Create a branch from `main`
2. Make your changes
3. Run checks before committing:

```bash
# Lint (auto-fix)
npm run lint

# Build (type-check)
npm run build

# Run tests
npm run test
```

4. Commit with a clear message (e.g., `fix: wire CreateReviewDto to reviews controller`)
5. Push and open a pull request

### PR Requirements

- [ ] `npm run lint:check` passes with zero errors
- [ ] `npm run build` compiles with zero errors
- [ ] No new `@Body() dto: any` patterns (use typed DTOs)
- [ ] New endpoints have `@ApiProperty` decorators on their DTOs
- [ ] Ownership checks on user-specific resources
- [ ] Passwords/tokens never returned in API responses

---

## Project Structure

Each feature module follows this pattern:

```
src/modules/<module-name>/
├── <module-name>.module.ts        # Module definition
├── <module-name>.controller.ts    # HTTP endpoints
├── <module-name>.service.ts       # Business logic
├── dto/                           # Data Transfer Objects
│   ├── create-<name>.dto.ts
│   └── update-<name>.dto.ts
└── entities/                      # TypeORM entities
    └── <name>.entity.ts
```

### Key Directories

| Path | Purpose |
|------|---------|
| `src/common/enums/` | Shared enum definitions (24 files) |
| `src/common/guards/` | `RolesGuard`, `PermissionsGuard` |
| `src/common/decorators/` | `@Roles()`, `@Permissions()`, `@IsUuidString()` |
| `src/common/filters/` | `GlobalExceptionFilter` |
| `src/common/interceptor/` | `ResponseInterceptor` (wraps all responses) |
| `src/common/pipes/` | `GlobalValidationPipe` |
| `src/config/` | Database, security, and data-source configs |
| `seeds/` | Database seed scripts (5 files) |
| `src/migrations/` | Database migrations (35 files — **never edit manually**) |

---

## Code Conventions

### TypeScript

- Use strict typing — avoid `any` (this is a known issue being fixed)
- Use `class-validator` decorators on all DTOs
- Use `@ApiProperty()` on all DTO fields for Swagger documentation

### Database

- **Naming:** `SnakeNamingStrategy` is configured — TypeORM auto-converts `camelCase` properties to `snake_case` columns
- **Migrations:** Never use `synchronize: true`. Generate migrations with `npm run migration:generate`
- **Entities:** Place in `src/modules/<module>/entities/`
- **Enums:** Shared enums go in `src/common/enums/`, module-specific enums in `src/modules/<module>/enums/`

### Security

- Never return password hashes or sensitive tokens in API responses
- Always validate input using typed DTOs with `class-validator`
- Add ownership checks on user-specific resources (cart, orders, notifications, etc.)
- Use `@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)` on protected endpoints

---

## Creating a New Module

```bash
# 1. Generate module scaffolding
npx nest g module modules/<name>
npx nest g controller modules/<name>
npx nest g service modules/<name>

# 2. Create entity
# src/modules/<name>/entities/<name>.entity.ts

# 3. Generate migration
npm run migration:generate -- -n Create<Name>

# 4. Run migration
npm run migration:run

# 5. Create DTOs with validation decorators
# src/modules/<name>/dto/create-<name>.dto.ts
# src/modules/<name>/dto/update-<name>.dto.ts

# 6. Register module in app.module.ts imports array

# 7. Implement service logic and controller endpoints
```

---

## Testing

> **Note:** Test coverage is currently minimal. Contributions adding tests are highly valued.

```bash
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:cov      # Coverage report
```

---

## Known Issues

Before starting work, review [docs/KNOWN-ISSUES.md](docs/KNOWN-ISSUES.md) for the prioritized list of bugs and missing features. High-impact contributions:

1. **Wire existing DTOs** to controllers that currently use `@Body() dto: any`
2. **Fix runtime crash bugs** (wrong relation names, missing NOT NULL fields)
3. **Add ownership checks** on user-specific resources
4. **Add unit/integration tests** for any module

---

## Useful Commands

| Command | Purpose |
|---------|---------|
| `npm run start:dev` | Start with hot-reload |
| `npm run build` | Compile TypeScript |
| `npm run lint` | Lint + auto-fix |
| `npm run lint:check` | Lint check only |
| `npm run migration:run` | Run pending migrations |
| `npm run migration:generate` | Generate migration from entity diff |
| `npm run seed:all` | Seed roles, permissions, and super admin |
| `npm run check:all` | Lint + test + build (CI check) |
