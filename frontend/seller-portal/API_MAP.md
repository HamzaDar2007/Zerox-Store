# Seller Portal → Backend API Map

Maps each seller portal feature to the backend API endpoints it uses.
Generated from `services/api.ts` — March 2026.

## Auth

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| Login | POST | `/auth/login` | `authApi.login` |
| Register | POST | `/auth/register` | `authApi.register` |
| Refresh token | POST | `/auth/refresh` | `authApi.refresh` |
| Logout | POST | `/auth/logout` | `authApi.logout` |
| Change password | POST | `/auth/change-password` | `authApi.changePassword` |
| Forgot password | POST | `/auth/forgot-password` | `authApi.forgotPassword` |
| Reset password | POST | `/auth/reset-password` | `authApi.resetPassword` |
| Verify email | POST | `/auth/verify-email` | `authApi.verifyEmail` |

## Seller Profile

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| Get my seller profile | GET | `/sellers` (filtered by userId) | `sellerApi.getMyProfile` |
| Create seller | POST | `/sellers` | `sellerApi.create` |
| Update seller | PUT | `/sellers/:id` | `sellerApi.update` |
| Get seller | GET | `/sellers/:id` | `sellerApi.get` |

## Store

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| Get my store | GET | `/stores` (filtered by sellerId) | `storeApi.getMyStore` |
| Create store | POST | `/stores` | `storeApi.create` |
| Update store | PUT | `/stores/:id` | `storeApi.update` |
| Delete store | DELETE | `/stores/:id` | `storeApi.delete` |
| Upload logo | PATCH | `/stores/:id/logo` | `storeApi.uploadLogo` |
| Upload banner | PATCH | `/stores/:id/banner` | `storeApi.uploadBanner` |

## Products

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| List products | GET | `/products?storeId=&page=&limit=&search=` | `productsApi.list` |
| Get product | GET | `/products/:id` | `productsApi.get` |
| Create product | POST | `/products` | `productsApi.create` |
| Update product | PUT | `/products/:id` | `productsApi.update` |
| Delete product | DELETE | `/products/:id` | `productsApi.delete` |
| List variants | GET | `/products/:productId/variants` | `productsApi.getVariants` |
| Create variant | POST | `/products/variants` | `productsApi.createVariant` |
| Update variant | PUT | `/products/variants/:id` | `productsApi.updateVariant` |
| Delete variant | DELETE | `/products/variants/:id` | `productsApi.deleteVariant` |
| List images | GET | `/products/:productId/images` | `productsApi.getImages` |
| Upload image | POST | `/products/images/upload` | `productsApi.uploadImage` |
| Upload multiple images | POST | `/products/images/upload-multiple` | `productsApi.uploadMultipleImages` |
| Delete image | DELETE | `/products/images/:id` | `productsApi.deleteImage` |
| List attribute keys | GET | `/products/attributes/keys` | `productsApi.getAttributeKeys` |
| Get attribute values | GET | `/products/attributes/keys/:keyId/values` | `productsApi.getAttributeValues` |
| Get variant attributes | GET | `/products/variants/:variantId/attributes` | `productsApi.getVariantAttributes` |
| Assign variant attribute | POST | `/products/variants/:variantId/attributes` | `productsApi.assignVariantAttribute` |
| Remove variant attribute | DELETE | `/products/variants/:variantId/attributes/:keyId` | `productsApi.removeVariantAttribute` |
| List product categories | GET | `/products/:productId/categories` | `productsApi.getProductCategories` |
| Add product category | POST | `/products/:productId/categories/:categoryId` | `productsApi.addProductCategory` |
| Remove product category | DELETE | `/products/:productId/categories/:categoryId` | `productsApi.removeProductCategory` |

## Orders

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| List orders | GET | `/orders?storeId=&page=&limit=&status=` | `ordersApi.list` |
| Get order | GET | `/orders/:id` | `ordersApi.get` |
| Get order items | GET | `/orders/:id/items` | `ordersApi.getItems` |
| Cancel order | PUT | `/orders/:id/cancel` | `ordersApi.cancel` |

## Payments

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| List payments | GET | `/payments?page=&limit=&status=&orderId=` | `paymentsApi.list` |
| Get payment | GET | `/payments/:id` | `paymentsApi.get` |

## Shipping

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| List shipping methods | GET | `/shipping/methods` | `shippingApi.listMethods` |
| Get shipment | GET | `/shipping/shipments/:id` | `shippingApi.getShipment` |
| List order shipments | GET | `/shipping/order/:orderId/shipments` | `shippingApi.getOrderShipments` |
| Create shipment | POST | `/shipping/shipments` | `shippingApi.createShipment` |
| Update shipment | PUT | `/shipping/shipments/:id` | `shippingApi.updateShipment` |
| Get shipment events | GET | `/shipping/shipments/:id/events` | `shippingApi.getShipmentEvents` |
| Create shipment event | POST | `/shipping/shipments/:id/events` | `shippingApi.createShipmentEvent` |

## Reviews

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| List reviews | GET | `/reviews?page=&limit=&productId=` | `reviewsApi.list` |
| Get review | GET | `/reviews/:id` | `reviewsApi.get` |
| Get rating summary | GET | `/reviews/product/:productId/summary` | `reviewsApi.getSummary` |
| Reply to review | PATCH | `/reviews/:id/reply` | `reviewsApi.reply` |

## Notifications

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| List my notifications | GET | `/notifications/mine` | `notificationsApi.list` |
| Unread count | GET | `/notifications/mine/unread-count` | `notificationsApi.unreadCount` |
| Mark as read | PUT | `/notifications/:id/read` | `notificationsApi.markRead` |
| Mark all as read | PUT | `/notifications/mine/read-all` | `notificationsApi.markAllRead` |
| Delete notification | DELETE | `/notifications/:id` | `notificationsApi.delete` |

## Returns

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| List returns | GET | `/returns?page=&limit=&status=` | `returnsApi.list` |
| Get return | GET | `/returns/:id` | `returnsApi.get` |
| Get return items | GET | `/returns/:id/items` | `returnsApi.getItems` |

## Chat

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| List my threads | GET | `/chat/mine/threads` | `chatApi.listThreads` |
| Get thread | GET | `/chat/threads/:id` | `chatApi.getThread` |
| Create thread | POST | `/chat/threads` | `chatApi.createThread` |
| Get messages | GET | `/chat/threads/:threadId/messages` | `chatApi.getMessages` |
| Send message | POST | `/chat/messages` | `chatApi.sendMessage` |
| Update thread status | PUT | `/chat/threads/:id/status` | `chatApi.updateThreadStatus` |
| Get participants | GET | `/chat/threads/:threadId/participants` | `chatApi.getParticipants` |
| Update last read | PUT | `/chat/threads/:threadId/read` | `chatApi.updateLastRead` |

## Categories & Brands (read-only)

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| List categories | GET | `/categories` | `categoriesApi.list` |
| List brands | GET | `/brands` | `brandsApi.list` |

## File Upload

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| Upload image | POST | `/upload/image` | `uploadApi.image` |
| Upload multiple images | POST | `/upload/images` | `uploadApi.images` |

## Subscriptions

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| List my subscriptions | GET | `/subscriptions/mine` | `subscriptionsApi.list` |
| Get subscription | GET | `/subscriptions/:id` | `subscriptionsApi.get` |
| Cancel subscription | PUT | `/subscriptions/:id/cancel` | `subscriptionsApi.cancel` |
