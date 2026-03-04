import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  PaginatedResponse,
  Page,
  Banner,
  CreatePageDto,
  CreateBannerDto,
} from '@/common/types';

interface PageQueryParams {
  page?: number;
  limit?: number;
  isPublished?: boolean;
}

interface BannerQueryParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  position?: string;
}

export const cmsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Pages ──
    getPages: builder.query<ApiResponse<PaginatedResponse<Page>>, PageQueryParams>({
      query: (params) => ({
        url: '/cms/pages',
        params,
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'Page' as const, id })),
              { type: 'Page', id: 'LIST' },
            ]
          : [{ type: 'Page', id: 'LIST' }],
    }),

    getPublishedPages: builder.query<
      ApiResponse<PaginatedResponse<Page>>,
      { page?: number; limit?: number }
    >({
      query: (params) => ({
        url: '/cms/pages/published',
        params,
      }),
      providesTags: [{ type: 'Page', id: 'PUBLISHED' }],
    }),

    getPageBySlug: builder.query<ApiResponse<Page>, string>({
      query: (slug) => `/cms/pages/slug/${slug}`,
      providesTags: (result) =>
        result?.data ? [{ type: 'Page', id: result.data.id }] : [],
    }),

    getPageById: builder.query<ApiResponse<Page>, string>({
      query: (id) => `/cms/pages/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Page', id }],
    }),

    createPage: builder.mutation<ApiResponse<Page>, CreatePageDto>({
      query: (data) => ({
        url: '/cms/pages',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Page', id: 'LIST' }],
    }),

    updatePage: builder.mutation<
      ApiResponse<Page>,
      { id: string; data: Partial<CreatePageDto> }
    >({
      query: ({ id, data }) => ({
        url: `/cms/pages/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Page', id },
        { type: 'Page', id: 'LIST' },
        { type: 'Page', id: 'PUBLISHED' },
      ],
    }),

    deletePage: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/cms/pages/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Page', id: 'LIST' }, { type: 'Page', id: 'PUBLISHED' }],
    }),

    publishPage: builder.mutation<ApiResponse<Page>, string>({
      query: (id) => ({
        url: `/cms/pages/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Page', id },
        { type: 'Page', id: 'LIST' },
        { type: 'Page', id: 'PUBLISHED' },
      ],
    }),

    unpublishPage: builder.mutation<ApiResponse<Page>, string>({
      query: (id) => ({
        url: `/cms/pages/${id}/unpublish`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Page', id },
        { type: 'Page', id: 'LIST' },
        { type: 'Page', id: 'PUBLISHED' },
      ],
    }),

    // ── Banners ──
    getBanners: builder.query<ApiResponse<PaginatedResponse<Banner>>, BannerQueryParams>({
      query: (params) => ({
        url: '/cms/banners',
        params,
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'Banner' as const, id })),
              { type: 'Banner', id: 'LIST' },
            ]
          : [{ type: 'Banner', id: 'LIST' }],
    }),

    getActiveBannersByPosition: builder.query<ApiResponse<Banner[]>, string>({
      query: (position) => `/cms/banners/active/${position}`,
      providesTags: [{ type: 'Banner', id: 'ACTIVE' }],
    }),

    getBannerById: builder.query<ApiResponse<Banner>, string>({
      query: (id) => `/cms/banners/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Banner', id }],
    }),

    createBanner: builder.mutation<ApiResponse<Banner>, CreateBannerDto>({
      query: (data) => ({
        url: '/cms/banners',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Banner', id: 'LIST' }],
    }),

    updateBanner: builder.mutation<
      ApiResponse<Banner>,
      { id: string; data: Partial<CreateBannerDto> }
    >({
      query: ({ id, data }) => ({
        url: `/cms/banners/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Banner', id },
        { type: 'Banner', id: 'LIST' },
        { type: 'Banner', id: 'ACTIVE' },
      ],
    }),

    deleteBanner: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/cms/banners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Banner', id: 'LIST' }, { type: 'Banner', id: 'ACTIVE' }],
    }),

    toggleBannerActive: builder.mutation<ApiResponse<Banner>, string>({
      query: (id) => ({
        url: `/cms/banners/${id}/toggle-active`,
        method: 'PATCH',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Banner', id },
        { type: 'Banner', id: 'LIST' },
        { type: 'Banner', id: 'ACTIVE' },
      ],
    }),
  }),
});

export const {
  useGetPagesQuery,
  useGetPublishedPagesQuery,
  useGetPageBySlugQuery,
  useGetPageByIdQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
  usePublishPageMutation,
  useUnpublishPageMutation,
  useGetBannersQuery,
  useGetActiveBannersByPositionQuery,
  useGetBannerByIdQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useToggleBannerActiveMutation,
} = cmsApi;
