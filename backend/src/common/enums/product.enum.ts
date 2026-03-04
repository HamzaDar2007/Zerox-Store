export enum ProductStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  ACTIVE = 'active',
  PUBLISHED = 'published',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
  REJECTED = 'rejected',
}

export enum AttributeType {
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  COLOR = 'color',
  DATE = 'date',
}

export enum WarrantyType {
  BRAND = 'brand',
  SELLER = 'seller',
  MARKETPLACE = 'marketplace',
  NONE = 'none',
}
