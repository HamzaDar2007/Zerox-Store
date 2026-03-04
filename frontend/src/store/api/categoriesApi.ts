import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  Category,
  Brand,
  Attribute,
  CreateCategoryDto,
  CreateBrandDto,
  CreateAttributeDto,
} from '@/common/types';

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Categories ──
    getCategories: builder.query<ApiResponse<Category[]>, void>({
      query: () => '/categories',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Category' as const, id })),
              { type: 'Category', id: 'LIST' },
            ]
          : [{ type: 'Category', id: 'LIST' }],
    }),

    getRootCategories: builder.query<ApiResponse<Category[]>, void>({
      query: () => '/categories/root',
      providesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    getCategoryById: builder.query<ApiResponse<Category>, string>({
      query: (id) => `/categories/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Category', id }],
    }),

    getCategoryBySlug: builder.query<ApiResponse<Category>, string>({
      query: (slug) => `/categories/slug/${slug}`,
      providesTags: (result) =>
        result?.data ? [{ type: 'Category', id: result.data.id }] : [],
    }),

    createCategory: builder.mutation<ApiResponse<Category>, CreateCategoryDto>({
      query: (data) => ({
        url: '/categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    updateCategory: builder.mutation<
      ApiResponse<Category>,
      { id: string; data: Partial<CreateCategoryDto> }
    >({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),

    deleteCategory: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    assignBrandToCategory: builder.mutation<
      ApiResponse<void>,
      { categoryId: string; brandId: string }
    >({
      query: ({ categoryId, brandId }) => ({
        url: `/categories/${categoryId}/brands/${brandId}`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, { categoryId }) => [{ type: 'Category', id: categoryId }],
    }),

    removeBrandFromCategory: builder.mutation<
      ApiResponse<void>,
      { categoryId: string; brandId: string }
    >({
      query: ({ categoryId, brandId }) => ({
        url: `/categories/${categoryId}/brands/${brandId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { categoryId }) => [{ type: 'Category', id: categoryId }],
    }),

    // ── Brands ──
    getBrands: builder.query<ApiResponse<Brand[]>, void>({
      query: () => '/brands',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Brand' as const, id })),
              { type: 'Brand', id: 'LIST' },
            ]
          : [{ type: 'Brand', id: 'LIST' }],
    }),

    getBrandById: builder.query<ApiResponse<Brand>, string>({
      query: (id) => `/brands/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Brand', id }],
    }),

    getBrandBySlug: builder.query<ApiResponse<Brand>, string>({
      query: (slug) => `/brands/slug/${slug}`,
      providesTags: (result) =>
        result?.data ? [{ type: 'Brand', id: result.data.id }] : [],
    }),

    createBrand: builder.mutation<ApiResponse<Brand>, CreateBrandDto>({
      query: (data) => ({
        url: '/brands',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Brand', id: 'LIST' }],
    }),

    updateBrand: builder.mutation<
      ApiResponse<Brand>,
      { id: string; data: Partial<CreateBrandDto> }
    >({
      query: ({ id, data }) => ({
        url: `/brands/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Brand', id },
        { type: 'Brand', id: 'LIST' },
      ],
    }),

    deleteBrand: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/brands/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Brand', id: 'LIST' }],
    }),

    // ── Attributes ──
    getAttributes: builder.query<ApiResponse<Attribute[]>, void>({
      query: () => '/attributes',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Attribute' as const, id })),
              { type: 'Attribute', id: 'LIST' },
            ]
          : [{ type: 'Attribute', id: 'LIST' }],
    }),

    getAttributeById: builder.query<ApiResponse<Attribute>, string>({
      query: (id) => `/attributes/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Attribute', id }],
    }),

    createAttribute: builder.mutation<ApiResponse<Attribute>, CreateAttributeDto>({
      query: (data) => ({
        url: '/attributes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Attribute', id: 'LIST' }],
    }),

    updateAttribute: builder.mutation<
      ApiResponse<Attribute>,
      { id: string; data: Partial<CreateAttributeDto> }
    >({
      query: ({ id, data }) => ({
        url: `/attributes/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Attribute', id },
        { type: 'Attribute', id: 'LIST' },
      ],
    }),

    deleteAttribute: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/attributes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Attribute', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetRootCategoriesQuery,
  useGetCategoryByIdQuery,
  useGetCategoryBySlugQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useAssignBrandToCategoryMutation,
  useRemoveBrandFromCategoryMutation,
  useGetBrandsQuery,
  useGetBrandByIdQuery,
  useGetBrandBySlugQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useGetAttributesQuery,
  useGetAttributeByIdQuery,
  useCreateAttributeMutation,
  useUpdateAttributeMutation,
  useDeleteAttributeMutation,
} = categoriesApi;
