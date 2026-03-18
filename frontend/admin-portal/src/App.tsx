import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ErrorBoundary } from '@/components/shared/error-boundary'
import { LoadingPage } from '@/components/shared/loading'
import { AppLayout } from '@/components/layout/app-layout'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { useAuthStore } from '@/store/auth.store'
import { useSessionTimeout } from '@/hooks/useSessionTimeout'
import { shouldRetry } from '@/lib/api-error'

const LoginPage = lazy(() => import('@/pages/login'))
const DashboardPage = lazy(() => import('@/pages/dashboard'))
const UsersPage = lazy(() => import('@/pages/users'))
const RolesPage = lazy(() => import('@/pages/roles'))
const PermissionsPage = lazy(() => import('@/pages/permissions'))
const RolePermissionsPage = lazy(() => import('@/pages/role-permissions'))
const CategoriesPage = lazy(() => import('@/pages/categories'))
const BrandsPage = lazy(() => import('@/pages/brands'))
const SellersPage = lazy(() => import('@/pages/sellers'))
const StoresPage = lazy(() => import('@/pages/stores'))
const ProductsPage = lazy(() => import('@/pages/products'))
const OrdersPage = lazy(() => import('@/pages/orders'))
const PaymentsPage = lazy(() => import('@/pages/payments'))
const CouponsPage = lazy(() => import('@/pages/coupons'))
const FlashSalesPage = lazy(() => import('@/pages/flash-sales'))
const InventoryPage = lazy(() => import('@/pages/inventory'))
const ShippingPage = lazy(() => import('@/pages/shipping'))
const SubscriptionsPage = lazy(() => import('@/pages/subscriptions'))
const ReturnsPage = lazy(() => import('@/pages/returns'))
const ReviewsPage = lazy(() => import('@/pages/reviews'))
const NotificationsPage = lazy(() => import('@/pages/notifications'))
const ChatPage = lazy(() => import('@/pages/chat'))
const AuditPage = lazy(() => import('@/pages/audit'))
const SettingsPage = lazy(() => import('@/pages/settings'))
const NotFoundPage = lazy(() => import('@/pages/not-found'))
const UnauthorizedPage = lazy(() => import('@/pages/unauthorized'))
const ForbiddenPage = lazy(() => import('@/pages/forbidden'))
const ForgotPasswordPage = lazy(() => import('@/pages/forgot-password'))
const ResetPasswordPage = lazy(() => import('@/pages/reset-password'))
const SearchAnalyticsPage = lazy(() => import('@/pages/search-analytics'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: shouldRetry,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

/** Role-based route guard. Allows access if user has any of the specified roles. */
function RbacRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const user = useAuthStore((s) => s.user)
  const userRole = user?.role ?? user?.roles?.[0]?.role?.name
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/forbidden" replace />
  }
  return <>{children}</>
}

const ADMIN_ROLES = ['super_admin', 'admin']
const MANAGEMENT_ROLES = ['super_admin', 'admin', 'support_agent']

export default function App() {
  useSessionTimeout()

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <ErrorBoundary>
            <BrowserRouter>
              <Suspense fallback={<LoadingPage />}>
                <Routes>
                  <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                  <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
                  <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
                  <Route path="/unauthorized" element={<UnauthorizedPage />} />
                  <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route index element={<DashboardPage />} />
                    <Route path="forbidden" element={<ForbiddenPage />} />
                    <Route path="users" element={<RbacRoute allowedRoles={ADMIN_ROLES}><UsersPage /></RbacRoute>} />
                    <Route path="roles" element={<RbacRoute allowedRoles={ADMIN_ROLES}><RolesPage /></RbacRoute>} />
                    <Route path="permissions" element={<RbacRoute allowedRoles={ADMIN_ROLES}><PermissionsPage /></RbacRoute>} />                      <Route path="role-permissions" element={<RbacRoute allowedRoles={ADMIN_ROLES}><RolePermissionsPage /></RbacRoute>} />                  <Route path="categories" element={<CategoriesPage />} />
                    <Route path="brands" element={<BrandsPage />} />
                    <Route path="sellers" element={<SellersPage />} />
                    <Route path="stores" element={<StoresPage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="payments" element={<RbacRoute allowedRoles={ADMIN_ROLES}><PaymentsPage /></RbacRoute>} />
                    <Route path="coupons" element={<CouponsPage />} />
                    <Route path="flash-sales" element={<FlashSalesPage />} />
                    <Route path="inventory" element={<InventoryPage />} />
                    <Route path="shipping" element={<ShippingPage />} />
                    <Route path="subscriptions" element={<SubscriptionsPage />} />
                    <Route path="returns" element={<RbacRoute allowedRoles={MANAGEMENT_ROLES}><ReturnsPage /></RbacRoute>} />
                    <Route path="reviews" element={<ReviewsPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="chat" element={<ChatPage />} />
                    <Route path="audit" element={<RbacRoute allowedRoles={ADMIN_ROLES}><AuditPage /></RbacRoute>} />
                    <Route path="search-analytics" element={<RbacRoute allowedRoles={ADMIN_ROLES}><SearchAnalyticsPage /></RbacRoute>} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
            <Toaster position="top-right" richColors closeButton />
          </ErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
