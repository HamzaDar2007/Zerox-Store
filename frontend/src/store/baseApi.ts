import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';

import { STORAGE_KEYS } from '@/lib/constants';
import type { ApiResponse } from '@/common/types';

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Wait until the mutex is available without locking it
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Check whether the mutex is locked
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          // Try to get a new token
          const refreshResult = await baseQuery(
            {
              url: '/auth/refresh',
              method: 'POST',
              body: { refreshToken },
            },
            api,
            extraOptions,
          );

          if (refreshResult.data) {
            const response = refreshResult.data as ApiResponse<{
              accessToken: string;
            }>;
            // Store the new access token (backend doesn't return a new refresh token)
            localStorage.setItem(
              STORAGE_KEYS.ACCESS_TOKEN,
              response.data.accessToken,
            );
            // Retry the original query
            result = await baseQuery(args, api, extraOptions);
          } else {
            // Refresh failed — clear tokens and redirect
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            window.location.href = '/login';
          }
        } else {
          // No refresh token — clear everything
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          window.location.href = '/login';
        }
      } finally {
        release();
      }
    } else {
      // Wait until the mutex is available and retry
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Auth',
    'User',
    'Category',
    'Brand',
    'Attribute',
    'Product',
    'ProductVariant',
    'ProductImage',
    'ProductQuestion',
    'Order',
    'Shipment',
    'Cart',
    'Wishlist',
    'Checkout',
    'Payment',
    'Refund',
    'PaymentMethod',
    'Seller',
    'Store',
    'Warehouse',
    'Inventory',
    'InventoryTransfer',
    'Review',
    'Return',
    'ReturnReason',
    'Role',
    'Permission',
    'RolePermission',
    'ShippingZone',
    'ShippingMethod',
    'ShippingCarrier',
    'ShippingRate',
    'DeliverySlot',
    'TaxZone',
    'TaxRate',
    'TaxClass',
    'Search',
    'Campaign',
    'FlashSale',
    'Voucher',
    'Notification',
    'NotificationTemplate',
    'NotificationPreference',
    'LoyaltyPoints',
    'LoyaltyTier',
    'LoyaltyTransaction',
    'Referral',
    'Dispute',
    'Conversation',
    'Message',
    'Page',
    'Banner',
    'AuditLog',
    'ActivityLog',
    'Bundle',
    'BundleItem',
    'Language',
    'Currency',
    'Translation',
    'SeoMetadata',
    'UrlRedirect',
    'Subscription',
    'SystemSetting',
    'FeatureFlag',
    'Ticket',
    'TicketCategory',
    'BulkOperation',
    'ImportExportJob',
  ],
  endpoints: () => ({}),
});
