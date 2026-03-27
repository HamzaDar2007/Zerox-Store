import api from '@/config/api'
import type {
  AuthResponse,
  LoginCredentials,
  Seller,
  Store,
  Product,
  ProductVariant,
  ProductImage,
  AttributeKey,
  AttributeValue,
  VariantAttributeValue,
  ProductCategory,
  Order,
  Payment,
  Review,
  RatingSummary,
  Notification,
  Return,
  ReturnItem,
  ShippingMethod,
  Shipment,
  ShipmentEvent,
  ChatThread,
  ChatMessage,
  ChatThreadParticipant,
  Category,
  Brand,
  PaginatedResponse,
  Subscription,
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

// ─── Auth ──────────────────────
export const authApi = {
  login: (data: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
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

// ─── Seller ────────────────────
export const sellerApi = {
  getMyProfile: (userId: string) =>
    api.get<Seller[]>('/sellers').then((r) => {
      const list = Array.isArray(r.data) ? r.data : []
      return list.find((s) => s.userId === userId) ?? null
    }) as Promise<Seller | null>,
  create: (data: Partial<Seller>) =>
    api.post<Seller>('/sellers', data).then((r) => r.data),
  update: (id: string, data: Partial<Seller>) =>
    api.put<Seller>(`/sellers/${id}`, data).then((r) => r.data),
  get: (id: string) => api.get<Seller>(`/sellers/${id}`).then((r) => r.data),
}

// ─── Store ─────────────────────
export const storeApi = {
  getMyStore: (sellerId: string) =>
    api.get<Store[]>('/stores').then((r) => {
      const list = Array.isArray(r.data) ? r.data : []
      return list.find((s) => s.sellerId === sellerId) ?? null
    }) as Promise<Store | null>,
  create: (data: Partial<Store>) =>
    api.post<Store>('/stores', data).then((r) => r.data),
  update: (id: string, data: Partial<Store>) =>
    api.put<Store>(`/stores/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/stores/${id}`),
  uploadLogo: (id: string, formData: FormData) =>
    api.patch(`/stores/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  uploadBanner: (id: string, formData: FormData) =>
    api.patch(`/stores/${id}/banner`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
}

// ─── Products ──────────────────
export const productsApi = {
  list: (params?: { page?: number; limit?: number; search?: string; storeId?: string; categoryId?: string }) =>
    api.get('/products', { params }).then((r) => toPaginated<Product>(r.data, params)),
  get: (id: string) => api.get<Product>(`/products/${id}`).then((r) => r.data),
  create: (data: Partial<Product>) => api.post<Product>('/products', data).then((r) => r.data),
  update: (id: string, data: Partial<Product>) =>
    api.put<Product>(`/products/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/products/${id}`),
  // Variants
  getVariants: (productId: string) =>
    api.get<ProductVariant[]>(`/products/${productId}/variants`).then((r) => r.data),
  createVariant: (data: Partial<ProductVariant>) =>
    api.post<ProductVariant>('/products/variants', data).then((r) => r.data),
  updateVariant: (id: string, data: Partial<ProductVariant>) =>
    api.put<ProductVariant>(`/products/variants/${id}`, data).then((r) => r.data),
  deleteVariant: (id: string) => api.delete(`/products/variants/${id}`),
  // Images
  getImages: (productId: string) =>
    api.get<ProductImage[]>(`/products/${productId}/images`).then((r) => r.data),
  uploadImage: (formData: FormData) =>
    api.post<ProductImage>('/products/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  uploadMultipleImages: (formData: FormData) =>
    api.post('/products/images/upload-multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  deleteImage: (id: string) => api.delete(`/products/images/${id}`),
  // Attribute Keys (read-only for seller)
  getAttributeKeys: () => api.get<AttributeKey[]>('/products/attributes/keys').then((r) => r.data),
  getAttributeValues: (keyId: string) =>
    api.get<AttributeValue[]>(`/products/attributes/keys/${keyId}/values`).then((r) => r.data),
  // Variant Attributes
  getVariantAttributes: (variantId: string) =>
    api.get<VariantAttributeValue[]>(`/products/variants/${variantId}/attributes`).then((r) => r.data),
  assignVariantAttribute: (variantId: string, data: { attributeKeyId: string; attributeValueId: string }) =>
    api.post<VariantAttributeValue>(`/products/variants/${variantId}/attributes`, data).then((r) => r.data),
  removeVariantAttribute: (variantId: string, keyId: string) =>
    api.delete(`/products/variants/${variantId}/attributes/${keyId}`),
  // Product Categories
  getProductCategories: (productId: string) =>
    api.get<ProductCategory[]>(`/products/${productId}/categories`).then((r) => r.data),
  addProductCategory: (productId: string, categoryId: string) =>
    api.post<ProductCategory>(`/products/${productId}/categories/${categoryId}`).then((r) => r.data),
  removeProductCategory: (productId: string, categoryId: string) =>
    api.delete(`/products/${productId}/categories/${categoryId}`),
}

// ─── Orders ────────────────────
export const ordersApi = {
  list: (params?: { page?: number; limit?: number; status?: string; storeId?: string }) =>
    api.get('/orders', { params }).then((r) => toPaginated<Order>(r.data, params)),
  get: (id: string) => api.get<Order>(`/orders/${id}`).then((r) => r.data),
  getItems: (id: string) => api.get(`/orders/${id}/items`).then((r) => r.data),
  cancel: (id: string) => api.put(`/orders/${id}/cancel`).then((r) => r.data),
}

// ─── Payments ──────────────────
export const paymentsApi = {
  list: (params?: { page?: number; limit?: number; status?: string; orderId?: string }) =>
    api.get('/payments', { params }).then((r) => toPaginated<Payment>(r.data, params)),
  get: (id: string) => api.get<Payment>(`/payments/${id}`).then((r) => r.data),
}

// ─── Shipping ──────────────────
export const shippingApi = {
  listMethods: () => api.get<ShippingMethod[]>('/shipping/methods').then((r) => r.data),
  getShipment: (id: string) => api.get<Shipment>(`/shipping/shipments/${id}`).then((r) => r.data),
  getOrderShipments: (orderId: string) =>
    api.get<Shipment[]>(`/shipping/order/${orderId}/shipments`).then((r) => r.data),
  createShipment: (data: Partial<Shipment>) =>
    api.post<Shipment>('/shipping/shipments', data).then((r) => r.data),
  updateShipment: (id: string, data: Partial<Shipment>) =>
    api.put<Shipment>(`/shipping/shipments/${id}`, data).then((r) => r.data),
  getShipmentEvents: (id: string) =>
    api.get<ShipmentEvent[]>(`/shipping/shipments/${id}/events`).then((r) => r.data),
  createShipmentEvent: (id: string, data: Partial<ShipmentEvent>) =>
    api.post<ShipmentEvent>(`/shipping/shipments/${id}/events`, data).then((r) => r.data),
}

// ─── Reviews ───────────────────
export const reviewsApi = {
  list: (params?: { page?: number; limit?: number; productId?: string }) =>
    api.get('/reviews', { params }).then((r) => toPaginated<Review>(r.data, params)),
  get: (id: string) => api.get<Review>(`/reviews/${id}`).then((r) => r.data),
  getSummary: (productId: string) =>
    api.get<RatingSummary>(`/reviews/product/${productId}/summary`).then((r) => r.data),
  reply: (id: string, body: string) =>
    api.patch<Review>(`/reviews/${id}/reply`, { body }).then((r) => r.data),
}

// ─── Notifications ─────────────
export const notificationsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get('/notifications/mine', { params }).then((r) => toPaginated<Notification>(r.data, params)),
  unreadCount: () =>
    api.get<{ count: number }>('/notifications/mine/unread-count').then((r) => r.data),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mine/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
}

// ─── Returns ───────────────────
export const returnsApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/returns', { params }).then((r) => toPaginated<Return>(r.data, params)),
  get: (id: string) => api.get<Return>(`/returns/${id}`).then((r) => r.data),
  getItems: (id: string) => api.get<ReturnItem[]>(`/returns/${id}/items`).then((r) => r.data),
}

// ─── Chat ──────────────────────
export const chatApi = {
  listThreads: () => api.get<ChatThread[]>('/chat/mine/threads').then((r) => r.data),
  getThread: (id: string) => api.get<ChatThread>(`/chat/threads/${id}`).then((r) => r.data),
  createThread: (data: { subject?: string; orderId?: string; productId?: string; participantUserIds?: string[] }) =>
    api.post<ChatThread>('/chat/threads', data).then((r) => r.data),
  getMessages: (threadId: string) =>
    api.get<ChatMessage[]>(`/chat/threads/${threadId}/messages`).then((r) => r.data),
  sendMessage: (data: { threadId: string; body: string }) =>
    api.post<ChatMessage>('/chat/messages', data).then((r) => r.data),
  updateThreadStatus: (id: string, status: string) =>
    api.put(`/chat/threads/${id}/status`, { status }).then((r) => r.data),
  getParticipants: (threadId: string) =>
    api.get<ChatThreadParticipant[]>(`/chat/threads/${threadId}/participants`).then((r) => r.data),
  updateLastRead: (threadId: string) =>
    api.put(`/chat/threads/${threadId}/read`).then((r) => r.data),
}

// ─── Categories & Brands (read-only) ──
export const categoriesApi = {
  list: () => api.get<Category[]>('/categories').then((r) => r.data),
}

export const brandsApi = {
  list: () => api.get<Brand[]>('/brands').then((r) => r.data),
}

// ─── Upload ────────────────────
export const uploadApi = {
  image: (formData: FormData) =>
    api.post<{ url: string }>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  images: (formData: FormData) =>
    api.post<{ urls: string[] }>('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
}

// ─── Subscriptions ─────────────
export const subscriptionsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get('/subscriptions/mine', { params }).then((r) => toPaginated<Subscription>(r.data, params)),
  get: (id: string) => api.get<Subscription>(`/subscriptions/${id}`).then((r) => r.data),
  cancel: (id: string) => api.put(`/subscriptions/${id}/cancel`).then((r) => r.data),
}












