import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  User,
} from '@/common/types';

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<ApiResponse<User>, void>({
      query: () => '/users/me',
      providesTags: ['Auth'],
    }),

    getUsers: builder.query<ApiResponse<PaginatedResponse<User>>, PaginationParams>({
      query: (params) => ({
        url: '/users',
        params,
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),

    getUserById: builder.query<ApiResponse<User>, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'User', id }],
    }),

    getUserPermissions: builder.query<ApiResponse<string[]>, string>({
      query: (id) => `/users/${id}/permissions`,
      providesTags: (_r, _e, id) => [{ type: 'User', id }],
    }),

    createUser: builder.mutation<ApiResponse<User>, { name: string; email: string; password: string; role?: string }>({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    updateUser: builder.mutation<ApiResponse<User>, { id: string; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
    }),

    deleteUser: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetUserPermissionsQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
