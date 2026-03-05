import type { ProductStatus, WarrantyType } from './enums';
import type { Category } from './catalog.types';
import type { Brand } from './catalog.types';

export interface Product {
  id: string;
  sellerId: string;
  categoryId: string;
  category?: Category;
  brandId: string | null;
  brand?: Brand | null;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  currencyCode: string;
  stock: number;
  lowStockThreshold: number;
  sku: string | null;
  barcode: string | null;
  weight: number | null;
  weightUnit: string;
  length: number | null;
  width: number | null;
  height: number | null;
  dimensionUnit: string;
  warrantyType: WarrantyType | null;
  warrantyDurationMonths: number | null;
  tags: string[] | null;
  status: ProductStatus;
  isFeatured: boolean;
  isDigital: boolean;
  requiresShipping: boolean;
  isTaxable: boolean;
  avgRating: number;
  totalReviews: number;
  totalSales: number;
  viewCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  variants?: ProductVariant[];
  images?: ProductImage[];
  attributes?: ProductAttribute[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string | null;
  sku: string | null;
  barcode: string | null;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  stock: number;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  options: Record<string, string> | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  variantId: string | null;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface ProductAttribute {
  id: string;
  productId: string;
  attributeId: string;
  attributeOptionId: string | null;
  valueText: string | null;
  valueNumeric: number | null;
  createdAt: string;
}

export interface ProductQuestion {
  id: string;
  productId: string;
  userId: string;
  questionText: string;
  isApproved: boolean;
  isFeatured: boolean;
  answerCount: number;
  answers?: ProductAnswer[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductAnswer {
  id: string;
  questionId: string;
  userId: string | null;
  sellerId: string | null;
  answerText: string;
  isSellerAnswer: boolean;
  isApproved: boolean;
  upvoteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PriceHistory {
  id: string;
  productId: string;
  variantId: string | null;
  oldPrice: number;
  newPrice: number;
  changedBy: string | null;
  changeReason: string | null;
  createdAt: string;
}

// ─── DTOs ───────────────────────────────────────────────────────────
export interface CreateProductDto {
  sellerId: string;
  categoryId: string;
  brandId?: string;
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  currencyCode?: string;
  stock?: number;
  lowStockThreshold?: number;
  sku?: string;
  barcode?: string;
  weight?: number;
  weightUnit?: string;
  length?: number;
  width?: number;
  height?: number;
  dimensionUnit?: string;
  warrantyType?: WarrantyType;
  warrantyDurationMonths?: number;
  tags?: string[];
  status?: ProductStatus;
  isFeatured?: boolean;
  isDigital?: boolean;
  requiresShipping?: boolean;
  isTaxable?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  variants?: CreateProductVariantDto[];
  images?: CreateProductImageDto[];
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface CreateProductVariantDto {
  name?: string;
  sku?: string;
  barcode?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stock?: number;
  weight?: number;
  options?: Record<string, string>;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface CreateProductImageDto {
  url: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
  variantId?: string;
}
