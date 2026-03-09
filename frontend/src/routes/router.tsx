import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard, GuestGuard, RoleGuard } from '@/common/guards';
import { LoadingSpinner } from '@/common/components/LoadingSpinner';
import { UserRole } from '@/common/types/enums';

// ── Layouts (lazy — only load the portal the user actually visits) ──
const CustomerLayout = lazy(() => import('@/layouts/CustomerLayout'));
const SellerLayout = lazy(() => import('@/layouts/SellerLayout'));
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
const SuperAdminLayout = lazy(() => import('@/layouts/SuperAdminLayout'));

// ── Auth Pages (lazy — small, but no need to block initial paint) ──
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/features/auth/pages/VerifyEmailPage'));

// ── Lazy Pages — Customer ──
const HomePage = lazy(() => import('@/features/customer/pages/HomePage'));
const ProductListPage = lazy(() => import('@/features/customer/pages/ProductListPage'));
const ProductDetailPage = lazy(() => import('@/features/customer/pages/ProductDetailPage'));
const CategoriesPage = lazy(() => import('@/features/customer/pages/CategoriesPage'));
const CartPage = lazy(() => import('@/features/customer/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/features/customer/pages/CheckoutPage'));
const AccountLayout = lazy(() => import('@/features/customer/pages/AccountLayout'));
const ProfilePage = lazy(() => import('@/features/customer/pages/ProfilePage'));
const MyOrdersPage = lazy(() => import('@/features/customer/pages/MyOrdersPage'));
const OrderDetailPage = lazy(() => import('@/features/customer/pages/OrderDetailPage'));
const AddressesPage = lazy(() => import('@/features/customer/pages/AddressesPage'));
const WishlistPage = lazy(() => import('@/features/customer/pages/WishlistPage'));
const CustomerNotificationsPage = lazy(() => import('@/features/customer/pages/CustomerNotificationsPage'));
const CustomerTicketsPage = lazy(() => import('@/features/customer/pages/CustomerTicketsPage'));
const CustomerTicketDetailPage = lazy(() => import('@/features/customer/pages/CustomerTicketDetailPage'));
const CustomerReturnsPage = lazy(() => import('@/features/customer/pages/CustomerReturnsPage'));
const CustomerChatPage = lazy(() => import('@/features/customer/pages/CustomerChatPage'));
const CustomerDisputesPage = lazy(() => import('@/features/customer/pages/CustomerDisputesPage'));
const CustomerSubscriptionsPage = lazy(() => import('@/features/customer/pages/CustomerSubscriptionsPage'));
const CustomerLoyaltyPage = lazy(() => import('@/features/customer/pages/CustomerLoyaltyPage'));
const CustomerPaymentMethodsPage = lazy(() => import('@/features/customer/pages/CustomerPaymentMethodsPage'));
const MyReviewsPage = lazy(() => import('@/features/customer/pages/MyReviewsPage'));
const ComparisonPage = lazy(() => import('@/features/customer/pages/ComparisonPage'));
const BundlesListPage = lazy(() => import('@/features/customer/pages/BundlesListPage'));
const ChangePasswordPage = lazy(() => import('@/features/customer/pages/ChangePasswordPage'));
const OrderConfirmationPage = lazy(() => import('@/features/customer/pages/OrderConfirmationPage'));
const BundleDetailPage = lazy(() => import('@/features/customer/pages/BundleDetailPage'));
const BrandPage = lazy(() => import('@/features/customer/pages/BrandPage'));

const NotFoundPage = lazy(() => import('@/features/misc/NotFoundPage'));

// ── Lazy Pages — Seller ──
const SellerDashboardPage = lazy(() => import('@/features/seller/pages/SellerDashboardPage'));
const SellerProductsPage = lazy(() => import('@/features/seller/pages/SellerProductsPage'));
const SellerProductFormPage = lazy(() => import('@/features/seller/pages/SellerProductFormPage'));
const SellerOrdersPage = lazy(() => import('@/features/seller/pages/SellerOrdersPage'));
const SellerAnalyticsPage = lazy(() => import('@/features/seller/pages/SellerAnalyticsPage'));
const SellerStoreSettingsPage = lazy(() => import('@/features/seller/pages/SellerStoreSettingsPage'));
const SellerInventoryPage = lazy(() => import('@/features/seller/pages/SellerInventoryPage'));
const SellerDisputesPage = lazy(() => import('@/features/seller/pages/SellerDisputesPage'));
const SellerBundlesPage = lazy(() => import('@/features/seller/pages/SellerBundlesPage'));
const SellerSubscriptionsPage = lazy(() => import('@/features/seller/pages/SellerSubscriptionsPage'));
const SellerWalletPage = lazy(() => import('@/features/seller/pages/SellerWalletPage'));
const SellerDocumentsPage = lazy(() => import('@/features/seller/pages/SellerDocumentsPage'));
const SellerShipmentsPage = lazy(() => import('@/features/seller/pages/SellerShipmentsPage'));
const SellerStockMovementsPage = lazy(() => import('@/features/seller/pages/SellerStockMovementsPage'));

// ── Lazy Pages — Admin ──
const AdminDashboardPage = lazy(() => import('@/features/admin/pages/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('@/features/admin/pages/AdminUsersPage'));
const AdminProductsPage = lazy(() => import('@/features/admin/pages/AdminProductsPage'));
const AdminCategoriesPage = lazy(() => import('@/features/admin/pages/AdminCategoriesPage'));
const AdminOrdersPage = lazy(() => import('@/features/admin/pages/AdminOrdersPage'));
const AdminSellersPage = lazy(() => import('@/features/admin/pages/AdminSellersPage'));
const AdminReviewsPage = lazy(() => import('@/features/admin/pages/AdminReviewsPage'));
const AdminTicketsPage = lazy(() => import('@/features/admin/pages/AdminTicketsPage'));
const AdminCMSPage = lazy(() => import('@/features/admin/pages/AdminCMSPage'));
const AdminRolesPage = lazy(() => import('@/features/admin/pages/AdminRolesPage'));
const AdminSettingsPage = lazy(() => import('@/features/admin/pages/AdminSettingsPage'));
const AdminNotificationsPage = lazy(() => import('@/features/admin/pages/AdminNotificationsPage'));
const AdminPaymentsPage = lazy(() => import('@/features/admin/pages/AdminPaymentsPage'));
const AdminShippingPage = lazy(() => import('@/features/admin/pages/AdminShippingPage'));
const AdminTaxPage = lazy(() => import('@/features/admin/pages/AdminTaxPage'));
const AdminMarketingPage = lazy(() => import('@/features/admin/pages/AdminMarketingPage'));
const AdminInventoryPage = lazy(() => import('@/features/admin/pages/AdminInventoryPage'));
const AdminDisputesPage = lazy(() => import('@/features/admin/pages/AdminDisputesPage'));
const AdminBundlesPage = lazy(() => import('@/features/admin/pages/AdminBundlesPage'));
const AdminAnalyticsPage = lazy(() => import('@/features/admin/pages/AdminAnalyticsPage'));
const AdminAttributesPage = lazy(() => import('@/features/admin/pages/AdminAttributesPage'));
const AdminWarehousesPage = lazy(() => import('@/features/admin/pages/AdminWarehousesPage'));

// ── Lazy Pages — Super Admin ──
const SuperAdminDashboardPage = lazy(() => import('@/features/super-admin/pages/SuperAdminDashboardPage'));
const SAI18nPage = lazy(() => import('@/features/super-admin/pages/SAI18nPage'));
const SASeoPage = lazy(() => import('@/features/super-admin/pages/SASeoPage'));
const SAFeatureFlagsPage = lazy(() => import('@/features/super-admin/pages/SAFeatureFlagsPage'));
const SAOperationsPage = lazy(() => import('@/features/super-admin/pages/SAOperationsPage'));
const SAAuditPage = lazy(() => import('@/features/super-admin/pages/SAAuditPage'));
const SASystemSettingsPage = lazy(() => import('@/features/super-admin/pages/SASystemSettingsPage'));
const SASubscriptionsPage = lazy(() => import('@/features/super-admin/pages/SASubscriptionsPage'));
const SALoyaltyPage = lazy(() => import('@/features/super-admin/pages/SALoyaltyPage'));
const SARolesPage = lazy(() => import('@/features/super-admin/pages/SARolesPage'));
const SAPermissionsPage = lazy(() => import('@/features/super-admin/pages/SAPermissionsPage'));
const SARoleAssignmentsPage = lazy(() => import('@/features/super-admin/pages/SARoleAssignmentsPage'));
const SAAnalyticsPage = lazy(() => import('@/features/super-admin/pages/SAAnalyticsPage'));
const SAImportExportPage = lazy(() => import('@/features/super-admin/pages/SAImportExportPage'));
const SASystemHealthPage = lazy(() => import('@/features/super-admin/pages/SASystemHealthPage'));

function SuspenseWrap({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen label="Loading..." />}>
      {children}
    </Suspense>
  );
}

export function AppRouter() {
  return (
    <Routes>
      {/* ═══════════════════════ Auth (Guest Only) ═══════════════════════ */}
      <Route
        path="/login"
        element={
          <GuestGuard>
            <SuspenseWrap><LoginPage /></SuspenseWrap>
          </GuestGuard>
        }
      />
      <Route
        path="/register"
        element={
          <GuestGuard>
            <SuspenseWrap><RegisterPage /></SuspenseWrap>
          </GuestGuard>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <GuestGuard>
            <SuspenseWrap><ForgotPasswordPage /></SuspenseWrap>
          </GuestGuard>
        }
      />
      <Route
        path="/reset-password"
        element={
          <GuestGuard>
            <SuspenseWrap><ResetPasswordPage /></SuspenseWrap>
          </GuestGuard>
        }
      />
      <Route
        path="/verify-email"
        element={
          <SuspenseWrap><VerifyEmailPage /></SuspenseWrap>
        }
      />

      {/* ═══════════════════ Customer Storefront (Public) ═══════════════ */}
      <Route element={<SuspenseWrap><CustomerLayout /></SuspenseWrap>}>
        <Route
          index
          element={
            <SuspenseWrap>
              <HomePage />
            </SuspenseWrap>
          }
        />
        <Route
          path="products"
          element={
            <SuspenseWrap>
              <ProductListPage />
            </SuspenseWrap>
          }
        />
        <Route
          path="products/:slug"
          element={
            <SuspenseWrap>
              <ProductDetailPage />
            </SuspenseWrap>
          }
        />
        <Route
          path="categories"
          element={
            <SuspenseWrap>
              <CategoriesPage />
            </SuspenseWrap>
          }
        />
        <Route
          path="cart"
          element={
            <SuspenseWrap>
              <CartPage />
            </SuspenseWrap>
          }
        />
        <Route
          path="checkout"
          element={
            <AuthGuard>
              <SuspenseWrap>
                <CheckoutPage />
              </SuspenseWrap>
            </AuthGuard>
          }
        />

        {/* ── Customer Account (Auth Required) ── */}
        <Route
          path="account"
          element={
            <AuthGuard>
              <SuspenseWrap>
                <AccountLayout />
              </SuspenseWrap>
            </AuthGuard>
          }
        >
          <Route index element={<SuspenseWrap><ProfilePage /></SuspenseWrap>} />
          <Route path="orders" element={<SuspenseWrap><MyOrdersPage /></SuspenseWrap>} />
          <Route path="orders/:orderId" element={<SuspenseWrap><OrderDetailPage /></SuspenseWrap>} />
          <Route path="addresses" element={<SuspenseWrap><AddressesPage /></SuspenseWrap>} />
          <Route path="wishlist" element={<SuspenseWrap><WishlistPage /></SuspenseWrap>} />
          <Route path="notifications" element={<SuspenseWrap><CustomerNotificationsPage /></SuspenseWrap>} />
          <Route path="tickets" element={<SuspenseWrap><CustomerTicketsPage /></SuspenseWrap>} />
          <Route path="tickets/:ticketId" element={<SuspenseWrap><CustomerTicketDetailPage /></SuspenseWrap>} />
          <Route path="returns" element={<SuspenseWrap><CustomerReturnsPage /></SuspenseWrap>} />
          <Route path="chat" element={<SuspenseWrap><CustomerChatPage /></SuspenseWrap>} />
          <Route path="disputes" element={<SuspenseWrap><CustomerDisputesPage /></SuspenseWrap>} />
          <Route path="subscriptions" element={<SuspenseWrap><CustomerSubscriptionsPage /></SuspenseWrap>} />
          <Route path="loyalty" element={<SuspenseWrap><CustomerLoyaltyPage /></SuspenseWrap>} />
          <Route path="payment-methods" element={<SuspenseWrap><CustomerPaymentMethodsPage /></SuspenseWrap>} />
          <Route path="reviews" element={<SuspenseWrap><MyReviewsPage /></SuspenseWrap>} />
          <Route path="change-password" element={<SuspenseWrap><ChangePasswordPage /></SuspenseWrap>} />
        </Route>

        {/* Redirects for convenience URLs */}
        <Route path="wishlist" element={<Navigate to="/account/wishlist" replace />} />

        {/* Public storefront pages */}
        <Route path="compare" element={<SuspenseWrap><ComparisonPage /></SuspenseWrap>} />
        <Route path="bundles" element={<SuspenseWrap><BundlesListPage /></SuspenseWrap>} />
        <Route path="bundles/:bundleId" element={<SuspenseWrap><BundleDetailPage /></SuspenseWrap>} />
        <Route path="brands/:brandId" element={<SuspenseWrap><BrandPage /></SuspenseWrap>} />
        <Route path="order-confirmation/:orderId" element={<AuthGuard><SuspenseWrap><OrderConfirmationPage /></SuspenseWrap></AuthGuard>} />
      </Route>

      {/* ═══════════════════ Seller Portal (Auth + Seller) ═════════════ */}
      <Route
        path="/seller"
        element={
          <AuthGuard>
            <RoleGuard allowedRoles={[UserRole.SELLER, UserRole.SUPER_ADMIN]}>
              <SuspenseWrap><SellerLayout /></SuspenseWrap>
            </RoleGuard>
          </AuthGuard>
        }
      >
        <Route index element={<SuspenseWrap><SellerDashboardPage /></SuspenseWrap>} />
        <Route path="products" element={<SuspenseWrap><SellerProductsPage /></SuspenseWrap>} />
        <Route path="products/new" element={<SuspenseWrap><SellerProductFormPage /></SuspenseWrap>} />
        <Route path="products/:productId/edit" element={<SuspenseWrap><SellerProductFormPage /></SuspenseWrap>} />
        <Route path="orders" element={<SuspenseWrap><SellerOrdersPage /></SuspenseWrap>} />
        <Route path="analytics" element={<SuspenseWrap><SellerAnalyticsPage /></SuspenseWrap>} />
        <Route path="store" element={<SuspenseWrap><SellerStoreSettingsPage /></SuspenseWrap>} />
        <Route path="inventory" element={<SuspenseWrap><SellerInventoryPage /></SuspenseWrap>} />
        <Route path="disputes" element={<SuspenseWrap><SellerDisputesPage /></SuspenseWrap>} />
        <Route path="bundles" element={<SuspenseWrap><SellerBundlesPage /></SuspenseWrap>} />
        <Route path="subscriptions" element={<SuspenseWrap><SellerSubscriptionsPage /></SuspenseWrap>} />
        <Route path="wallet" element={<SuspenseWrap><SellerWalletPage /></SuspenseWrap>} />
        <Route path="documents" element={<SuspenseWrap><SellerDocumentsPage /></SuspenseWrap>} />
        <Route path="shipments" element={<SuspenseWrap><SellerShipmentsPage /></SuspenseWrap>} />
        <Route path="stock-movements" element={<SuspenseWrap><SellerStockMovementsPage /></SuspenseWrap>} />
      </Route>

      {/* ═══════════════════ Admin Portal (Auth + Admin) ═══════════════ */}
      <Route
        path="/admin"
        element={
          <AuthGuard>
            <RoleGuard
              allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}
              fallback="/"
            >
              <SuspenseWrap><AdminLayout /></SuspenseWrap>
            </RoleGuard>
          </AuthGuard>
        }
      >
        <Route
          index
          element={
            <SuspenseWrap>
              <AdminDashboardPage />
            </SuspenseWrap>
          }
        />
        <Route path="users" element={<SuspenseWrap><AdminUsersPage /></SuspenseWrap>} />
        <Route path="products" element={<SuspenseWrap><AdminProductsPage /></SuspenseWrap>} />
        <Route path="categories" element={<SuspenseWrap><AdminCategoriesPage /></SuspenseWrap>} />
        <Route path="orders" element={<SuspenseWrap><AdminOrdersPage /></SuspenseWrap>} />
        <Route path="sellers" element={<SuspenseWrap><AdminSellersPage /></SuspenseWrap>} />
        <Route path="reviews" element={<SuspenseWrap><AdminReviewsPage /></SuspenseWrap>} />
        <Route path="tickets" element={<SuspenseWrap><AdminTicketsPage /></SuspenseWrap>} />
        <Route path="cms" element={<SuspenseWrap><AdminCMSPage /></SuspenseWrap>} />
        <Route path="roles" element={<SuspenseWrap><AdminRolesPage /></SuspenseWrap>} />
        <Route path="settings" element={<SuspenseWrap><AdminSettingsPage /></SuspenseWrap>} />
        <Route path="notifications" element={<SuspenseWrap><AdminNotificationsPage /></SuspenseWrap>} />
        <Route path="payments" element={<SuspenseWrap><AdminPaymentsPage /></SuspenseWrap>} />
        <Route path="shipping" element={<SuspenseWrap><AdminShippingPage /></SuspenseWrap>} />
        <Route path="tax" element={<SuspenseWrap><AdminTaxPage /></SuspenseWrap>} />
        <Route path="marketing" element={<SuspenseWrap><AdminMarketingPage /></SuspenseWrap>} />
        <Route path="inventory" element={<SuspenseWrap><AdminInventoryPage /></SuspenseWrap>} />
        <Route path="disputes" element={<SuspenseWrap><AdminDisputesPage /></SuspenseWrap>} />
        <Route path="bundles" element={<SuspenseWrap><AdminBundlesPage /></SuspenseWrap>} />
        <Route path="analytics" element={<SuspenseWrap><AdminAnalyticsPage /></SuspenseWrap>} />
        <Route path="attributes" element={<SuspenseWrap><AdminAttributesPage /></SuspenseWrap>} />
        <Route path="warehouses" element={<SuspenseWrap><AdminWarehousesPage /></SuspenseWrap>} />
      </Route>

      {/* ═══════════════════ Super Admin Portal ════════════════════════ */}
      <Route
        path="/super-admin"
        element={
          <AuthGuard>
            <RoleGuard
              allowedRoles={[UserRole.SUPER_ADMIN]}
              fallback="/"
            >
              <SuspenseWrap><SuperAdminLayout /></SuspenseWrap>
            </RoleGuard>
          </AuthGuard>
        }
      >
        <Route
          index
          element={
            <SuspenseWrap>
              <SuperAdminDashboardPage />
            </SuspenseWrap>
          }
        />

        {/* ── Admin-equivalent pages (SA has full access) ── */}
        <Route path="users" element={<SuspenseWrap><AdminUsersPage /></SuspenseWrap>} />
        <Route path="sellers" element={<SuspenseWrap><AdminSellersPage /></SuspenseWrap>} />
        <Route path="products" element={<SuspenseWrap><AdminProductsPage /></SuspenseWrap>} />
        <Route path="categories" element={<SuspenseWrap><AdminCategoriesPage /></SuspenseWrap>} />
        <Route path="orders" element={<SuspenseWrap><AdminOrdersPage /></SuspenseWrap>} />
        <Route path="reviews" element={<SuspenseWrap><AdminReviewsPage /></SuspenseWrap>} />
        <Route path="tickets" element={<SuspenseWrap><AdminTicketsPage /></SuspenseWrap>} />
        <Route path="notifications" element={<SuspenseWrap><AdminNotificationsPage /></SuspenseWrap>} />
        <Route path="cms" element={<SuspenseWrap><AdminCMSPage /></SuspenseWrap>} />

        {/* ── SA-specific pages ── */}
        <Route path="i18n" element={<SuspenseWrap><SAI18nPage /></SuspenseWrap>} />
        <Route path="seo" element={<SuspenseWrap><SASeoPage /></SuspenseWrap>} />
        <Route path="feature-flags" element={<SuspenseWrap><SAFeatureFlagsPage /></SuspenseWrap>} />
        <Route path="operations" element={<SuspenseWrap><SAOperationsPage /></SuspenseWrap>} />
        <Route path="audit" element={<SuspenseWrap><SAAuditPage /></SuspenseWrap>} />
        <Route path="system" element={<SuspenseWrap><SASystemSettingsPage /></SuspenseWrap>} />
        <Route path="subscriptions" element={<SuspenseWrap><SASubscriptionsPage /></SuspenseWrap>} />
        <Route path="loyalty" element={<SuspenseWrap><SALoyaltyPage /></SuspenseWrap>} />
        <Route path="roles" element={<SuspenseWrap><SARolesPage /></SuspenseWrap>} />
        <Route path="permissions" element={<SuspenseWrap><SAPermissionsPage /></SuspenseWrap>} />
        <Route path="role-assignments" element={<SuspenseWrap><SARoleAssignmentsPage /></SuspenseWrap>} />
        <Route path="analytics" element={<SuspenseWrap><SAAnalyticsPage /></SuspenseWrap>} />
        <Route path="import-export" element={<SuspenseWrap><SAImportExportPage /></SuspenseWrap>} />
        <Route path="health" element={<SuspenseWrap><SASystemHealthPage /></SuspenseWrap>} />
      </Route>

      {/* ═══════════════════ Catch-all 404 ═════════════════════════════ */}
      <Route
        path="*"
        element={
          <SuspenseWrap>
            <NotFoundPage />
          </SuspenseWrap>
        }
      />
    </Routes>
  );
}
