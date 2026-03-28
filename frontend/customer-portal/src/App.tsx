import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'sonner'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/store/auth.store'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { PageLoader } from '@/components/common/LoadingSpinner'

// Layouts
import { MainLayout } from '@/components/layout/MainLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { CheckoutLayout } from '@/components/layout/CheckoutLayout'
import { AccountLayout } from '@/components/layout/AccountLayout'

// Lazy-loaded pages
const HomePage = lazy(() => import('@/pages/HomePage'))
const ProductListingPage = lazy(() => import('@/pages/ProductListingPage'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))
const StorePage = lazy(() => import('@/pages/StorePage'))
const FlashSalePage = lazy(() => import('@/pages/FlashSalePage'))
const CartPage = lazy(() => import('@/pages/CartPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const OrderConfirmationPage = lazy(() => import('@/pages/OrderConfirmationPage'))

// Auth
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))

// Account
const ProfilePage = lazy(() => import('@/pages/account/ProfilePage'))
const OrdersPage = lazy(() => import('@/pages/account/OrdersPage'))
const OrderDetailPage = lazy(() => import('@/pages/account/OrderDetailPage'))
const AddressesPage = lazy(() => import('@/pages/account/AddressesPage'))
const WishlistPage = lazy(() => import('@/pages/account/WishlistPage'))
const NotificationsPage = lazy(() => import('@/pages/account/NotificationsPage'))
const ReviewsPage = lazy(() => import('@/pages/account/ReviewsPage'))
const ReturnsPage = lazy(() => import('@/pages/account/ReturnsPage'))
const SettingsPage = lazy(() => import('@/pages/account/SettingsPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  const loc = useLocation()
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} state={{ from: loc.pathname }} replace />
  return <>{children}</>
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to={ROUTES.HOME} replace />
  return <>{children}</>
}

export default function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Main layout */}
                <Route element={<MainLayout />}>
                  <Route path={ROUTES.HOME} element={<HomePage />} />
                  <Route path={ROUTES.PRODUCTS} element={<ProductListingPage />} />
                  <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetailPage />} />
                  <Route path={ROUTES.SEARCH} element={<ProductListingPage />} />
                  <Route path={ROUTES.CATEGORY} element={<ProductListingPage />} />
                  <Route path={ROUTES.BRAND} element={<ProductListingPage />} />
                  <Route path={ROUTES.STORE} element={<StorePage />} />
                  <Route path={ROUTES.FLASH_SALES} element={<FlashSalePage />} />
                  <Route path={ROUTES.CART} element={<CartPage />} />
                </Route>

                {/* Auth layout */}
                <Route element={<GuestRoute><AuthLayout /></GuestRoute>}>
                  <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                  <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
                  <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
                  <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
                </Route>

                {/* Checkout layout (protected) */}
                <Route element={<ProtectedRoute><CheckoutLayout /></ProtectedRoute>}>
                  <Route path={ROUTES.CHECKOUT} element={<CheckoutPage />} />
                  <Route path={ROUTES.ORDER_CONFIRMATION} element={<OrderConfirmationPage />} />
                </Route>

                {/* Account layout (protected) */}
                <Route element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}>
                  <Route path={ROUTES.ACCOUNT} element={<Navigate to={ROUTES.ACCOUNT_PROFILE} replace />} />
                  <Route path={ROUTES.ACCOUNT_PROFILE} element={<ProfilePage />} />
                  <Route path={ROUTES.ACCOUNT_ORDERS} element={<OrdersPage />} />
                  <Route path={ROUTES.ACCOUNT_ORDER_DETAIL} element={<OrderDetailPage />} />
                  <Route path={ROUTES.ACCOUNT_ADDRESSES} element={<AddressesPage />} />
                  <Route path={ROUTES.ACCOUNT_WISHLIST} element={<WishlistPage />} />
                  <Route path={ROUTES.ACCOUNT_NOTIFICATIONS} element={<NotificationsPage />} />
                  <Route path={ROUTES.ACCOUNT_REVIEWS} element={<ReviewsPage />} />
                  <Route path={ROUTES.ACCOUNT_RETURNS} element={<ReturnsPage />} />
                  <Route path={ROUTES.ACCOUNT_SETTINGS} element={<SettingsPage />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster position="top-right" richColors closeButton />
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  )
}
