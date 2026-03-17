import api from '@/config/api'
import type {
  AuthResponse,
  LoginCredentials,
  User,
  Role,
  Permission,
  RolePermission,
  Category,
  Brand,
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
  Coupon,
  CouponScope,
  FlashSale,
  FlashSaleItem,
  Warehouse,
  Inventory,
  ShippingZone,
  ShippingZoneCountry,
  ShippingMethod,
  Shipment,
  ShipmentEvent,
  SubscriptionPlan,
  Subscription,
  Return,
  Review,
  Notification,
  AuditLog,
  ChatThread,
  ChatThreadParticipant,
  ChatMessage,
  Address,
  SearchQuery,
  PaginatedResponse,
} from '@/types'

/** Normalize backend response into PaginatedResponse shape (backend may return just an array) */
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
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
}

// ─── Users ─────────────────────
export const usersApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/users', { params }).then((r) => toPaginated<User>(r.data, params)),
  get: (id: string) => api.get<User>(`/users/${id}`).then((r) => r.data),
  create: (data: Partial<User> & { password: string }) =>
    api.post<User>('/users', data).then((r) => r.data),
  update: (id: string, data: Partial<User>) =>
    api.put<User>(`/users/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/users/${id}`),
  getRoles: (id: string) => api.get(`/users/${id}/roles`).then((r) => r.data),
  assignRole: (id: string, roleId: string) =>
    api.post(`/users/${id}/roles`, { roleId }).then((r) => r.data),
  removeRole: (userId: string, roleId: string) =>
    api.delete(`/users/${userId}/roles/${roleId}`),
  getAddresses: (id: string) => api.get<Address[]>(`/users/${id}/addresses`).then((r) => r.data),
  createAddress: (id: string, data: Partial<Address>) =>
    api.post(`/users/${id}/addresses`, data).then((r) => r.data),
  updateAddress: (addressId: string, data: Partial<Address>) =>
    api.put(`/users/addresses/${addressId}`, data).then((r) => r.data),
  deleteAddress: (addressId: string) => api.delete(`/users/addresses/${addressId}`),
  uploadAvatar: (id: string, formData: FormData) =>
    api.patch(`/users/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
}

// ─── Roles ─────────────────────
export const rolesApi = {
  list: () => api.get<Role[]>('/roles').then((r) => r.data),
  get: (id: string) => api.get<Role>(`/roles/${id}`).then((r) => r.data),
  create: (data: { name: string; description?: string; isSystem?: boolean }) =>
    api.post<Role>('/roles', data).then((r) => r.data),
  update: (id: string, data: { name?: string; description?: string }) =>
    api.put<Role>(`/roles/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/roles/${id}`),
}

// ─── Permissions ───────────────
export const permissionsApi = {
  list: () => api.get<Permission[]>('/permissions').then((r) => r.data),
  get: (id: string) => api.get<Permission>(`/permissions/${id}`).then((r) => r.data),
  byModule: (module: string) =>
    api.get<Permission[]>('/permissions/by-module', { params: { module } }).then((r) => r.data),
  create: (data: { code: string; module: string; description?: string }) =>
    api.post<Permission>('/permissions', data).then((r) => r.data),
  update: (id: string, data: Partial<Permission>) =>
    api.put<Permission>(`/permissions/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/permissions/${id}`),
}

// ─── Role Permissions ──────────
export const rolePermissionsApi = {
  get: (roleId: string) =>
    api.get<RolePermission[]>(`/role-permissions/${roleId}`).then((r) => r.data),
  assign: (roleId: string, permissionIds: string[]) =>
    api.post('/role-permissions', { roleId, permissionIds }).then((r) => r.data),
  remove: (roleId: string, permissionId: string) =>
    api.delete(`/role-permissions/${roleId}/${permissionId}`),
}

// ─── Categories ────────────────
export const categoriesApi = {
  list: () => api.get<Category[]>('/categories').then((r) => r.data),
  get: (id: string) => api.get<Category>(`/categories/${id}`).then((r) => r.data),
  create: (data: Partial<Category>) =>
    api.post<Category>('/categories', data).then((r) => r.data),
  update: (id: string, data: Partial<Category>) =>
    api.put<Category>(`/categories/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/categories/${id}`),
  uploadImage: (id: string, formData: FormData) =>
    api.patch(`/categories/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
}

// ─── Brands ────────────────────
export const brandsApi = {
  list: () => api.get<Brand[]>('/brands').then((r) => r.data),
  get: (id: string) => api.get<Brand>(`/brands/${id}`).then((r) => r.data),
  create: (data: Partial<Brand>) => api.post<Brand>('/brands', data).then((r) => r.data),
  update: (id: string, data: Partial<Brand>) =>
    api.put<Brand>(`/brands/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/brands/${id}`),
  uploadLogo: (id: string, formData: FormData) =>
    api.patch(`/brands/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
}

// ─── Sellers ───────────────────
export const sellersApi = {
  list: () => api.get<Seller[]>('/sellers').then((r) => r.data),
  get: (id: string) => api.get<Seller>(`/sellers/${id}`).then((r) => r.data),
  create: (data: Partial<Seller>) =>
    api.post<Seller>('/sellers', data).then((r) => r.data),
  update: (id: string, data: Partial<Seller>) =>
    api.put<Seller>(`/sellers/${id}`, data).then((r) => r.data),
  approve: (id: string) =>
    api.patch<Seller>(`/sellers/${id}/approve`).then((r) => r.data),
  delete: (id: string) => api.delete(`/sellers/${id}`),
}

// ─── Stores ────────────────────
export const storesApi = {
  list: () => api.get<Store[]>('/stores').then((r) => r.data),
  get: (id: string) => api.get<Store>(`/stores/${id}`).then((r) => r.data),
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
  deleteImage: (id: string) => api.delete(`/products/images/${id}`),
  // Attribute Keys
  getAttributeKeys: () => api.get<AttributeKey[]>('/products/attributes/keys').then((r) => r.data),
  getAttributeKey: (id: string) => api.get<AttributeKey>(`/products/attributes/keys/${id}`).then((r) => r.data),
  createAttributeKey: (data: { name: string; inputType: string }) =>
    api.post<AttributeKey>('/products/attributes/keys', data).then((r) => r.data),
  updateAttributeKey: (id: string, data: { name?: string; inputType?: string }) =>
    api.put<AttributeKey>(`/products/attributes/keys/${id}`, data).then((r) => r.data),
  deleteAttributeKey: (id: string) => api.delete(`/products/attributes/keys/${id}`),
  // Attribute Values
  getAttributeValues: (keyId: string) =>
    api.get<AttributeValue[]>(`/products/attributes/keys/${keyId}/values`).then((r) => r.data),
  createAttributeValue: (keyId: string, data: { value: string }) =>
    api.post<AttributeValue>(`/products/attributes/keys/${keyId}/values`, data).then((r) => r.data),
  deleteAttributeValue: (id: string) => api.delete(`/products/attributes/values/${id}`),
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
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/orders', { params }).then((r) => toPaginated<Order>(r.data, params)),
  get: (id: string) => api.get<Order>(`/orders/${id}`).then((r) => r.data),
  getItems: (id: string) => api.get(`/orders/${id}/items`).then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    api.put(`/orders/${id}/status`, { status }).then((r) => r.data),
  cancel: (id: string) => api.put(`/orders/${id}/cancel`).then((r) => r.data),
}

// ─── Payments ──────────────────
export const paymentsApi = {
  list: (params?: { page?: number; limit?: number; status?: string; orderId?: string }) =>
    api.get('/payments', { params }).then((r) => toPaginated<Payment>(r.data, params)),
  get: (id: string) => api.get<Payment>(`/payments/${id}`).then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    api.put(`/payments/${id}/status`, { status }).then((r) => r.data),
}

// ─── Coupons ───────────────────
export const couponsApi = {
  list: () => api.get<Coupon[]>('/coupons').then((r) => r.data),
  get: (id: string) => api.get<Coupon>(`/coupons/${id}`).then((r) => r.data),
  findByCode: (code: string) => api.get<Coupon>(`/coupons/code/${code}`).then((r) => r.data),
  create: (data: Partial<Coupon>) => api.post<Coupon>('/coupons', data).then((r) => r.data),
  update: (id: string, data: Partial<Coupon>) =>
    api.put<Coupon>(`/coupons/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/coupons/${id}`),
  // Coupon Scopes
  getScopes: (id: string) => api.get<CouponScope[]>(`/coupons/${id}/scopes`).then((r) => r.data),
  addScope: (id: string, data: { scopeType: string; scopeId: string }) =>
    api.post<CouponScope>(`/coupons/${id}/scopes`, data).then((r) => r.data),
  removeScope: (scopeId: string) => api.delete(`/coupons/scopes/${scopeId}`),
}

// ─── Flash Sales ───────────────
export const flashSalesApi = {
  list: () => api.get<FlashSale[]>('/flash-sales').then((r) => r.data),
  get: (id: string) => api.get<FlashSale>(`/flash-sales/${id}`).then((r) => r.data),
  create: (data: Partial<FlashSale>) =>
    api.post<FlashSale>('/flash-sales', data).then((r) => r.data),
  update: (id: string, data: Partial<FlashSale>) =>
    api.put<FlashSale>(`/flash-sales/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/flash-sales/${id}`),
  // Flash Sale Items
  getItems: (id: string) => api.get<FlashSaleItem[]>(`/flash-sales/${id}/items`).then((r) => r.data),
  addItem: (id: string, data: { variantId: string; salePrice: number; qtyLimit?: number }) =>
    api.post<FlashSaleItem>(`/flash-sales/${id}/items`, data).then((r) => r.data),
  removeItem: (itemId: string) => api.delete(`/flash-sales/items/${itemId}`),
}

// ─── Inventory ─────────────────
export const warehousesApi = {
  list: () => api.get<Warehouse[]>('/warehouses').then((r) => r.data),
  get: (id: string) => api.get<Warehouse>(`/warehouses/${id}`).then((r) => r.data),
  create: (data: Partial<Warehouse>) =>
    api.post<Warehouse>('/warehouses', data).then((r) => r.data),
  update: (id: string, data: Partial<Warehouse>) =>
    api.put<Warehouse>(`/warehouses/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/warehouses/${id}`),
}

export const inventoryApi = {
  list: () => api.get<Inventory[]>('/inventory').then((r) => r.data),
  lowStock: () => api.get<Inventory[]>('/inventory/low-stock').then((r) => r.data),
  set: (data: { warehouseId: string; variantId: string; qtyOnHand: number; lowStockThreshold?: number }) =>
    api.post('/inventory/set', data).then((r) => r.data),
  adjust: (data: { warehouseId: string; variantId: string; adjustment: number; reason?: string }) =>
    api.post('/inventory/adjust', data).then((r) => r.data),
  reserve: (data: { warehouseId: string; variantId: string; quantity: number }) =>
    api.post('/inventory/reserve', data).then((r) => r.data),
  release: (data: { warehouseId: string; variantId: string; quantity: number }) =>
    api.post('/inventory/release', data).then((r) => r.data),
}

// ─── Shipping ──────────────────
export const shippingApi = {
  // Zones
  listZones: () => api.get<ShippingZone[]>('/shipping/zones').then((r) => r.data),
  getZone: (id: string) => api.get<ShippingZone>(`/shipping/zones/${id}`).then((r) => r.data),
  createZone: (data: Partial<ShippingZone>) =>
    api.post<ShippingZone>('/shipping/zones', data).then((r) => r.data),
  updateZone: (id: string, data: Partial<ShippingZone>) =>
    api.put<ShippingZone>(`/shipping/zones/${id}`, data).then((r) => r.data),
  // Zone Countries
  getCountries: (zoneId: string) =>
    api.get<ShippingZoneCountry[]>(`/shipping/zones/${zoneId}/countries`).then((r) => r.data),
  addCountry: (zoneId: string, data: { countryCode: string }) =>
    api.post<ShippingZoneCountry>(`/shipping/zones/${zoneId}/countries`, data).then((r) => r.data),
  // Methods
  listMethods: () => api.get<ShippingMethod[]>('/shipping/methods').then((r) => r.data),
  createMethod: (data: Partial<ShippingMethod>) =>
    api.post<ShippingMethod>('/shipping/methods', data).then((r) => r.data),
  updateMethod: (id: string, data: Partial<ShippingMethod>) =>
    api.put<ShippingMethod>(`/shipping/methods/${id}`, data).then((r) => r.data),
  // Shipments
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

// ─── Subscriptions ─────────────
export const subscriptionsApi = {
  listPlans: () => api.get<SubscriptionPlan[]>('/subscriptions/plans').then((r) => r.data),
  getPlan: (id: string) =>
    api.get<SubscriptionPlan>(`/subscriptions/plans/${id}`).then((r) => r.data),
  createPlan: (data: Partial<SubscriptionPlan>) =>
    api.post<SubscriptionPlan>('/subscriptions/plans', data).then((r) => r.data),
  updatePlan: (id: string, data: Partial<SubscriptionPlan>) =>
    api.put<SubscriptionPlan>(`/subscriptions/plans/${id}`, data).then((r) => r.data),
  deletePlan: (id: string) => api.delete(`/subscriptions/plans/${id}`),
  list: () => api.get<Subscription[]>('/subscriptions/mine').then((r) => r.data),
  get: (id: string) => api.get<Subscription>(`/subscriptions/${id}`).then((r) => r.data),
  update: (id: string, data: Partial<Subscription>) =>
    api.put<Subscription>(`/subscriptions/${id}`, data).then((r) => r.data),
  cancel: (id: string) => api.put(`/subscriptions/${id}/cancel`).then((r) => r.data),
}

// ─── Returns ───────────────────
export const returnsApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/returns', { params }).then((r) => toPaginated<Return>(r.data, params)),
  get: (id: string) => api.get<Return>(`/returns/${id}`).then((r) => r.data),
  getItems: (id: string) => api.get(`/returns/${id}/items`).then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    api.put(`/returns/${id}/status`, { status }).then((r) => r.data),
}

// ─── Reviews ───────────────────
export const reviewsApi = {
  list: (params?: { page?: number; limit?: number; status?: string; productId?: string }) =>
    api.get('/reviews', { params }).then((r) => toPaginated<Review>(r.data, params)),
  get: (id: string) => api.get<Review>(`/reviews/${id}`).then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    api.put(`/reviews/${id}`, { status }).then((r) => r.data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
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
  create: (data: { userId: string; channel: string; type: string; title: string; body: string; actionUrl?: string }) =>
    api.post<Notification>('/notifications', data).then((r) => r.data),
}

// ─── Audit Logs ────────────────
export const auditApi = {
  list: (params?: { page?: number; limit?: number; action?: string; tableName?: string; actorId?: string }) =>
    api.get('/audit-logs', { params }).then((r) => toPaginated<AuditLog>(r.data, params)),
  get: (id: string) => api.get<AuditLog>(`/audit-logs/${id}`).then((r) => r.data),
  getByEntity: (tableName: string, recordId: string) =>
    api.get<AuditLog[]>(`/audit-logs/entity/${tableName}/${recordId}`).then((r) => r.data),
}

// ─── Chat ──────────────────────
export const chatApi = {
  listThreads: () => api.get<ChatThread[]>('/chat/mine/threads').then((r) => r.data),
  getThread: (id: string) => api.get<ChatThread>(`/chat/threads/${id}`).then((r) => r.data),
  createThread: (data: { orderId?: string; productId?: string; participantIds?: string[] }) =>
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

// ─── Search ────────────────────
export const searchApi = {
  popular: () => api.get<SearchQuery[]>('/search/popular').then((r) => r.data),
  history: (params?: { page?: number; limit?: number }) =>
    api.get<SearchQuery[]>('/search/history', { params }).then((r) => r.data),
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
