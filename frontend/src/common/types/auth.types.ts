import type { UserRole, Gender } from './enums';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  isActive: boolean;
  profileImage: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  referralCode: string | null;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  loginAttempts: number;
  lockedUntil: string | null;
  twoFactorEnabled: boolean;
  preferredLanguageId: string | null;
  preferredCurrencyId: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string | null;
  fullName: string;
  phone: string;
  country: string;
  province: string;
  city: string;
  area: string | null;
  streetAddress: string;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  deliveryInstructions: string | null;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  displayName: string | null;
  description: string | null;
  isSystem: boolean;
  permissions?: Permission[];
  createdAt: string;
}

export interface Permission {
  id: string;
  roleId: string;
  module: string;
  action: string;
  createdAt: string;
}

// ─── Auth DTOs ──────────────────────────────────────────────────────
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
  profileImage?: string;
  dateOfBirth?: string;
  gender?: Gender;
  preferredLanguageId?: string;
  preferredCurrencyId?: string;
}

export interface CreateAddressDto {
  label?: string;
  fullName: string;
  phone: string;
  country?: string;
  province: string;
  city: string;
  area?: string;
  streetAddress: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  deliveryInstructions?: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

export type UpdateAddressDto = Partial<CreateAddressDto>;
