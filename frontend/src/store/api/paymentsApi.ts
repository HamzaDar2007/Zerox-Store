import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  PaginatedResponse,
  Payment,
  PaymentAttempt,
  Refund,
  SavedPaymentMethod,
  ProcessPaymentDto,
  CreateRefundDto,
} from '@/common/types';
import type { PaymentStatus } from '@/common/types/enums';

interface PaymentQueryParams {
  page?: number;
  limit?: number;
  orderId?: string;
  userId?: string;
  status?: PaymentStatus;
}

interface RefundQueryParams {
  page?: number;
  limit?: number;
  paymentId?: string;
  status?: string;
}

interface CreateSavedPaymentMethodDto {
  type: string;
  provider: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  holderName?: string;
  token: string;
}

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Payments ──
    getPayments: builder.query<ApiResponse<PaginatedResponse<Payment>>, PaymentQueryParams>({
      query: (params) => ({
        url: '/payments',
        params,
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'Payment' as const, id })),
              { type: 'Payment', id: 'LIST' },
            ]
          : [{ type: 'Payment', id: 'LIST' }],
    }),

    getPaymentById: builder.query<ApiResponse<Payment>, string>({
      query: (id) => `/payments/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Payment', id }],
    }),

    createPayment: builder.mutation<ApiResponse<Payment>, ProcessPaymentDto>({
      query: (data) => ({
        url: '/payments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Payment', id: 'LIST' }],
    }),

    updatePayment: builder.mutation<
      ApiResponse<Payment>,
      { id: string; data: Partial<Payment> }
    >({
      query: ({ id, data }) => ({
        url: `/payments/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Payment', id },
        { type: 'Payment', id: 'LIST' },
      ],
    }),

    processPayment: builder.mutation<
      ApiResponse<Payment>,
      { id: string; paymentData: Record<string, unknown> }
    >({
      query: ({ id, paymentData }) => ({
        url: `/payments/${id}/process`,
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Payment', id },
        { type: 'Order', id: 'LIST' },
      ],
    }),

    getPaymentAttempts: builder.query<ApiResponse<PaymentAttempt[]>, string>({
      query: (id) => `/payments/${id}/attempts`,
    }),

    // ── Refunds ──
    getRefunds: builder.query<ApiResponse<PaginatedResponse<Refund>>, RefundQueryParams>({
      query: (params) => ({
        url: '/refunds',
        params,
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'Refund' as const, id })),
              { type: 'Refund', id: 'LIST' },
            ]
          : [{ type: 'Refund', id: 'LIST' }],
    }),

    getRefundById: builder.query<ApiResponse<Refund>, string>({
      query: (id) => `/refunds/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Refund', id }],
    }),

    createRefund: builder.mutation<ApiResponse<Refund>, CreateRefundDto>({
      query: (data) => ({
        url: '/refunds',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Refund', id: 'LIST' }],
    }),

    processRefund: builder.mutation<ApiResponse<Refund>, string>({
      query: (id) => ({
        url: `/refunds/${id}/process`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Refund', id },
        { type: 'Refund', id: 'LIST' },
        { type: 'Payment', id: 'LIST' },
      ],
    }),

    rejectRefund: builder.mutation<ApiResponse<Refund>, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/refunds/${id}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Refund', id },
        { type: 'Refund', id: 'LIST' },
      ],
    }),

    // ── Saved Payment Methods ──
    getSavedPaymentMethods: builder.query<ApiResponse<SavedPaymentMethod[]>, void>({
      query: () => '/payment-methods',
      providesTags: ['PaymentMethod'],
    }),

    createSavedPaymentMethod: builder.mutation<
      ApiResponse<SavedPaymentMethod>,
      CreateSavedPaymentMethodDto
    >({
      query: (data) => ({
        url: '/payment-methods',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PaymentMethod'],
    }),

    deleteSavedPaymentMethod: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/payment-methods/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PaymentMethod'],
    }),

    setDefaultPaymentMethod: builder.mutation<ApiResponse<SavedPaymentMethod>, string>({
      query: (id) => ({
        url: `/payment-methods/${id}/default`,
        method: 'POST',
      }),
      invalidatesTags: ['PaymentMethod'],
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useProcessPaymentMutation,
  useGetPaymentAttemptsQuery,
  useGetRefundsQuery,
  useGetRefundByIdQuery,
  useCreateRefundMutation,
  useProcessRefundMutation,
  useRejectRefundMutation,
  useGetSavedPaymentMethodsQuery,
  useCreateSavedPaymentMethodMutation,
  useDeleteSavedPaymentMethodMutation,
  useSetDefaultPaymentMethodMutation,
} = paymentsApi;
