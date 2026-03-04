import type { AttributeType } from './enums';

export interface Category {
  id: string;
  parentId: string | null;
  parent?: Category | null;
  children?: Category[];
  name: string;
  slug: string;
  imageUrl: string | null;
  iconUrl: string | null;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  commissionRate: number | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  depth: number;
  path: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  websiteUrl: string | null;
  countryOfOrigin: string | null;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttributeGroup {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  attributes?: Attribute[];
  createdAt: string;
}

export interface Attribute {
  id: string;
  attributeGroupId: string | null;
  name: string;
  slug: string;
  type: AttributeType;
  unit: string | null;
  isFilterable: boolean;
  isRequired: boolean;
  isVariantAttribute: boolean;
  options?: AttributeOption[];
  createdAt: string;
}

export interface AttributeOption {
  id: string;
  attributeId: string;
  value: string;
  colorHex: string | null;
  imageUrl: string | null;
  sortOrder: number;
  createdAt: string;
}

// ─── DTOs ───────────────────────────────────────────────────────────
export interface CreateCategoryDto {
  parentId?: string;
  name: string;
  slug?: string;
  imageUrl?: string;
  iconUrl?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  commissionRate?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;

export interface CreateBrandDto {
  name: string;
  slug?: string;
  logoUrl?: string;
  description?: string;
  websiteUrl?: string;
  countryOfOrigin?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export type UpdateBrandDto = Partial<CreateBrandDto>;

export interface CreateAttributeDto {
  name: string;
  displayName?: string;
  type: AttributeType;
  isRequired?: boolean;
  isFilterable?: boolean;
  isSearchable?: boolean;
  sortOrder?: number;
  options?: string[];
}

export type UpdateAttributeDto = Partial<CreateAttributeDto>;
