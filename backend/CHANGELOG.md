# Changelog

All notable changes to the LabVerse API are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Added
- `frontend/admin-portal/src/lib/form.ts` — Centralized `formResolver()` wrapper for Zod v4 / React Hook Form type compatibility
- `frontend/seller-portal/API_MAP.md` — Regenerated from actual `services/api.ts` source code

### Changed
- **Scheduler N+1 fix** — `findDueForRenewal()` now eagerly loads `user` and `plan` relations, eliminating per-subscription re-fetches during renewal processing (reduced from N+2 queries to 1)
- **Migration timestamp fix** — Renamed `AddSellerReplyToReviews` from timestamp `1700000000014` to `1700000000022` to resolve duplicate with `CreateEcommerceIndexes`
- **Environment validation alignment** — `env.validation.ts` now validates `SMTP_HOST`/`SMTP_PORT` (was `MAIL_HOST`), added `NOTIFICATION_ENABLED`, `ADMIN_EMAIL`, `FRONTEND_URL`
- **`.env.example`** — Added `STRIPE_CURRENCY`, `STRIPE_PRICE_*`, `ENCRYPTION_KEY`, `TRUST_PROXY`, `DB_SSL` vars; removed stale `RATE_LIMIT`
- **`CONTRIBUTING.md`** — Fixed seed file count from 3 to 5
- **Backend README** — Updated project status notice
- **Customer-portal `API_MAP.md`** — Removed 3 documented-only endpoints not in actual api.ts (`DELETE /users/:id`, `POST /payments`, `PUT /reviews/:id`)
- **Admin portal** — Replaced 28 `zodResolver(schema) as any` casts with centralized `formResolver(schema)` across 18 page files
- **Seller portal** — Replaced all non-null assertions (`!`) with optional chaining (`?.`) across 14 files
- **Customer portal** — Fixed `Header.tsx` `useRef` missing initial value; fixed `vite.config.ts` to import from `vitest/config`
- **ESLint configs (all portals)** — Added overrides for UI components and test files; zero errors, zero warnings
- **Backend ESLint** — Fixed 1181 Prettier formatting issues; fixed unused `passwordHash` variable in `sellers.service.ts`

### Removed
- **14 stale files deleted:**
  - `document.md.bak`, `srs.md`, `FRONTEND_README.md`, `details.txt`, `database.md` (backend root)
  - `adminportal.md` (frontend root)
  - `test_output.txt`, `test-output.txt`, `test-results.json` (admin-portal)
  - `quick-start.ps1`, `test-simple.ps1`, `test-routes.ps1`, `test-api.ps1`, `check-swagger.ps1` (test_scripts)
- **Unused dependencies removed:**
  - Backend: `typeorm-ts-node-esm`, `source-map-support`, `ts-loader`
  - Customer portal: `jspdf`, `jspdf-autotable`
  - Seller portal: `@types/testing-library__jest-dom`
- Commented-out `RolesGuard`/`PermissionsGuard` global providers in `app.module.ts`

---

## [Previous Unreleased]

### Added
- `CONTRIBUTING.md` — Developer onboarding and contribution guide
- `SECURITY.md` — Security policy, known vulnerabilities, and reporting process
- `CHANGELOG.md` — This file
- `docs/KNOWN-ISSUES.md` — Prioritized issue tracker (140+ items from audit)
- `docs/INDEX.md` — Documentation index replacing deleted `docs/README.md`
- `.gitignore` entries for `server.log` and `test-results*.json`
- Complete `.env.example` with all 27 environment variables, grouped by section

### Changed
- `README.md` — Added project status banner (not production-ready), fixed module count (34, not 33), corrected all 35 migration descriptions to match actual filenames, updated Guards section to clarify per-controller vs global scope, updated Testing section to reflect actual minimal coverage, updated Real-Time and File Storage sections to note partial implementation, added MailModule to core modules, added seed script warnings
- `FRONTEND_README.md` — Fixed backend port from `3000` to `3001` in 5 locations
- `.env.example` — Expanded from 11 vars to 27 vars with Rate Limiting, Supabase, SMTP/Mail, and Throttler sections
- `docs/PRODUCTION-DEPLOYMENT-GUIDE.md` — Fixed status from "READY" to "NOT READY", corrected env var names (`DB_USERNAME`/`DB_DATABASE` not `DB_USER`/`DB_NAME`), removed non-existent vars (`SENTRY_DSN`, `LOG_LEVEL`, `JWT_REFRESH_EXPIRES_IN`, `DB_SSL`), fixed seed command
- `docs/SWAGGER-DOCUMENTATION-COMPLETE.md` — Added scope limitation notice (only covers auth DTOs, not all 32 modules), fixed Swagger port from `3000` to `3001`

### Removed
- `read.md` — Outdated proposal document referencing Express.js, Redis, Docker (none used)
- `README` (no extension) — Duplicate of `read.md`
- `server.log` — Runtime artifact that should not be in version control
- `test-results.json`, `test-results-v2.json` — Stale test output artifacts
- `docs/README.md` — Claimed "Production Ready: Yes" and "100% tests passing", directly contradicted by audit
- `docs/PRODUCTION-READINESS-SUMMARY.md` — Claimed "READY FOR PRODUCTION" based on only 5 of 32 modules
- `docs/COMPREHENSIVE-ENDPOINT-TEST-REPORT.md` — Claimed 148/148 (100%) passing, contradicted by 22 documented crash bugs
- `docs/COMPREHENSIVE-TEST-REPORT.md` — Consolidated into `AUTH-MODULE-TEST-HISTORY.md`
- `docs/ENDPOINT-TEST-REPORT.md` — Consolidated into `AUTH-MODULE-TEST-HISTORY.md`
- `docs/FINAL-TEST-REPORT.md` — Consolidated into `AUTH-MODULE-TEST-HISTORY.md`
- `docs/FINAL-TEST-RESULTS.md` — Consolidated into `AUTH-MODULE-TEST-HISTORY.md`
- `docs/FINAL-VERIFICATION-REPORT.md` — Consolidated into `AUTH-MODULE-TEST-HISTORY.md`
- `docs/TEST-RESULTS.md` — Consolidated into `AUTH-MODULE-TEST-HISTORY.md`
- `scripts/run-all-tests.js` through `scripts/run-all-tests-v4.js` — Superseded by v5

---

## [0.0.1] — February 24, 2026

### Auth Module Alignment
*Based on [docs/AUTH-MODULES-FIX-REPORT.md](docs/AUTH-MODULES-FIX-REPORT.md)*

- Aligned User, Role, Permission, Session, UserRole, Address, LoginHistory entities with migration schema
- Added `displayName` to `UpdateRoleDto`
- Fixed `permission.resource` → `permission.module` in permissions service
- Updated auth-related controllers and services to match DB column names

### Migration Alignment
*Based on [docs/MIGRATION-ALIGNMENT-SUMMARY.md](docs/MIGRATION-ALIGNMENT-SUMMARY.md)*

- Entity-to-migration field alignment across 7 core entities (80/80 fields verified)
- Fixed column names, types, and nullability to match migration SQL

### Swagger Documentation
*Based on [docs/SWAGGER-DOCUMENTATION-COMPLETE.md](docs/SWAGGER-DOCUMENTATION-COMPLETE.md)*

- Added `@ApiProperty` decorators to auth-related DTOs (AuthCredentialsDto, RegisterDto, RefreshTokenDto, PasswordResetDto, ResetPasswordDto, CreateUserDto, AssignUserRoleDto, CreatePermissionDto, CreateRoleDto)

### Endpoint Schema Fixes
*Based on [docs/AUTH-MODULE-TEST-HISTORY.md](docs/AUTH-MODULE-TEST-HISTORY.md)*

- Applied 107+ ALTER TABLE statements across 16 tables for entity-DB alignment
- Fixed permissions guard `user_role_enum = varchar` type mismatch
- Rewrote Chat Conversation entity to match DB schema
- Added marketing controller route prefixes
- Fixed Cart service to auto-fetch product price
- Created custom `@IsUuidString()` decorator — 72 DTOs updated

### Full Project Audit
*Based on [docs/FULL-PROJECT-AUDIT.md](docs/FULL-PROJECT-AUDIT.md)*

- Completed comprehensive audit of all 32 modules
- Identified 140+ issues: 22 crash bugs, 15 security vulnerabilities, 60+ unvalidated endpoints
- Documented all issues with specific file locations and suggested fixes
- Verdict: NOT READY FOR PRODUCTION

---

*Last updated: March 1, 2026*
