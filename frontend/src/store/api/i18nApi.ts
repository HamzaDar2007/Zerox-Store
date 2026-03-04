import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  Language,
  Translation,
  Currency,
  CurrencyRateHistory,
  CreateLanguageDto,
  CreateTranslationDto,
  CreateCurrencyDto,
} from '@/common/types';

interface ConvertCurrencyParams {
  amount: number;
  from: string;
  to: string;
}

export const i18nApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Languages ──
    getLanguages: builder.query<ApiResponse<Language[]>, { isActive?: boolean }>({
      query: (params) => ({
        url: '/i18n/languages',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Language' as const, id })),
              { type: 'Language', id: 'LIST' },
            ]
          : [{ type: 'Language', id: 'LIST' }],
    }),

    getActiveLanguages: builder.query<ApiResponse<Language[]>, void>({
      query: () => '/i18n/languages/active',
      providesTags: [{ type: 'Language', id: 'ACTIVE' }],
    }),

    getLanguageByCode: builder.query<ApiResponse<Language>, string>({
      query: (code) => `/i18n/languages/code/${code}`,
    }),

    getLanguageById: builder.query<ApiResponse<Language>, string>({
      query: (id) => `/i18n/languages/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Language', id }],
    }),

    createLanguage: builder.mutation<ApiResponse<Language>, CreateLanguageDto>({
      query: (data) => ({
        url: '/i18n/languages',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Language', id: 'LIST' }, { type: 'Language', id: 'ACTIVE' }],
    }),

    updateLanguage: builder.mutation<
      ApiResponse<Language>,
      { id: string; data: Partial<CreateLanguageDto> }
    >({
      query: ({ id, data }) => ({
        url: `/i18n/languages/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Language', id },
        { type: 'Language', id: 'LIST' },
        { type: 'Language', id: 'ACTIVE' },
      ],
    }),

    deleteLanguage: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/i18n/languages/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Language', id: 'LIST' }, { type: 'Language', id: 'ACTIVE' }],
    }),

    setDefaultLanguage: builder.mutation<ApiResponse<Language>, string>({
      query: (id) => ({
        url: `/i18n/languages/${id}/set-default`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Language', id: 'LIST' }],
    }),

    // ── Currencies ──
    getCurrencies: builder.query<ApiResponse<Currency[]>, { isActive?: boolean }>({
      query: (params) => ({
        url: '/i18n/currencies',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Currency' as const, id })),
              { type: 'Currency', id: 'LIST' },
            ]
          : [{ type: 'Currency', id: 'LIST' }],
    }),

    getActiveCurrencies: builder.query<ApiResponse<Currency[]>, void>({
      query: () => '/i18n/currencies/active',
      providesTags: [{ type: 'Currency', id: 'ACTIVE' }],
    }),

    getCurrencyByCode: builder.query<ApiResponse<Currency>, string>({
      query: (code) => `/i18n/currencies/code/${code}`,
    }),

    getCurrencyById: builder.query<ApiResponse<Currency>, string>({
      query: (id) => `/i18n/currencies/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Currency', id }],
    }),

    convertCurrency: builder.query<ApiResponse<{ amount: number; rate: number }>, ConvertCurrencyParams>({
      query: (params) => ({
        url: '/i18n/currencies/convert',
        params,
      }),
    }),

    getCurrencyRateHistory: builder.query<
      ApiResponse<CurrencyRateHistory[]>,
      { id: string; limit?: number }
    >({
      query: ({ id, limit }) => ({
        url: `/i18n/currencies/${id}/rate-history`,
        params: { limit },
      }),
    }),

    createCurrency: builder.mutation<ApiResponse<Currency>, CreateCurrencyDto>({
      query: (data) => ({
        url: '/i18n/currencies',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Currency', id: 'LIST' }, { type: 'Currency', id: 'ACTIVE' }],
    }),

    updateCurrency: builder.mutation<
      ApiResponse<Currency>,
      { id: string; data: Partial<CreateCurrencyDto> }
    >({
      query: ({ id, data }) => ({
        url: `/i18n/currencies/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Currency', id },
        { type: 'Currency', id: 'LIST' },
        { type: 'Currency', id: 'ACTIVE' },
      ],
    }),

    deleteCurrency: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/i18n/currencies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Currency', id: 'LIST' }, { type: 'Currency', id: 'ACTIVE' }],
    }),

    setDefaultCurrency: builder.mutation<ApiResponse<Currency>, string>({
      query: (id) => ({
        url: `/i18n/currencies/${id}/set-default`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Currency', id: 'LIST' }],
    }),

    // ── Translations ──
    getTranslations: builder.query<
      ApiResponse<Translation[]>,
      { languageId?: string; entityType?: string; entityId?: string }
    >({
      query: (params) => ({
        url: '/i18n/translations',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Translation' as const, id })),
              { type: 'Translation', id: 'LIST' },
            ]
          : [{ type: 'Translation', id: 'LIST' }],
    }),

    createTranslation: builder.mutation<ApiResponse<Translation>, CreateTranslationDto>({
      query: (data) => ({
        url: '/i18n/translations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Translation', id: 'LIST' }],
    }),

    updateTranslation: builder.mutation<
      ApiResponse<Translation>,
      { id: string; data: Partial<CreateTranslationDto> }
    >({
      query: ({ id, data }) => ({
        url: `/i18n/translations/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Translation', id },
        { type: 'Translation', id: 'LIST' },
      ],
    }),

    deleteTranslation: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/i18n/translations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Translation', id: 'LIST' }],
    }),

    upsertTranslation: builder.mutation<
      ApiResponse<Translation>,
      { languageId: string; entityType: string; entityId: string; field: string; value: string }
    >({
      query: (data) => ({
        url: '/i18n/translations/upsert',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Translation', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetLanguagesQuery,
  useGetActiveLanguagesQuery,
  useGetLanguageByCodeQuery,
  useGetLanguageByIdQuery,
  useCreateLanguageMutation,
  useUpdateLanguageMutation,
  useDeleteLanguageMutation,
  useSetDefaultLanguageMutation,
  useGetCurrenciesQuery,
  useGetActiveCurrenciesQuery,
  useGetCurrencyByCodeQuery,
  useGetCurrencyByIdQuery,
  useConvertCurrencyQuery,
  useGetCurrencyRateHistoryQuery,
  useCreateCurrencyMutation,
  useUpdateCurrencyMutation,
  useDeleteCurrencyMutation,
  useSetDefaultCurrencyMutation,
  useGetTranslationsQuery,
  useCreateTranslationMutation,
  useUpdateTranslationMutation,
  useDeleteTranslationMutation,
  useUpsertTranslationMutation,
} = i18nApi;
