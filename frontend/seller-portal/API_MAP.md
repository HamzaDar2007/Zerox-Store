# Seller Portal → Backend API Map

Maps each seller portal feature to the backend API endpoints it uses.

## Auth

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| Login | POST | `/api/auth/login` | `authApi.login` |
| Register | POST | `/api/auth/register` | `authApi.register` |
| Refresh token | POST | `/api/auth/refresh` | `authApi.refresh` |
| Logout | POST | `/api/auth/logout` | `authApi.logout` |
| Change password | POST | `/api/auth/change-password` | `authApi.changePassword` |
| Forgot password | POST | `/api/auth/forgot-password` | `authApi.forgotPassword` |
| Reset password | POST | `/api/auth/reset-password` | `authApi.resetPassword` |

## Seller Profile

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| Get my seller profile | GET | `/api/sellers` | `sellerApi.getMyProfile` |
| Create seller | POST | `/api/sellers` | `sellerApi.create` |
| Update seller | PATCH | `/api/sellers/:id` | `sellerApi.update` |

## Store

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| Get my store | GET | `/api/stores` | `storeApi.getMyStore` |
| Create store | POST | `/api/stores` | `storeApi.create` |
| Update store | PATCH | `/api/stores/:id` | `storeApi.update` |
| Upload logo | POST | `/api/stores/:id/logo` | `storeApi.uploadLogo` |
| Upload banner | POST | `/api/stores/:id/banner` | `storeApi.uploadBanner` |

## Products

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| List (by storeId) | GET | `/api/products?storeId=` | `productsApi.list` |
| Get product | GET | `/api/products/:id` | `productsApi.get` |
| Create product | POST | `/api/products` | `productsApi.create` |
| Update product | PATCH | `/api/products/:id` | `productsApi.update` |
| Delete product | DELETE | `/api/products/:id` | `productsApi.delete` |
| List variants | GET | `/api/product-variants?productId=` | `productsApi.getVariants` |
| Create variant | POST | `/api/product-variants` | `productsApi.createVariant` |
| Update variant | PATCH | `/api/product-variants/:id` | `productsApi.updateVariant` |
| Delete variant | DELETE | `/api/product-variants/:id` | `productsApi.deleteVariant` |
| List images | GET | `/api/product-images?productId=` | `productsApi.getImages` |
| Upload image | POST | `/api/product-images` | `productsApi.uploadImage` |
| Delete image | DELETE | `/api/product-images/:id` | `productsApi.deleteImage` |

## Orders

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| List (by storeId) | GET | `/api/orders?storeId=` | `ordersApi.list` |
| Get order | GET | `/api/orders/:id` | `ordersApi.get` |
| Get order items | GET | `/api/order-items?orderId=` | `ordersApi.getItems` |
| Cancel order | PATCH | `/api/orders/:id/cancel` | `ordersApi.cancel` |

## Shipping

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| List methods | GET | `/api/shipping-methods` | `shippingApi.listMethods` |
| Get shipments for order | GET | `/api/shipments?orderId=` | `shippingApi.getOrderShipments` |
| Create shipment | POST | `/api/shipments` | `shippingApi.createShipment` |
| Update shipment | PATCH | `/api/shipments/:id` | `shippingApi.updateShipment` |
| Get events | GET | `/api/shipment-events?shipmentId=` | `shippingApi.getShipmentEvents` |
| Create event | POST | `/api/shipment-events` | `shippingApi.createShipmentEvent` |

## Payments

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| List payments | GET | `/api/payments` | `paymentsApi.list` |
| Get payment | GET | `/api/payments/:id` | `paymentsApi.get` |

## Reviews

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| List reviews | GET | `/api/reviews` | `reviewsApi.list` |
| Get review | GET | `/api/reviews/:id` | `reviewsApi.get` |
| Get summary | GET | `/api/reviews/summary` | `reviewsApi.getSummary` |
| Reply to review | PATCH | `/api/reviews/:id/reply` | `reviewsApi.reply` |

## Notifications

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| List | GET | `/api/notifications` | `notificationsApi.list` |
| Unread count | GET | `/api/notifications/unread-count` | `notificationsApi.unreadCount` |
| Mark read | PATCH | `/api/notifications/:id/read` | `notificationsApi.markRead` |
| Mark all read | PATCH | `/api/notifications/read-all` | `notificationsApi.markAllRead` |
| Delete | DELETE | `/api/notifications/:id` | `notificationsApi.delete` |

## Returns

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| List | GET | `/api/returns` | `returnsApi.list` |
| Get return | GET | `/api/returns/:id` | `returnsApi.get` |
| Get items | GET | `/api/return-items?returnId=` | `returnsApi.getItems` |

## Chat

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| List threads | GET | `/api/chat-threads` | `chatApi.listThreads` |
| Get thread | GET | `/api/chat-threads/:id` | `chatApi.getThread` |
| Create thread | POST | `/api/chat-threads` | `chatApi.createThread` |
| Get messages | GET | `/api/chat-messages?threadId=` | `chatApi.getMessages` |
| Send message | POST | `/api/chat-messages` | `chatApi.sendMessage` |
| Update thread status | PATCH | `/api/chat-threads/:id` | `chatApi.updateThreadStatus` |
| Update last read | PATCH | `/api/chat-thread-participants/:threadId/read` | `chatApi.updateLastRead` |

## Categories & Brands (Read-Only)

| Feature | Method | Endpoint | Service |
|---------|--------|----------|---------|
| List categories | GET | `/api/categories` | `categoriesApi.list` |
| List brands | GET | `/api/brands` | `brandsApi.list` |
