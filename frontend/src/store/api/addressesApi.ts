import { baseApi } from '../baseApi';
import type { ApiResponse, Address, CreateAddressDto } from '@/common/types';

export const addressesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyAddresses: builder.query<ApiResponse<Address[]>, void>({
      query: () => '/users/me/addresses',
      providesTags: [{ type: 'User', id: 'ADDRESSES' }],
    }),

    createAddress: builder.mutation<ApiResponse<Address>, CreateAddressDto>({
      query: (data) => ({
        url: '/users/me/addresses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'User', id: 'ADDRESSES' }],
    }),

    updateAddress: builder.mutation<ApiResponse<Address>, { id: string; data: Partial<CreateAddressDto> }>({
      query: ({ id, data }) => ({
        url: `/users/me/addresses/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: [{ type: 'User', id: 'ADDRESSES' }],
    }),

    deleteAddress: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/users/me/addresses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'User', id: 'ADDRESSES' }],
    }),
  }),
});

export const {
  useGetMyAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = addressesApi;
