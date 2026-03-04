import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  PaginatedResponse,
  SeoMetadata,
  UrlRedirect,
  CreateSeoMetadataDto,
  CreateUrlRedirectDto,
} from '@/common/types';

interface SeoMetadataQueryParams {
  page?: number;
  limit?: number;
  entityType?: string;
}

interface UrlRedirectQueryParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
}

export const seoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── SEO Metadata ──
    getSeoMetadata: builder.query<
      ApiResponse<PaginatedResponse<SeoMetadata>>,
      SeoMetadataQueryParams
    >({
      query: (params) => ({
        url: '/seo/metadata',
        params,
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'SeoMetadata' as const, id })),
              { type: 'SeoMetadata', id: 'LIST' },
            ]
          : [{ type: 'SeoMetadata', id: 'LIST' }],
    }),

    getSeoMetadataById: builder.query<ApiResponse<SeoMetadata>, string>({
      query: (id) => `/seo/metadata/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'SeoMetadata', id }],
    }),

    getSeoMetadataByEntity: builder.query<
      ApiResponse<SeoMetadata>,
      { entityType: string; entityId: string }
    >({
      query: ({ entityType, entityId }) =>
        `/seo/metadata/entity/${entityType}/${entityId}`,
    }),

    createSeoMetadata: builder.mutation<ApiResponse<SeoMetadata>, CreateSeoMetadataDto>({
      query: (data) => ({
        url: '/seo/metadata',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'SeoMetadata', id: 'LIST' }],
    }),

    updateSeoMetadata: builder.mutation<
      ApiResponse<SeoMetadata>,
      { id: string; data: Partial<CreateSeoMetadataDto> }
    >({
      query: ({ id, data }) => ({
        url: `/seo/metadata/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'SeoMetadata', id },
        { type: 'SeoMetadata', id: 'LIST' },
      ],
    }),

    deleteSeoMetadata: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/seo/metadata/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'SeoMetadata', id: 'LIST' }],
    }),

    upsertSeoMetadata: builder.mutation<
      ApiResponse<SeoMetadata>,
      { entityType: string; entityId: string; data: Partial<CreateSeoMetadataDto> }
    >({
      query: ({ entityType, entityId, data }) => ({
        url: `/seo/metadata/upsert/${entityType}/${entityId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'SeoMetadata', id: 'LIST' }],
    }),

    // ── URL Redirects ──
    getUrlRedirects: builder.query<
      ApiResponse<PaginatedResponse<UrlRedirect>>,
      UrlRedirectQueryParams
    >({
      query: (params) => ({
        url: '/seo/redirects',
        params,
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'UrlRedirect' as const, id })),
              { type: 'UrlRedirect', id: 'LIST' },
            ]
          : [{ type: 'UrlRedirect', id: 'LIST' }],
    }),

    getUrlRedirectById: builder.query<ApiResponse<UrlRedirect>, string>({
      query: (id) => `/seo/redirects/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'UrlRedirect', id }],
    }),

    createUrlRedirect: builder.mutation<ApiResponse<UrlRedirect>, CreateUrlRedirectDto>({
      query: (data) => ({
        url: '/seo/redirects',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'UrlRedirect', id: 'LIST' }],
    }),

    bulkCreateUrlRedirects: builder.mutation<
      ApiResponse<UrlRedirect[]>,
      CreateUrlRedirectDto[]
    >({
      query: (data) => ({
        url: '/seo/redirects/bulk',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'UrlRedirect', id: 'LIST' }],
    }),

    updateUrlRedirect: builder.mutation<
      ApiResponse<UrlRedirect>,
      { id: string; data: Partial<CreateUrlRedirectDto> }
    >({
      query: ({ id, data }) => ({
        url: `/seo/redirects/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'UrlRedirect', id },
        { type: 'UrlRedirect', id: 'LIST' },
      ],
    }),

    deleteUrlRedirect: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/seo/redirects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'UrlRedirect', id: 'LIST' }],
    }),

    toggleUrlRedirectActive: builder.mutation<ApiResponse<UrlRedirect>, string>({
      query: (id) => ({
        url: `/seo/redirects/${id}/toggle-active`,
        method: 'PATCH',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'UrlRedirect', id },
        { type: 'UrlRedirect', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetSeoMetadataQuery,
  useGetSeoMetadataByIdQuery,
  useGetSeoMetadataByEntityQuery,
  useCreateSeoMetadataMutation,
  useUpdateSeoMetadataMutation,
  useDeleteSeoMetadataMutation,
  useUpsertSeoMetadataMutation,
  useGetUrlRedirectsQuery,
  useGetUrlRedirectByIdQuery,
  useCreateUrlRedirectMutation,
  useBulkCreateUrlRedirectsMutation,
  useUpdateUrlRedirectMutation,
  useDeleteUrlRedirectMutation,
  useToggleUrlRedirectActiveMutation,
} = seoApi;
