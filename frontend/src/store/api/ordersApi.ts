import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  PaginatedResponse,
  Order,
  OrderStatusHistory,
  Shipment,
  CreateOrderDto,
} from '@/common/types';
import type { OrderStatus, ShipmentStatus } from '@/common/types/enums';

interface OrderQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  sellerId?: string;
  status?: OrderStatus;
}

interface CreateShipmentPayload {
  orderId: string;
  trackingNumber?: string;
  carrierName?: string;
  estimatedDeliveryDate?: string;
  items?: Array<{ orderItemId: string; quantity: number }>;
}

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<ApiResponse<PaginatedResponse<Order>>, OrderQueryParams>({
      query: (params) => ({
        url: '/orders',
        params,
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'Order' as const, id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
    }),

    getMyOrders: builder.query<
      ApiResponse<PaginatedResponse<Order>>,
      { page?: number; limit?: number }
    >({
      query: (params) => ({
        url: '/orders/my-orders',
        params,
      }),
      providesTags: [{ type: 'Order', id: 'MY_ORDERS' }],
    }),

    getOrderById: builder.query<ApiResponse<Order>, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Order', id }],
    }),

    getOrderByNumber: builder.query<ApiResponse<Order>, string>({
      query: (orderNumber) => `/orders/number/${orderNumber}`,
      providesTags: (result) =>
        result?.data ? [{ type: 'Order', id: result.data.id }] : [],
    }),

    createOrder: builder.mutation<ApiResponse<Order>, CreateOrderDto>({
      query: (data) => ({
        url: '/orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Order', id: 'LIST' },
        { type: 'Order', id: 'MY_ORDERS' },
        { type: 'Cart' },
      ],
    }),

    updateOrder: builder.mutation<
      ApiResponse<Order>,
      { id: string; data: Partial<CreateOrderDto> }
    >({
      query: ({ id, data }) => ({
        url: `/orders/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Order', id },
        { type: 'Order', id: 'LIST' },
      ],
    }),

    updateOrderStatus: builder.mutation<
      ApiResponse<Order>,
      { id: string; status: OrderStatus; comment?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/orders/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Order', id },
        { type: 'Order', id: 'LIST' },
      ],
    }),

    cancelOrder: builder.mutation<ApiResponse<Order>, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/orders/${id}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Order', id },
        { type: 'Order', id: 'LIST' },
        { type: 'Order', id: 'MY_ORDERS' },
      ],
    }),

    getOrderStatusHistory: builder.query<ApiResponse<OrderStatusHistory[]>, string>({
      query: (id) => `/orders/${id}/status-history`,
    }),

    // ── Shipments ──
    getOrderShipments: builder.query<ApiResponse<Shipment[]>, string>({
      query: (orderId) => `/orders/${orderId}/shipments`,
      providesTags: (_r, _e, orderId) => [{ type: 'Shipment', id: orderId }],
    }),

    createShipment: builder.mutation<ApiResponse<Shipment>, CreateShipmentPayload>({
      query: ({ orderId, ...data }) => ({
        url: `/orders/${orderId}/shipments`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_r, _e, { orderId }) => [
        { type: 'Shipment', id: orderId },
        { type: 'Order', id: orderId },
      ],
    }),

    updateShipment: builder.mutation<
      ApiResponse<Shipment>,
      { id: string; data: Partial<Shipment>; orderId?: string }
    >({
      query: ({ id, data }) => ({
        url: `/shipments/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { orderId }) =>
        orderId
          ? [{ type: 'Shipment', id: orderId }]
          : [{ type: 'Shipment', id: 'LIST' }],
    }),

    updateShipmentStatus: builder.mutation<
      ApiResponse<Shipment>,
      { id: string; status: ShipmentStatus; orderId?: string }
    >({
      query: ({ id, status }) => ({
        url: `/shipments/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_r, _e, { orderId }) =>
        orderId
          ? [{ type: 'Shipment', id: orderId }]
          : [{ type: 'Shipment', id: 'LIST' }],
    }),

    trackShipment: builder.query<ApiResponse<Shipment>, string>({
      query: (trackingNumber) => `/shipments/track/${trackingNumber}`,
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useGetOrderByNumberQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  useGetOrderStatusHistoryQuery,
  useGetOrderShipmentsQuery,
  useCreateShipmentMutation,
  useUpdateShipmentMutation,
  useUpdateShipmentStatusMutation,
  useTrackShipmentQuery,
} = ordersApi;
