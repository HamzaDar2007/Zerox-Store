import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { useAuthStore } from '@/store/auth.store'
import { useSessionTimeout } from '@/hooks/useSessionTimeout'
import { AppLayout } from '@/components/layout/app-layout'
import { AuthLayout } from '@/components/layout/auth-layout'
import { LoadingPage as Loading } from '@/components/shared/loading'
import { ErrorBoundary } from '@/components/shared/error-boundary'
import { shouldRetry } from '@/lib/api-error'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: shouldRetry,
    },
  },
})

// Auth pages
const Login = lazy(() => import('@/pages/login'))
const Register = lazy(() => import('@/pages/register'))
const ForgotPassword = lazy(() => import('@/pages/forgot-password'))
const ResetPassword = lazy(() => import('@/pages/reset-password'))

// Main pages
const Dashboard = lazy(() => import('@/pages/dashboard'))
const Products = lazy(() => import('@/pages/products'))
const ProductDetail = lazy(() => import('@/pages/product-detail'))
const Inventory = lazy(() => import('@/pages/inventory'))
const Orders = lazy(() => import('@/pages/orders'))
const OrderDetail = lazy(() => import('@/pages/order-detail'))
const Returns = lazy(() => import('@/pages/returns'))
const Earnings = lazy(() => import('@/pages/earnings'))
const Reviews = lazy(() => import('@/pages/reviews'))
const Chat = lazy(() => import('@/pages/chat'))
const Notifications = lazy(() => import('@/pages/notifications'))
const StoreSettings = lazy(() => import('@/pages/store-settings'))
const AccountSettings = lazy(() => import('@/pages/account-settings'))
const Onboarding = lazy(() => import('@/pages/onboarding'))
const Analytics = lazy(() => import('@/pages/analytics'))
const Subscriptions = lazy(() => import('@/pages/subscriptions'))

// Error pages
const NotFound = lazy(() => import('@/pages/not-found'))
const Unauthorized = lazy(() => import('@/pages/unauthorized'))

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function SellerGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const role = user?.role ?? user?.roles?.[0]?.role?.name ?? user?.userRoles?.[0]?.role?.name
  const allowed = role === 'seller' || role === 'admin' || role === 'super_admin'
  if (!allowed) {
    return <Navigate to="/unauthorized" replace />
  }
  return <>{children}</>
}

function AppShell() {
  useSessionTimeout()
  return (
    <ProtectedRoute>
      <SellerGuard>
        <AppLayout />
      </SellerGuard>
    </ProtectedRoute>
  )
}

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* Auth routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Route>

                {/* Onboarding */}
                <Route
                  path="/onboarding"
                  element={
                    <ProtectedRoute>
                      <SellerGuard>
                        <Onboarding />
                      </SellerGuard>
                    </ProtectedRoute>
                  }
                />

                {/* Main app */}
                <Route element={<AppShell />}>
                  <Route index element={<Dashboard />} />
                  <Route path="products" element={<Products />} />
                  <Route path="products/:id" element={<ProductDetail />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="orders/:id" element={<OrderDetail />} />
                  <Route path="returns" element={<Returns />} />
                  <Route path="earnings" element={<Earnings />} />
                  <Route path="reviews" element={<Reviews />} />
                  <Route path="chat" element={<Chat />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="subscriptions" element={<Subscriptions />} />
                  <Route path="settings/store" element={<StoreSettings />} />
                  <Route path="settings/account" element={<AccountSettings />} />
                  <Route path="analytics" element={<Analytics />} />
                </Route>

                {/* Error routes */}
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
