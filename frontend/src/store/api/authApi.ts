import { baseApi } from '../baseApi';
import type {
  ApiResponse,
  LoginDto,
  RegisterDto,
  AuthTokens,
  AuthResponse,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from '@/common/types';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<AuthResponse>, LoginDto>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    register: builder.mutation<ApiResponse<AuthResponse>, RegisterDto>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),

    refreshToken: builder.mutation<
      ApiResponse<AuthTokens>,
      { refreshToken: string }
    >({
      query: (body) => ({
        url: '/auth/refresh',
        method: 'POST',
        body,
      }),
    }),

    logout: builder.mutation<ApiResponse<void>, { refreshToken: string }>({
      query: (body) => ({
        url: '/auth/logout',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    forgotPassword: builder.mutation<ApiResponse<void>, ForgotPasswordDto>({
      query: (data) => ({
        url: '/auth/password-forgot',
        method: 'POST',
        body: data,
      }),
    }),

    resetPassword: builder.mutation<ApiResponse<void>, ResetPasswordDto>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    changePassword: builder.mutation<ApiResponse<void>, ChangePasswordDto>({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: data,
      }),
    }),

    verifyEmail: builder.mutation<ApiResponse<void>, { token: string }>({
      query: (data) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body: data,
      }),
    }),

    resendVerification: builder.mutation<ApiResponse<void>, { email: string }>({
      query: (data) => ({
        url: '/auth/resend-verification',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
} = authApi;
