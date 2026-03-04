# Security Policy

## Current Security Measures

The LabVerse API implements the following security layers:

| Layer | Implementation | Status |
|-------|---------------|--------|
| **HTTP Headers** | Helmet middleware with CSP | ✅ Active |
| **Rate Limiting** | express-rate-limit (300 req/min) + NestJS ThrottlerGuard (100 req/min) | ✅ Active |
| **Authentication** | JWT via Passport.js (15m access tokens, 7d refresh tokens) | ✅ Active |
| **Password Hashing** | bcryptjs (10 rounds) | ✅ Active |
| **CORS** | Origin whitelist from `FRONTEND_URLS` env var | ✅ Active |
| **Input Validation** | class-validator via GlobalValidationPipe | ⚠️ Partial — 18 modules bypass validation |
| **RBAC** | Role-based + permission-based guards | ⚠️ Partial — missing ownership checks |
| **Swagger Auth** | Bearer token with `persistAuthorization` | ✅ Active |

---

## Known Security Vulnerabilities

> **⚠️ IMPORTANT:** The following vulnerabilities were identified in the [project audit](docs/FULL-PROJECT-AUDIT.md) (Feb 24, 2026) and are tracked in [docs/KNOWN-ISSUES.md](docs/KNOWN-ISSUES.md).

### Critical Severity

1. **Password hash leaks** — Hashed passwords are returned in login, register, and getCurrentUser API responses due to improper object destructuring in `auth.service.ts`
2. **Password reset token exposed** — The `forgotPassword` endpoint returns the reset token in the JSON response (should be emailed instead), enabling account takeover
3. **Mass-assignment on 60+ endpoints** — 18 modules use `@Body() dto: any`, passing unvalidated JSON directly to `Object.assign(entity, dto)`, exposing the database to arbitrary field injection

### High Severity

4. **Privilege escalation** — Any user with `users.update` permission can set any user's role to `super_admin`
5. **No ownership verification** — Users can modify other users' carts, subscriptions, notifications, and tickets
6. **Role-permissions controller unprotected** — No authorization guards on role-permission modification endpoints

---

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public issue
2. Email the development team with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
3. Allow reasonable time for a fix before public disclosure

### Contact

- **Email:** [TBD — configure a security contact email]
- **Response Time:** We aim to acknowledge reports within 48 hours

---

## Security Roadmap

The following improvements are planned to address known vulnerabilities:

### Immediate (P0)
- [ ] Fix password/token leak bugs in auth.service.ts
- [ ] Wire typed DTOs to all 18 modules using `dto: any`
- [ ] Add ownership checks on user-specific resources
- [ ] Protect UpdateUserDto against role/password escalation

### Short-term
- [ ] Add environment variable validation (Joi/Zod schema)
- [ ] Implement account lockout on failed login attempts
- [ ] Check `isActive` and `lockedUntil` during login
- [ ] Implement email-based password reset flow (via MailModule)
- [ ] Remove conflicting exception filter registration

### Medium-term
- [ ] Implement 2FA (entity columns already exist)
- [ ] Add request signing/HMAC for sensitive operations
- [ ] Set up automated dependency vulnerability scanning
- [ ] Add security-focused integration tests
- [ ] Implement audit logging for security events

---

*Last updated: March 1, 2026*
