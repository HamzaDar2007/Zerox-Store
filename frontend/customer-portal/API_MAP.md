# Customer Portal — API Endpoint Map

## Authentication
| Method | Endpoint                    | Auth | Description              |
|--------|-----------------------------|------|--------------------------|
| POST   | /auth/login                 | No   | Login with email/password|
| POST   | /auth/register              | No   | Register new account     |
| POST   | /auth/refresh               | No   | Refresh access token     |
| POST   | /auth/logout                | Yes  | Logout / invalidate      |
| POST   | /auth/change-password       | Yes  | Change password          |
| POST   | /auth/forgot-password       | No   | Send reset email         |
| POST   | /auth/reset-password        | No   | Reset with token         |
| POST   | /auth/verify-email          | No   | Verify email             |

## Users / Profile
| Method | Endpoint                    | Auth | Description              |
|--------|-----------------------------|------|--------------------------|
| GET    | /users/:id                  | Yes  | Get user profile         |
| PUT    | /users/:id                  | Yes  | Update profile           |
| PATCH  | /users/:id/avatar           | Yes  | Upload avatar            |

## Addresses
| Method | Endpoint                    | Auth | Description              |
|--------|-----------------------------|------|--------------------------|
| GET    | /users/:userId/addresses    | Yes  | List addresses           |
| POST   | /users/:userId/addresses    | Yes  | Create address           |
| PUT    | /users/addresses/:id        | Yes  | Update address           |
| DELETE | /users/addresses/:id        | Yes  | Delete address           |

## Products
| Method | Endpoint                                        | Auth | Description              |
|--------|--------------------------------------------------|------|--------------------------|
| GET    | /products                                        | No   | List (paginated, filterable) |
| GET    | /products/:id                                    | No   | Get by ID                |
| GET    | /products/slug/:slug                             | No   | Get by slug              |
| GET    | /products/:id/variants                           | No   | List variants            |
| GET    | /products/:id/images                             | No   | List images              |
| GET    | /products/:id/categories                         | No   | Product categories       |
| GET    | /products/attributes/keys                        | No   | Attribute keys           |
| GET    | /products/attributes/keys/:keyId/values          | No   | Attribute values         |
| GET    | /products/variants/:variantId/attributes         | No   | Variant attributes       |

## Categories & Brands
| Method | Endpoint           | Auth | Description              |
|--------|--------------------|------|--------------------------|
| GET    | /categories        | No   | List all categories      |
| GET    | /categories/:id    | No   | Get category             |
| GET    | /brands            | No   | List all brands          |
| GET    | /brands/:id        | No   | Get brand                |

## Stores
| Method | Endpoint             | Auth | Description              |
|--------|----------------------|------|--------------------------|
| GET    | /stores              | No   | List stores              |
| GET    | /stores/:id          | No   | Get store by ID          |
| GET    | /stores/slug/:slug   | No   | Get store by slug        |

## Cart
| Method | Endpoint             | Auth | Description              |
|--------|----------------------|------|--------------------------|
| GET    | /cart/mine           | Yes  | Get my cart              |
| GET    | /cart/mine/items     | Yes  | Get cart items           |
| POST   | /cart/mine/items     | Yes  | Add item to cart         |
| PUT    | /cart/items/:itemId  | Yes  | Update item quantity     |
| DELETE | /cart/items/:itemId  | Yes  | Remove item              |
| DELETE | /cart/mine/clear     | Yes  | Clear cart               |

## Wishlist
| Method | Endpoint                     | Auth | Description              |
|--------|------------------------------|------|--------------------------|
| POST   | /wishlists                   | Yes  | Create wishlist          |
| GET    | /wishlists/mine              | Yes  | Get my wishlists         |
| POST   | /wishlists/:id/items         | Yes  | Add item                 |
| GET    | /wishlists/:id/items         | Yes  | List items               |
| DELETE | /wishlists/items/:itemId     | Yes  | Remove item              |

## Orders
| Method | Endpoint             | Auth | Description              |
|--------|----------------------|------|--------------------------|
| POST   | /orders              | Yes  | Create order             |
| GET    | /orders              | Yes  | List orders (paginated)  |
| GET    | /orders/:id          | Yes  | Get order detail         |
| GET    | /orders/:id/items    | Yes  | Get order items          |
| PUT    | /orders/:id/cancel   | Yes  | Cancel order             |

## Payments
| Method | Endpoint             | Auth | Description              |
|--------|----------------------|------|--------------------------|
| GET    | /payments            | Yes  | List payments            |
| GET    | /payments/:id        | Yes  | Get payment              |

## Stripe
| Method | Endpoint             | Auth | Description              |
|--------|----------------------|------|--------------------------|
| POST   | /stripe/checkout     | Yes  | Create Stripe checkout   |

## Reviews
| Method | Endpoint                          | Auth | Description              |
|--------|-----------------------------------|------|--------------------------|
| POST   | /reviews                          | Yes  | Create review            |
| GET    | /reviews                          | No   | List (filterable)        |
| GET    | /reviews/:id                      | No   | Get review               |
| GET    | /reviews/product/:productId/summary| No  | Rating summary           |
| DELETE | /reviews/:id                      | Yes  | Delete review            |

## Coupons
| Method | Endpoint               | Auth | Description              |
|--------|------------------------|------|--------------------------|
| GET    | /coupons/code/:code    | No   | Validate coupon code     |

## Flash Sales
| Method | Endpoint                  | Auth | Description              |
|--------|---------------------------|------|--------------------------|
| GET    | /flash-sales              | No   | List active flash sales  |
| GET    | /flash-sales/:id          | No   | Get flash sale           |
| GET    | /flash-sales/:id/items    | No   | Get sale items           |

## Returns
| Method | Endpoint             | Auth | Description              |
|--------|----------------------|------|--------------------------|
| POST   | /returns             | Yes  | Create return request    |
| GET    | /returns             | Yes  | List returns             |
| GET    | /returns/:id         | Yes  | Get return               |
| GET    | /returns/:id/items   | Yes  | Get return items         |

## Notifications
| Method | Endpoint                        | Auth | Description              |
|--------|---------------------------------|------|--------------------------|
| GET    | /notifications/mine             | Yes  | List notifications       |
| GET    | /notifications/mine/unread-count| Yes  | Get unread count         |
| PUT    | /notifications/:id/read         | Yes  | Mark as read             |
| PUT    | /notifications/mine/read-all    | Yes  | Mark all as read         |
| DELETE | /notifications/:id              | Yes  | Delete notification      |

## Shipping
| Method | Endpoint                                  | Auth | Description              |
|--------|-------------------------------------------|------|--------------------------|
| GET    | /shipping/methods                         | No   | List shipping methods    |
| GET    | /shipping/order/:orderId/shipments        | Yes  | Get order shipments      |
| GET    | /shipping/shipments/:id                   | Yes  | Get shipment             |
| GET    | /shipping/shipments/:shipmentId/events    | Yes  | Tracking events          |

## Search
| Method | Endpoint           | Auth | Description              |
|--------|--------------------|------|--------------------------|
| GET    | /search/products   | No   | Search products          |
| POST   | /search            | No   | Log search query         |
| GET    | /search/history    | Yes  | Search history           |
| GET    | /search/popular    | No   | Popular queries          |

## Chat
| Method | Endpoint                          | Auth | Description              |
|--------|-----------------------------------|------|--------------------------|
| GET    | /chat/mine/threads                | Yes  | List my threads          |
| GET    | /chat/threads/:id                 | Yes  | Get thread               |
| POST   | /chat/threads                     | Yes  | Create thread            |
| GET    | /chat/threads/:threadId/messages  | Yes  | List messages            |
| POST   | /chat/messages                    | Yes  | Send message             |
| GET    | /chat/threads/:id/participants    | Yes  | List participants        |
| PUT    | /chat/threads/:id/read            | Yes  | Mark thread read         |

## Upload
| Method | Endpoint        | Auth | Description              |
|--------|-----------------|------|--------------------------|
| POST   | /upload/image   | Yes  | Upload image             |
