import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useAppDispatch,
  useAppSelector,
  setCredentials,
  logout as logoutAction,
} from '@/store';
import { useLoginMutation, useRegisterMutation, useLogoutMutation } from '@/store/api';
import type { LoginDto, RegisterDto, User, AuthResponse } from '@/common/types';
import { UserRole } from '@/common/types/enums';
import { STORAGE_KEYS, ROUTE_PREFIX } from '@/lib/constants';
import { toast } from 'sonner';

export function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, accessToken, refreshToken, isAuthenticated } = useAppSelector(
    (state) => state.auth,
  );

  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegistering }] = useRegisterMutation();
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  const login = useCallback(
    async (credentials: LoginDto) => {
      try {
        const result = await loginMutation(credentials).unwrap();
        const { user: loggedInUser, accessToken, refreshToken: rt } = result.data as AuthResponse;
        dispatch(
          setCredentials({
            user: loggedInUser,
            accessToken,
            refreshToken: rt,
          }),
        );
        toast.success(`Welcome back, ${loggedInUser.name}!`);
        // Navigate to appropriate portal based on role
        navigateToPortal(loggedInUser);
        return result;
      } catch (error: unknown) {
        const message =
          (error as { data?: { message?: string } })?.data?.message ||
          'Login failed. Please try again.';
        toast.error(message);
        throw error;
      }
    },
    [loginMutation, dispatch],
  );

  const register = useCallback(
    async (data: RegisterDto) => {
      try {
        const result = await registerMutation(data).unwrap();
        const { user: newUser, accessToken, refreshToken: rt } = result.data as AuthResponse;
        dispatch(
          setCredentials({
            user: newUser,
            accessToken,
            refreshToken: rt,
          }),
        );
        toast.success('Account created successfully!');
        navigateToPortal(newUser);
        return result;
      } catch (error: unknown) {
        const message =
          (error as { data?: { message?: string } })?.data?.message ||
          'Registration failed. Please try again.';
        toast.error(message);
        throw error;
      }
    },
    [registerMutation, dispatch],
  );

  const logout = useCallback(async () => {
    try {
      const rt = refreshToken || localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (rt) {
        await logoutMutation({ refreshToken: rt }).unwrap();
      }
    } catch {
      // Logout even if API call fails
    } finally {
      dispatch(logoutAction());
      navigate('/login', { replace: true });
      toast.success('Logged out successfully');
    }
  }, [logoutMutation, refreshToken, dispatch, navigate]);

  const navigateToPortal = useCallback(
    (u: User) => {
      switch (u.role) {
        case UserRole.SUPER_ADMIN:
          navigate(ROUTE_PREFIX.SUPER_ADMIN, { replace: true });
          break;
        case UserRole.ADMIN:
          navigate(ROUTE_PREFIX.ADMIN, { replace: true });
          break;
        case UserRole.SELLER:
          navigate(ROUTE_PREFIX.SELLER, { replace: true });
          break;
        default:
          navigate(ROUTE_PREFIX.CUSTOMER, { replace: true });
      }
    },
    [navigate],
  );

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]) => {
      if (!user) return false;
      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(user.role);
    },
    [user],
  );

  const isAdmin = useMemo(
    () => hasRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
    [hasRole],
  );

  const isSeller = useMemo(() => hasRole(UserRole.SELLER), [hasRole]);
  const isCustomer = useMemo(() => hasRole(UserRole.CUSTOMER), [hasRole]);
  const isSuperAdmin = useMemo(() => hasRole(UserRole.SUPER_ADMIN), [hasRole]);

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isLoggingIn,
    isRegistering,
    isLoggingOut,
    login,
    register,
    logout,
    hasRole,
    isAdmin,
    isSeller,
    isCustomer,
    isSuperAdmin,
    navigateToPortal,
  };
}
