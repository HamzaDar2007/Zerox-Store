import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  ShippingZone,
  ShippingMethod,
  ShippingCarrier,
  ShippingRate,
  DeliverySlot,
  CreateShippingZoneDto,
  CreateShippingMethodDto,
  CreateShippingCarrierDto,
  CreateShippingRateDto,
  CreateDeliverySlotDto,
} from '@/common/types';

interface CalculateShippingPayload {
  zoneId: string;
  weight: number;
  totalAmount: number;
}

interface ShippingCalculationResult {
  rate: number;
  method: string;
  estimatedDays: number;
}

export const shippingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Zones ──
    getShippingZones: builder.query<ApiResponse<ShippingZone[]>, void>({
      query: () => '/shipping/zones',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'ShippingZone' as const, id })),
              { type: 'ShippingZone', id: 'LIST' },
            ]
          : [{ type: 'ShippingZone', id: 'LIST' }],
    }),

    getShippingZoneById: builder.query<ApiResponse<ShippingZone>, string>({
      query: (id) => `/shipping/zones/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'ShippingZone', id }],
    }),

    createShippingZone: builder.mutation<ApiResponse<ShippingZone>, CreateShippingZoneDto>({
      query: (data) => ({
        url: '/shipping/zones',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'ShippingZone', id: 'LIST' }],
    }),

    updateShippingZone: builder.mutation<
      ApiResponse<ShippingZone>,
      { id: string; data: Partial<CreateShippingZoneDto> }
    >({
      query: ({ id, data }) => ({
        url: `/shipping/zones/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'ShippingZone', id },
        { type: 'ShippingZone', id: 'LIST' },
      ],
    }),

    deleteShippingZone: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/shipping/zones/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'ShippingZone', id: 'LIST' }],
    }),

    // ── Methods ──
    getShippingMethods: builder.query<ApiResponse<ShippingMethod[]>, { isActive?: boolean }>({
      query: (params) => ({
        url: '/shipping/methods',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'ShippingMethod' as const, id })),
              { type: 'ShippingMethod', id: 'LIST' },
            ]
          : [{ type: 'ShippingMethod', id: 'LIST' }],
    }),

    createShippingMethod: builder.mutation<ApiResponse<ShippingMethod>, CreateShippingMethodDto>({
      query: (data) => ({
        url: '/shipping/methods',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'ShippingMethod', id: 'LIST' }],
    }),

    updateShippingMethod: builder.mutation<
      ApiResponse<ShippingMethod>,
      { id: string; data: Partial<CreateShippingMethodDto> }
    >({
      query: ({ id, data }) => ({
        url: `/shipping/methods/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'ShippingMethod', id },
        { type: 'ShippingMethod', id: 'LIST' },
      ],
    }),

    deleteShippingMethod: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/shipping/methods/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'ShippingMethod', id: 'LIST' }],
    }),

    // ── Carriers ──
    getShippingCarriers: builder.query<ApiResponse<ShippingCarrier[]>, { isActive?: boolean }>({
      query: (params) => ({
        url: '/shipping/carriers',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'ShippingCarrier' as const, id })),
              { type: 'ShippingCarrier', id: 'LIST' },
            ]
          : [{ type: 'ShippingCarrier', id: 'LIST' }],
    }),

    createShippingCarrier: builder.mutation<ApiResponse<ShippingCarrier>, CreateShippingCarrierDto>({
      query: (data) => ({
        url: '/shipping/carriers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'ShippingCarrier', id: 'LIST' }],
    }),

    updateShippingCarrier: builder.mutation<
      ApiResponse<ShippingCarrier>,
      { id: string; data: Partial<CreateShippingCarrierDto> }
    >({
      query: ({ id, data }) => ({
        url: `/shipping/carriers/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'ShippingCarrier', id },
        { type: 'ShippingCarrier', id: 'LIST' },
      ],
    }),

    // ── Rates ──
    getShippingRates: builder.query<
      ApiResponse<ShippingRate[]>,
      { zoneId?: string; methodId?: string }
    >({
      query: (params) => ({
        url: '/shipping/rates',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'ShippingRate' as const, id })),
              { type: 'ShippingRate', id: 'LIST' },
            ]
          : [{ type: 'ShippingRate', id: 'LIST' }],
    }),

    createShippingRate: builder.mutation<ApiResponse<ShippingRate>, CreateShippingRateDto>({
      query: (data) => ({
        url: '/shipping/rates',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'ShippingRate', id: 'LIST' }],
    }),

    updateShippingRate: builder.mutation<
      ApiResponse<ShippingRate>,
      { id: string; data: Partial<CreateShippingRateDto> }
    >({
      query: ({ id, data }) => ({
        url: `/shipping/rates/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'ShippingRate', id },
        { type: 'ShippingRate', id: 'LIST' },
      ],
    }),

    // ── Calculate ──
    calculateShipping: builder.mutation<
      ApiResponse<ShippingCalculationResult>,
      CalculateShippingPayload
    >({
      query: (data) => ({
        url: '/shipping/calculate',
        method: 'POST',
        body: data,
      }),
    }),

    // ── Delivery Slots ──
    getDeliverySlots: builder.query<ApiResponse<DeliverySlot[]>, void>({
      query: () => '/shipping/slots',
      providesTags: ['DeliverySlot'],
    }),

    createDeliverySlot: builder.mutation<ApiResponse<DeliverySlot>, CreateDeliverySlotDto>({
      query: (data) => ({
        url: '/shipping/slots',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['DeliverySlot'],
    }),
  }),
});

export const {
  useGetShippingZonesQuery,
  useGetShippingZoneByIdQuery,
  useCreateShippingZoneMutation,
  useUpdateShippingZoneMutation,
  useDeleteShippingZoneMutation,
  useGetShippingMethodsQuery,
  useCreateShippingMethodMutation,
  useUpdateShippingMethodMutation,
  useDeleteShippingMethodMutation,
  useGetShippingCarriersQuery,
  useCreateShippingCarrierMutation,
  useUpdateShippingCarrierMutation,
  useGetShippingRatesQuery,
  useCreateShippingRateMutation,
  useUpdateShippingRateMutation,
  useCalculateShippingMutation,
  useGetDeliverySlotsQuery,
  useCreateDeliverySlotMutation,
} = shippingApi;
