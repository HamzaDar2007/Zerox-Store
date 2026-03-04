# Entity & DTO Migration Alignment Summary

## ✅ Completed Updates

### Entities Updated

1. **User Entity** ([user.entity.ts](src/modules/users/entities/user.entity.ts))
   - ✅ Changed `fullName` → `name` (varchar 100)
   - ✅ Changed `roleId` FK → `role` enum (UserRole)
   - ✅ Added all missing columns:
     - phone, is_email_verified, email_verified_at, phone_verified_at
     - is_active, profile_image, date_of_birth, gender
     - referral_code, last_login_at, last_login_ip, login_attempts
     - locked_until, two_factor_enabled, two_factor_secret
     - two_factor_backup_codes, preferred_language_id, preferred_currency_id
     - deleted_at (soft delete)
   - ✅ Removed permission relations (deprecated in new schema)

2. **Role Entity** ([role.entity.ts](src/modules/roles/entities/role.entity.ts))
   - ✅ Added `displayName` field (varchar 100)
   - ✅ Added `isSystem` field (boolean)
   - ✅ Removed user relation (users.role is now enum)
   - ✅ Updated permissions relation (OneToMany)

3. **Permission Entity** ([permission.entity.ts](src/modules/permissions/entities/permission.entity.ts))  
   - ✅ **Complete restructure** to match migration:
     - `roleId` (FK to roles) instead of standalone permissions
     - `module` instead of `resource`
     - `action` kept the same
     - Removed: `name`, `description`
   - ✅ Permissions now belong to roles directly

4. **Session Entity** ([refresh-token.entity.ts](src/modules/auth/entities/refresh-token.entity.ts))
   - ✅ Renamed from RefreshToken to Session
   - ✅ Maps to `sessions` table (not `refresh_tokens`)
   - ✅ Added: ip_address, user_agent, device_fingerprint, is_valid, last_activity_at
   - ✅ New field: `refreshToken` (was `token`)
   - ✅ Backward compatibility export: `export { Session as RefreshToken }`

### New Entities Created

5. **UserRole Entity** ([user-role.entity.ts](src/modules/users/entities/user-role.entity.ts))
   - ✅ NEW: Junction table for additional role assignments
   - Fields: user_id, role_id, assigned_by, assigned_at

6. **Address Entity** ([address.entity.ts](src/modules/users/entities/address.entity.ts))
   - ✅ NEW: User address management
   - Fields: 18 total including location, delivery preferences, defaults

7. **LoginHistory Entity** ([login-history.entity.ts](src/modules/users/entities/login-history.entity.ts))
   - ✅ NEW: Audit trail for user logins
   - Fields: login_at, ip_address, user_agent, status, location, etc.

### DTOs Updated

8. **CreateUserDto** ([create-user.dto.ts](src/modules/users/dto/create-user.dto.ts))
   - ✅ Changed `fullName` → `name`
   - ✅ Changed `roleId` → `role` enum
   - ✅ Added optional fields: phone, dateOfBirth, gender

9. **RegisterDto** ([register.dto.ts](src/modules/auth/dto/register.dto.ts))
   - ✅ Changed `fullName` → `name`
   - ✅ Removed `roleId`
   - ✅ Added optional `phone`

10. **CreateRoleDto** ([create-role.dto.ts](src/modules/roles/dto/create-role.dto.ts))
    - ✅ Added `displayName` field
    - ✅ Added `isSystem` field

11. **CreatePermissionDto** ([create-permission.dto.ts](src/modules/permissions/dto/create-permission.dto.ts))
    - ✅ **Complete restructure**:
      - Added `roleId` (required)
      - Changed `resource` → `module`
      - Kept `action`
      - Removed: `name`, `description`

### New DTOs Created

12. **CreateAddressDto** ([create-address.dto.ts](src/modules/users/dto/create-address.dto.ts))
    - ✅ NEW: For address creation with validation

13. **UpdateAddressDto** ([update-address.dto.ts](src/modules/users/dto/update-address.dto.ts))
    - ✅ NEW: Partial type of CreateAddressDto

14. **AssignUserRoleDto** ([assign-user-role.dto.ts](src/modules/users/dto/assign-user-role.dto.ts))
    - ✅ NEW: For user_roles junction table operations

15. **CreateSessionDto** ([create-session.dto.ts](src/modules/auth/dto/create-session.dto.ts))
    - ✅ NEW: For session/refresh token management

### Configuration

16. **tsconfig.json**
    - ✅ Added path mapping: `"@common/*": ["src/common/*"]`
    - Enables enum imports: `import { UserRole } from '@common/enums'`

### Seed Files

17. **seed.ts** & **permissions-seed.ts**
    - ✅ Updated to use `name` instead of `fullName`
    - ✅ Updated to use enum `role` instead of `roleId`
    - ✅ Updated permission seeding for new schema (roleId + module + action)

---

## ⚠️ Known Issues  Require Service Refactoring

The following service methods need to be rewritten to work with the new permission model.  These are **TODOs** for future work:

### AuthService ([auth.service.ts](src/modules/auth/auth.service.ts))
- ❌ Line 160: Still references `isRevoked` (should be `isValid`)
   ```typescript
// Fix: Change isRevoked to isValid:
   await this.refreshTokenRepository.update(
     { refreshToken },
     { isValid: false }, // was: isRevoked: true
   );
   ```

### UsersService ([users.service.ts](src/modules/users/users.service.ts))
- ❌ Lines 208, 215, 374, 392, 504, 509: References to `user.role.permissions` and `user.role.id`
  - **Issue**: `user.role` is now a string enum (UserRole), not an object
  - **Fix**: Query permissions separately via `permissionRepository.find({ roleId: roleRecord.id })`

- ❌ Line 458: `user.permissions` doesn't exist
  - **Issue**: User entity no longer has permissions relation
  - **Fix**: Use user_roles junction table or role-based permissions

- ❌ Line 529: `permission.resource` doesn't exist
  - **Issue**: Permission entity now uses `module` instead of `resource`
  - **Fix**: Change all `resource` references to `module`

- ❌ Line 603: `dto.roleId` doesn't exist in UpdateUserDto
  - **Issue**: Should use `dto.role` enum
  - **Fix**: Update all `roleId` references to `role`

### Methods That Need Rewriting

These methods are currently **stub implementations** throwing errors:

1. **`assignPermissions()`** - Needs complete rewrite
   - Old: Assigned permissions directly to users
   - New: Use user_roles table for additional role assignments
   
2. **`addUserPermissions()`** - Deprecated
   - Permissions now belong to roles, not users
   
3. **`removeUserPermissions()`** - Deprecated
   
4. **`replaceUserPermissions()`** - Deprecated
   
5. **`findOneWithPermissions()`** - Needs update
   - Should query permissions via role relationship

6. **`getAllPermissionsForUser()`** - Needs update
   - Should aggregate permissions from:
     * User's primary role (users.role enum)
     * Additional roles via user_roles table

---

## 📋 Migration Schema Summary

### New Permission Model
- **Old**: Permission → User (direct assignment via user_permissions)
- **New**: Permission → Role → User (permissions belong to roles)

### Tables in Migration
1. **users** - Has `role` enum column (not FK)
2. **roles** - System roles
3. **permissions** - Belongs to roles (has role_id)
4. **user_roles** - Junction for additional role assignments
5. **sessions** - Refresh token management (replaces refresh_tokens)
6. **addresses** - User addresses
7. **login_history** - Login audit trail

### Key Changes from Old Schema
- ✅ Users have primary `role` as enum ('customer', 'seller', 'admin', 'super_admin')
- ✅ Additional roles assigned via `user_roles` junction table
- ✅ Permissions assigned to roles (not users directly)
- ✅ Session management replaces simple refresh tokens
- ✅ Added address and login history tracking
- ✅ Enums are now TypeScript enums (not database enums)

---

## 🚀 Next Steps

### Immediate (Critical)
1. Fix remaining 14 TypeScript errors in UsersService
   - Update `user.role` references (it's now a string, not object)
   - Remove `user.permissions` references
   - Change `resource` → `module` in permission queries
   - Update `roleId` → `role` in DTOs

2. Rewrite permission-related service methods:
   - `assignPermissions()` → Use user_roles table
   - `getAllPermissionsForUser()` → Aggregate from roles
   - `findOneWithPermissions()` → Query via role relationship

### Future Enhancements
1. Implement user_roles management service
2. Add role-based authorization guards using new schema
3. Update permission decorators to work with module/action model
4. Create address management endpoints
5. Implement login history tracking
6. Add session management endpoints

---

## 🎯 Testing Checklist

Once services are fixed:

- [ ] Run migrations: `npm run migration:run`
- [ ] Run seeds: `npm run seed`
- [ ] Test user registration with role enum
- [ ] Test user login and session creation
- [ ] Test role CRUD operations
- [ ] Test permission CRUD operations (with roleId)
- [ ] Test address CRUD operations
- [ ] Verify login history is logged
- [ ] Test authorization with new permission model

---

## 📝 Notes

- All 35 migrations are already executed in the database
- Database schema matches migration files
- TypeScript enum files exist in `src/common/enums/`
- Path alias `@common/*` configured in tsconfig.json
- Backward compatibility maintained where possible (e.g., RefreshToken export)

---

*Generated after entity/DTO migration alignment (February 23, 2026)*
