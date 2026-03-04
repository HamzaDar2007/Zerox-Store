export interface Cart {
  id: string;
  userId: string | null;
  sessionId: string | null;
  currencyCode: string;
  voucherId: string | null;
  discountAmount: number;
  lastActivityAt: string | null;
  items?: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  priceAtAddition: number;
  product?: import('./product.types').Product;
  variant?: import('./product.types').ProductVariant;
  createdAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  productId: string;
  product?: import('./product.types').Product;
  notifyOnSale: boolean;
  notifyOnRestock: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── DTOs ───────────────────────────────────────────────────────────
export interface AddToCartDto {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface ApplyVoucherDto {
  voucherCode: string;
}

export interface AddToWishlistDto {
  productId: string;
  notifyOnSale?: boolean;
  notifyOnRestock?: boolean;
}
