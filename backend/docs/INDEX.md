# LabVerse API — Documentation Index

> **Project Status: Under Active Development — Not Production Ready**
>
> A comprehensive audit identified **140+ issues** including 22 runtime crash bugs and 15 security vulnerabilities. See [KNOWN-ISSUES.md](KNOWN-ISSUES.md) for the prioritized tracker.

---

## Quick Links

| Document | Description |
|----------|-------------|
| [../README.md](../README.md) | Main project README — architecture, setup, full API endpoint reference |
| [../CONTRIBUTING.md](../CONTRIBUTING.md) | Developer onboarding, conventions, PR requirements |
| [../SECURITY.md](../SECURITY.md) | Security policy, known vulnerabilities, reporting process |
| [../CHANGELOG.md](../CHANGELOG.md) | Version history and change log |
| [../.env.example](../.env.example) | All 27 environment variables with descriptions |
| [../FRONTEND_README.md](../FRONTEND_README.md) | Complete frontend development guide (React + Vite + TailwindCSS) |

---

## Project Health & Status

| Document | Description |
|----------|-------------|
| **[KNOWN-ISSUES.md](KNOWN-ISSUES.md)** | **Start here** — Prioritized issue tracker with checkboxes (P0-P3) |
| [FULL-PROJECT-AUDIT.md](FULL-PROJECT-AUDIT.md) | Source of truth — full audit of all 32 modules, 200+ endpoints, 112 entities |

---

## Completed Work Reports

These documents record fixes and verification work already completed:

| Document | Date | Scope |
|----------|------|-------|
| [AUTH-MODULES-FIX-REPORT.md](AUTH-MODULES-FIX-REPORT.md) | Feb 2026 | Auth, Users, Roles, Permissions entity-migration alignment fixes |
| [MIGRATION-ALIGNMENT-SUMMARY.md](MIGRATION-ALIGNMENT-SUMMARY.md) | Feb 2026 | 7 core entities aligned with migration SQL (80/80 fields) |
| [MODULE-VERIFICATION-REPORT.md](MODULE-VERIFICATION-REPORT.md) | Feb 2026 | Field-by-field verification of auth entities against DB |
| [AUTH-MODULE-TEST-HISTORY.md](AUTH-MODULE-TEST-HISTORY.md) | Feb 2026 | Consolidated test results and fix history for auth modules |
| [SWAGGER-DOCUMENTATION-COMPLETE.md](SWAGGER-DOCUMENTATION-COMPLETE.md) | Feb 2026 | @ApiProperty decorators added to auth DTOs |

---

## Deployment

| Document | Description |
|----------|-------------|
| [PRODUCTION-DEPLOYMENT-GUIDE.md](PRODUCTION-DEPLOYMENT-GUIDE.md) | Deployment steps, Docker, Nginx, PM2, monitoring (⚠️ requires fixes first) |

---

## Document History

| Date | Change |
|------|--------|
| March 1, 2026 | Created INDEX.md, KNOWN-ISSUES.md, CONTRIBUTING.md, SECURITY.md, CHANGELOG.md. Removed 3 misleading docs, 2 obsolete files, consolidated 6 test reports. Updated README.md, FRONTEND_README.md, .env.example, deployment guide, and Swagger doc. |
| February 24, 2026 | Full project audit completed. 140+ issues identified. |
| February 23-24, 2026 | Auth module alignment, entity fixes, schema verification. |
