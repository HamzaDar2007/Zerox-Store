import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { baseApi } from './baseApi';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import cartReducer from './slices/cartSlice';

// Import all API slices so they register their endpoints with baseApi
import './api/authApi';
import './api/usersApi';
import './api/categoriesApi';
import './api/productsApi';
import './api/ordersApi';
import './api/cartApi';
import './api/paymentsApi';
import './api/sellersApi';
import './api/inventoryApi';
import './api/reviewsApi';
import './api/notificationsApi';
import './api/chatApi';
import './api/returnsApi';
import './api/ticketsApi';
import './api/disputesApi';
import './api/rolesApi';
import './api/shippingApi';
import './api/taxApi';
import './api/marketingApi';
import './api/loyaltyApi';
import './api/searchApi';
import './api/cmsApi';
import './api/auditApi';
import './api/bundlesApi';
import './api/i18nApi';
import './api/seoApi';
import './api/subscriptionsApi';
import './api/systemApi';
import './api/operationsApi';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    ui: uiReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore RTK Query internal actions for serializable check
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(baseApi.middleware),
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for use throughout the app
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Re-export slices and API
export { baseApi } from './baseApi';
export { setCredentials, updateUser, logout } from './slices/authSlice';
export {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  setGlobalLoading,
  setMobileMenuOpen,
} from './slices/uiSlice';
export {
  addToLocalCart,
  updateLocalCartItem,
  removeFromLocalCart,
  clearLocalCart,
  setCartSynced,
  setLocalCart,
} from './slices/cartSlice';
