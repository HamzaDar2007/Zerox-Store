import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  TaxZone,
  TaxRate,
  TaxClass,
  CreateTaxZoneDto,
  CreateTaxRateDto,
  CreateTaxClassDto,
} from '@/common/types';

interface CalculateTaxPayload {
  amount: number;
  countryCode: string;
  stateCode?: string;
  taxClassId?: string;
}

interface TaxCalculationResult {
  taxAmount: number;
  rate: number;
  breakdown?: Array<{ name: string; rate: number; amount: number }>;
}

export const taxApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Tax Zones ──
    getTaxZones: builder.query<ApiResponse<TaxZone[]>, void>({
      query: () => '/tax/zones',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'TaxZone' as const, id })),
              { type: 'TaxZone', id: 'LIST' },
            ]
          : [{ type: 'TaxZone', id: 'LIST' }],
    }),

    getTaxZoneById: builder.query<ApiResponse<TaxZone>, string>({
      query: (id) => `/tax/zones/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'TaxZone', id }],
    }),

    createTaxZone: builder.mutation<ApiResponse<TaxZone>, CreateTaxZoneDto>({
      query: (data) => ({
        url: '/tax/zones',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'TaxZone', id: 'LIST' }],
    }),

    updateTaxZone: builder.mutation<
      ApiResponse<TaxZone>,
      { id: string; data: Partial<CreateTaxZoneDto> }
    >({
      query: ({ id, data }) => ({
        url: `/tax/zones/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'TaxZone', id },
        { type: 'TaxZone', id: 'LIST' },
      ],
    }),

    deleteTaxZone: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/tax/zones/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'TaxZone', id: 'LIST' }],
    }),

    // ── Tax Rates ──
    getTaxRates: builder.query<ApiResponse<TaxRate[]>, { zoneId?: string }>({
      query: (params) => ({
        url: '/tax/rates',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'TaxRate' as const, id })),
              { type: 'TaxRate', id: 'LIST' },
            ]
          : [{ type: 'TaxRate', id: 'LIST' }],
    }),

    createTaxRate: builder.mutation<ApiResponse<TaxRate>, CreateTaxRateDto>({
      query: (data) => ({
        url: '/tax/rates',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'TaxRate', id: 'LIST' }],
    }),

    updateTaxRate: builder.mutation<
      ApiResponse<TaxRate>,
      { id: string; data: Partial<CreateTaxRateDto> }
    >({
      query: ({ id, data }) => ({
        url: `/tax/rates/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'TaxRate', id },
        { type: 'TaxRate', id: 'LIST' },
      ],
    }),

    deleteTaxRate: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/tax/rates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'TaxRate', id: 'LIST' }],
    }),

    // ── Tax Classes ──
    getTaxClasses: builder.query<ApiResponse<TaxClass[]>, void>({
      query: () => '/tax/classes',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'TaxClass' as const, id })),
              { type: 'TaxClass', id: 'LIST' },
            ]
          : [{ type: 'TaxClass', id: 'LIST' }],
    }),

    createTaxClass: builder.mutation<ApiResponse<TaxClass>, CreateTaxClassDto>({
      query: (data) => ({
        url: '/tax/classes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'TaxClass', id: 'LIST' }],
    }),

    updateTaxClass: builder.mutation<
      ApiResponse<TaxClass>,
      { id: string; data: Partial<CreateTaxClassDto> }
    >({
      query: ({ id, data }) => ({
        url: `/tax/classes/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'TaxClass', id },
        { type: 'TaxClass', id: 'LIST' },
      ],
    }),

    // ── Calculate ──
    calculateTax: builder.mutation<ApiResponse<TaxCalculationResult>, CalculateTaxPayload>({
      query: (data) => ({
        url: '/tax/calculate',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetTaxZonesQuery,
  useGetTaxZoneByIdQuery,
  useCreateTaxZoneMutation,
  useUpdateTaxZoneMutation,
  useDeleteTaxZoneMutation,
  useGetTaxRatesQuery,
  useCreateTaxRateMutation,
  useUpdateTaxRateMutation,
  useDeleteTaxRateMutation,
  useGetTaxClassesQuery,
  useCreateTaxClassMutation,
  useUpdateTaxClassMutation,
  useCalculateTaxMutation,
} = taxApi;
