import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import { baseApi } from './baseApi';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import cartReducer from './slices/cartSlice';

// API slices use baseApi.injectEndpoints() and are imported colocated
// with the lazy-loaded pages that use them (via @/store/api barrel).
// Do NOT add side-effect imports here — it pulls all 29 API slices
// into the main bundle.

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    ui: uiReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
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
