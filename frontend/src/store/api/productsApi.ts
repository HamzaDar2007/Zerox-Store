import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  PaginatedResponse,
  Product,
  ProductVariant,
  ProductImage,
  ProductQuestion,
  ProductAnswer,
  PriceHistory,
  CreateProductDto,
  CreateProductVariantDto,
  CreateProductImageDto,
} from '@/common/types';
import type { ProductStatus } from '@/common/types/enums';

interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  sellerId?: string;
  status?: ProductStatus;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ApiResponse<PaginatedResponse<Product>>, ProductQueryParams>({
      query: (params) => ({
        url: '/products',
        params,
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'Product' as const, id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    getProductById: builder.query<ApiResponse<Product>, string>({
      query: (id) => `/products/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Product', id }],
    }),

    getProductBySlug: builder.query<ApiResponse<Product>, string>({
      query: (slug) => `/products/slug/${slug}`,
      providesTags: (result) =>
        result?.data ? [{ type: 'Product', id: result.data.id }] : [],
    }),

    createProduct: builder.mutation<ApiResponse<Product>, CreateProductDto>({
      query: (data) => ({
        url: '/products',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    updateProduct: builder.mutation<
      ApiResponse<Product>,
      { id: string; data: Partial<CreateProductDto> }
    >({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    deleteProduct: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    updateProductStatus: builder.mutation<
      ApiResponse<Product>,
      { id: string; status: ProductStatus }
    >({
      query: ({ id, status }) => ({
        url: `/products/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    // ── Variants ──
    getProductVariants: builder.query<ApiResponse<ProductVariant[]>, string>({
      query: (productId) => `/products/${productId}/variants`,
      providesTags: (_r, _e, productId) => [{ type: 'ProductVariant', id: productId }],
    }),

    createVariant: builder.mutation<
      ApiResponse<ProductVariant>,
      { productId: string; data: CreateProductVariantDto }
    >({
      query: ({ productId, data }) => ({
        url: `/products/${productId}/variants`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_r, _e, { productId }) => [
        { type: 'ProductVariant', id: productId },
        { type: 'Product', id: productId },
      ],
    }),

    updateVariant: builder.mutation<
      ApiResponse<ProductVariant>,
      { id: string; data: Partial<CreateProductVariantDto>; productId?: string }
    >({
      query: ({ id, data }) => ({
        url: `/products/variants/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { productId }) =>
        productId
          ? [{ type: 'ProductVariant', id: productId }]
          : [{ type: 'ProductVariant', id: 'LIST' }],
    }),

    deleteVariant: builder.mutation<ApiResponse<void>, { id: string; productId?: string }>({
      query: ({ id }) => ({
        url: `/products/variants/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { productId }) =>
        productId
          ? [{ type: 'ProductVariant', id: productId }]
          : [{ type: 'ProductVariant', id: 'LIST' }],
    }),

    // ── Images ──
    addProductImage: builder.mutation<
      ApiResponse<ProductImage>,
      { productId: string; data: CreateProductImageDto }
    >({
      query: ({ productId, data }) => ({
        url: `/products/${productId}/images`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_r, _e, { productId }) => [
        { type: 'ProductImage', id: productId },
        { type: 'Product', id: productId },
      ],
    }),

    removeProductImage: builder.mutation<ApiResponse<void>, { id: string; productId?: string }>({
      query: ({ id }) => ({
        url: `/products/images/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { productId }) =>
        productId
          ? [{ type: 'ProductImage', id: productId }, { type: 'Product', id: productId }]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    // ── Questions & Answers ──
    getProductQuestions: builder.query<ApiResponse<ProductQuestion[]>, string>({
      query: (productId) => `/products/${productId}/questions`,
      providesTags: (_r, _e, productId) => [{ type: 'ProductQuestion', id: productId }],
    }),

    askQuestion: builder.mutation<
      ApiResponse<ProductQuestion>,
      { productId: string; question: string }
    >({
      query: ({ productId, question }) => ({
        url: `/products/${productId}/questions`,
        method: 'POST',
        body: { question },
      }),
      invalidatesTags: (_r, _e, { productId }) => [{ type: 'ProductQuestion', id: productId }],
    }),

    answerQuestion: builder.mutation<
      ApiResponse<ProductAnswer>,
      { questionId: string; answer: string; isSellerAnswer: boolean }
    >({
      query: ({ questionId, answer, isSellerAnswer }) => ({
        url: `/products/questions/${questionId}/answers`,
        method: 'POST',
        body: { answer, isSellerAnswer },
      }),
      invalidatesTags: [{ type: 'ProductQuestion', id: 'LIST' }],
    }),

    // ── Price History ──
    getProductPriceHistory: builder.query<ApiResponse<PriceHistory[]>, string>({
      query: (productId) => `/products/${productId}/price-history`,
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUpdateProductStatusMutation,
  useGetProductVariantsQuery,
  useCreateVariantMutation,
  useUpdateVariantMutation,
  useDeleteVariantMutation,
  useAddProductImageMutation,
  useRemoveProductImageMutation,
  useGetProductQuestionsQuery,
  useAskQuestionMutation,
  useAnswerQuestionMutation,
  useGetProductPriceHistoryQuery,
} = productsApi;
