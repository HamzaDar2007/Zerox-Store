import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  PaginatedResponse,
  Subscription,
  SubscriptionOrder,
  CreateSubscriptionDto,
} from '@/common/types';
import type { SubscriptionStatus } from '@/common/types/enums';

interface SubscriptionQueryParams {
  page?: number;
  limit?: number;
  status?: SubscriptionStatus;
}

export const subscriptionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptions: builder.query<
      ApiResponse<PaginatedResponse<Subscription>>,
      SubscriptionQueryParams
    >({
      query: (params) => ({
        url: '/subscriptions',
        params,
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'Subscription' as const, id })),
              { type: 'Subscription', id: 'LIST' },
            ]
          : [{ type: 'Subscription', id: 'LIST' }],
    }),

    getMySubscriptions: builder.query<ApiResponse<Subscription[]>, void>({
      query: () => '/subscriptions/my-subscriptions',
      providesTags: [{ type: 'Subscription', id: 'MY' }],
    }),

    getDueSubscriptions: builder.query<ApiResponse<Subscription[]>, void>({
      query: () => '/subscriptions/due',
      providesTags: [{ type: 'Subscription', id: 'DUE' }],
    }),

    getSubscriptionById: builder.query<ApiResponse<Subscription>, string>({
      query: (id) => `/subscriptions/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Subscription', id }],
    }),

    createSubscription: builder.mutation<ApiResponse<Subscription>, CreateSubscriptionDto>({
      query: (data) => ({
        url: '/subscriptions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Subscription', id: 'LIST' },
        { type: 'Subscription', id: 'MY' },
      ],
    }),

    updateSubscription: builder.mutation<
      ApiResponse<Subscription>,
      { id: string; data: Partial<CreateSubscriptionDto> }
    >({
      query: ({ id, data }) => ({
        url: `/subscriptions/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Subscription', id },
        { type: 'Subscription', id: 'LIST' },
      ],
    }),

    cancelSubscription: builder.mutation<
      ApiResponse<Subscription>,
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `/subscriptions/${id}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Subscription', id },
        { type: 'Subscription', id: 'LIST' },
        { type: 'Subscription', id: 'MY' },
      ],
    }),

    pauseSubscription: builder.mutation<ApiResponse<Subscription>, string>({
      query: (id) => ({
        url: `/subscriptions/${id}/pause`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Subscription', id },
        { type: 'Subscription', id: 'LIST' },
      ],
    }),

    resumeSubscription: builder.mutation<ApiResponse<Subscription>, string>({
      query: (id) => ({
        url: `/subscriptions/${id}/resume`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Subscription', id },
        { type: 'Subscription', id: 'LIST' },
      ],
    }),

    processRenewal: builder.mutation<ApiResponse<Subscription>, string>({
      query: (id) => ({
        url: `/subscriptions/${id}/renew`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Subscription', id },
        { type: 'Subscription', id: 'LIST' },
        { type: 'Subscription', id: 'DUE' },
      ],
    }),

    getSubscriptionOrders: builder.query<ApiResponse<SubscriptionOrder[]>, string>({
      query: (subscriptionId) => `/subscriptions/${subscriptionId}/orders`,
    }),
  }),
});

export const {
  useGetSubscriptionsQuery,
  useGetMySubscriptionsQuery,
  useGetDueSubscriptionsQuery,
  useGetSubscriptionByIdQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useCancelSubscriptionMutation,
  usePauseSubscriptionMutation,
  useResumeSubscriptionMutation,
  useProcessRenewalMutation,
  useGetSubscriptionOrdersQuery,
} = subscriptionsApi;
