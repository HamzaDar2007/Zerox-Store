import api from '@/config/api'
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  UserAddress,
  Product,
  ProductVariant,
  ProductImage,
  AttributeKey,
  AttributeValue,
  VariantAttributeValue,
  ProductCategory,
  Category,
  Brand,
  Store,
  Cart,
  CartItem,
  Wishlist,
  WishlistItem,
  Order,
  OrderItem,
  CreateOrderPayload,
  Payment,
  Coupon,
  FlashSale,
  FlashSaleItem,
  Review,
  RatingSummary,
  Notification,
  Return,
  ReturnItem,
  CreateReturnPayload,
  ShippingMethod,
  Shipment,
  ShipmentEvent,
  ChatThread,
  ChatMessage,
  ChatThreadParticipant,
  SearchProductsResponse,
  SearchQuery,
  PaginatedResponse,
} from '@/types'

function toPaginated<T>(data: unknown, params?: { page?: number; limit?: number }): PaginatedResponse<T> {
  if (Array.isArray(data)) {
    return { data, total: data.length, page: params?.page ?? 1, limit: params?.limit ?? data.length, totalPages: 1 }
  }
  const obj = data as Record<string, unknown>
  if (obj && Array.isArray(obj.data)) {
    return {
      data: obj.data as T[],
      total: (obj.total as number) ?? obj.data.length,
      page: (obj.page as number) ?? params?.page ?? 1,
      limit: (obj.limit as number) ?? params?.limit ?? obj.data.length,
      totalPages: (obj.totalPages as number) ?? 1,
    }
  }
  return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 }
}

function toArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data
  const obj = data as Record<string, unknown>
  if (obj && Array.isArray(obj.data)) return obj.data as T[]
  return []
}

// ─── Auth ──────────────────────
export const authApi = {
  login: (data: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),
  register: (data: RegisterData) =>
    api.post('/auth/register', data).then((r) => r.data),
  refresh: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refreshToken }).then((r) => r.data),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
  verifyEmail: (token: string) =>
    api.post('/auth/verify-email', { token }),
}

// ─── Users / Profile ───────────
export const usersApi = {
  get: (id: string) => api.get<User>(`/users/${id}`).then((r) => r.data),
  update: (id: string, data: Partial<User>) =>
    api.put<User>(`/users/${id}`, data).then((r) => r.data),
  uploadAvatar: (id: string, formData: FormData) =>
    api.patch(`/users/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
}

// ─── Addresses ─────────────────
export const addressesApi = {
  list: (userId: string) =>
    api.get<UserAddress[]>(`/users/${userId}/addresses`).then((r) => toArray<UserAddress>(r.data)),
  create: (userId: string, data: Partial<UserAddress>) =>
    api.post<UserAddress>(`/users/${userId}/addresses`, data).then((r) => r.data),
  update: (addressId: string, data: Partial<UserAddress>) =>
    api.put<UserAddress>(`/users/addresses/${addressId}`, data).then((r) => r.data),
  delete: (addressId: string) => api.delete(`/users/addresses/${addressId}`),
}

// ─── Categories ────────────────
export const categoriesApi = {
  list: () => api.get<Category[]>('/categories').then((r) => toArray<Category>(r.data)),
  get: (id: string) => api.get<Category>(`/categories/${id}`).then((r) => r.data),
}

// ─── Brands ────────────────────
export const brandsApi = {
  list: () => api.get<Brand[]>('/brands').then((r) => toArray<Brand>(r.data)),
  get: (id: string) => api.get<Brand>(`/brands/${id}`).then((r) => r.data),
}

// ─── Stores ────────────────────
export const storesApi = {
  list: () => api.get<Store[]>('/stores').then((r) => toArray<Store>(r.data)),
  get: (id: string) => api.get<Store>(`/stores/${id}`).then((r) => r.data),
  getBySlug: (slug: string) => api.get<Store>(`/stores/slug/${slug}`).then((r) => r.data),
}

// ─── Products ──────────────────
export const productsApi = {
  list: (params?: { page?: number; limit?: number; search?: string; storeId?: string; categoryId?: string; brandId?: string; status?: string }) =>
    api.get('/products', { params }).then((r) => toPaginated<Product>(r.data, params)),
  get: (id: string) => api.get<Product>(`/products/${id}`).then((r) => r.data),
  getBySlug: (slug: string) => api.get<Product>(`/products/slug/${slug}`).then((r) => r.data),
  getVariants: (productId: string) =>
    api.get<ProductVariant[]>(`/products/${productId}/variants`).then((r) => toArray<ProductVariant>(r.data)),
  getImages: (productId: string) =>
    api.get<ProductImage[]>(`/products/${productId}/images`).then((r) => toArray<ProductImage>(r.data)),
  getCategories: (productId: string) =>
    api.get<ProductCategory[]>(`/products/${productId}/categories`).then((r) => toArray<ProductCategory>(r.data)),
  getAttributeKeys: () =>
    api.get<AttributeKey[]>('/products/attributes/keys').then((r) => toArray<AttributeKey>(r.data)),
  getAttributeValues: (keyId: string) =>
    api.get<AttributeValue[]>(`/products/attributes/keys/${keyId}/values`).then((r) => toArray<AttributeValue>(r.data)),
  getVariantAttributes: (variantId: string) =>
    api.get<VariantAttributeValue[]>(`/products/variants/${variantId}/attributes`).then((r) => toArray<VariantAttributeValue>(r.data)),
}

// ─── Search ────────────────────
export const searchApi = {
  products: (params: { q: string; page?: number; limit?: number; categoryId?: string; storeId?: string }) =>
    api.get<SearchProductsResponse>('/search/products', { params }).then((r) => r.data),
  logQuery: (data: { query: string; sessionId?: string; resultCount?: number }) =>
    api.post('/search', data),
  history: (limit?: number) =>
    api.get<SearchQuery[]>('/search/history', { params: { limit } }).then((r) => toArray<SearchQuery>(r.data)),
  popular: (limit?: number) =>
    api.get<Array<{ query: string; count: number }>>('/search/popular', { params: { limit } }).then((r) => toArray<{ query: string; count: number }>(r.data)),
}

// ─── Cart ──────────────────────
export const cartApi = {
  getMine: () => api.get<Cart>('/cart/mine').then((r) => r.data),
  getItems: () => api.get<CartItem[]>('/cart/mine/items').then((r) => toArray<CartItem>(r.data)),
  addItem: (data: { variantId: string; quantity: number }) =>
    api.post<CartItem>('/cart/mine/items', data).then((r) => r.data),
  updateItem: (itemId: string, data: { quantity: number }) =>
    api.put<CartItem>(`/cart/items/${itemId}`, data).then((r) => r.data),
  removeItem: (itemId: string) => api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete('/cart/mine/clear'),
}

// ─── Wishlist ──────────────────
export const wishlistApi = {
  create: (data?: { name?: string }) =>
    api.post<Wishlist>('/wishlists', data || { name: 'My Wishlist' }).then((r) => r.data),
  getMine: () => api.get<Wishlist[]>('/wishlists/mine').then((r) => toArray<Wishlist>(r.data)),
  addItem: (wishlistId: string, data: { variantId: string }) =>
    api.post<WishlistItem>(`/wishlists/${wishlistId}/items`, data).then((r) => r.data),
  getItems: (wishlistId: string) =>
    api.get<WishlistItem[]>(`/wishlists/${wishlistId}/items`).then((r) => toArray<WishlistItem>(r.data)),
  removeItem: (itemId: string) => api.delete(`/wishlists/items/${itemId}`),
}

// ─── Coupons ───────────────────
export const couponsApi = {
  getByCode: (code: string) =>
    api.get<Coupon>(`/coupons/code/${code}`).then((r) => r.data),
}

// ─── Flash Sales ───────────────
export const flashSalesApi = {
  list: () => api.get<FlashSale[]>('/flash-sales').then((r) => toArray<FlashSale>(r.data)),
  get: (id: string) => api.get<FlashSale>(`/flash-sales/${id}`).then((r) => r.data),
  getItems: (id: string) =>
    api.get<FlashSaleItem[]>(`/flash-sales/${id}/items`).then((r) => toArray<FlashSaleItem>(r.data)),
}

// ─── Orders ────────────────────
export const ordersApi = {
  create: (data: CreateOrderPayload) =>
    api.post<Order>('/orders', data).then((r) => r.data),
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/orders', { params }).then((r) => toPaginated<Order>(r.data, params)),
  get: (id: string) => api.get<Order>(`/orders/${id}`).then((r) => r.data),
  getItems: (id: string) =>
    api.get<OrderItem[]>(`/orders/${id}/items`).then((r) => toArray<OrderItem>(r.data)),
  cancel: (id: string) =>
    api.put<Order>(`/orders/${id}/cancel`).then((r) => r.data),
}

// ─── Payments ──────────────────
export const paymentsApi = {
  list: (params?: { page?: number; limit?: number; orderId?: string }) =>
    api.get('/payments', { params }).then((r) => toPaginated<Payment>(r.data, params)),
  get: (id: string) => api.get<Payment>(`/payments/${id}`).then((r) => r.data),
}

// ─── Stripe ────────────────────
export const stripeApi = {
  createCheckout: (data: { orderId: string; successUrl: string; cancelUrl: string }) =>
    api.post<{ sessionId: string; url: string }>('/stripe/checkout', data).then((r) => r.data),
}

// ─── Returns ───────────────────
export const returnsApi = {
  create: (data: CreateReturnPayload) =>
    api.post<Return>('/returns', data).then((r) => r.data),
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/returns', { params }).then((r) => toPaginated<Return>(r.data, params)),
  get: (id: string) => api.get<Return>(`/returns/${id}`).then((r) => r.data),
  getItems: (id: string) =>
    api.get<ReturnItem[]>(`/returns/${id}/items`).then((r) => toArray<ReturnItem>(r.data)),
}

// ─── Reviews ───────────────────
export const reviewsApi = {
  create: (data: { productId: string; orderId?: string; rating: number; title?: string; body?: string }) =>
    api.post<Review>('/reviews', data).then((r) => r.data),
  list: (params?: { page?: number; limit?: number; productId?: string; userId?: string }) =>
    api.get('/reviews', { params }).then((r) => toPaginated<Review>(r.data, params)),
  get: (id: string) => api.get<Review>(`/reviews/${id}`).then((r) => r.data),
  getSummary: (productId: string) =>
    api.get<RatingSummary>(`/reviews/product/${productId}/summary`).then((r) => r.data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
}

// ─── Notifications ─────────────
export const notificationsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get('/notifications/mine', { params }).then((r) => toPaginated<Notification>(r.data, params)),
  unreadCount: () =>
    api.get<{ count: number }>('/notifications/mine/unread-count').then((r) => {
      const d = r.data as Record<string, unknown>
      return (d?.count as number) ?? 0
    }),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mine/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
}

// ─── Shipping ──────────────────
export const shippingApi = {
  listMethods: () =>
    api.get<ShippingMethod[]>('/shipping/methods').then((r) => toArray<ShippingMethod>(r.data)),
  getOrderShipments: (orderId: string) =>
    api.get<Shipment[]>(`/shipping/order/${orderId}/shipments`).then((r) => toArray<Shipment>(r.data)),
  getShipment: (id: string) =>
    api.get<Shipment>(`/shipping/shipments/${id}`).then((r) => r.data),
  getShipmentEvents: (shipmentId: string) =>
    api.get<ShipmentEvent[]>(`/shipping/shipments/${shipmentId}/events`).then((r) => toArray<ShipmentEvent>(r.data)),
}

// ─── Chat ──────────────────────
export const chatApi = {
  listThreads: () =>
    api.get<ChatThread[]>('/chat/mine/threads').then((r) => toArray<ChatThread>(r.data)),
  getThread: (id: string) =>
    api.get<ChatThread>(`/chat/threads/${id}`).then((r) => r.data),
  createThread: (data: { subject?: string; orderId?: string; productId?: string; participantUserIds?: string[] }) =>
    api.post<ChatThread>('/chat/threads', data).then((r) => r.data),
  getMessages: (threadId: string) =>
    api.get<ChatMessage[]>(`/chat/threads/${threadId}/messages`).then((r) => toArray<ChatMessage>(r.data)),
  sendMessage: (data: { threadId: string; body: string }) =>
    api.post<ChatMessage>('/chat/messages', data).then((r) => r.data),
  getParticipants: (threadId: string) =>
    api.get<ChatThreadParticipant[]>(`/chat/threads/${threadId}/participants`).then((r) => toArray<ChatThreadParticipant>(r.data)),
  markRead: (threadId: string) =>
    api.put(`/chat/threads/${threadId}/read`),
}

// ─── Upload ────────────────────
export const uploadApi = {
  image: (formData: FormData) =>
    api.post<{ url: string }>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
}
