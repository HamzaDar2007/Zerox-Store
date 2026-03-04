import { render, type RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '@/store/baseApi';
import authReducer from '@/store/slices/authSlice';
import uiReducer from '@/store/slices/uiSlice';
import cartReducer from '@/store/slices/cartSlice';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';

export function createTestStore() {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: authReducer,
      ui: uiReducer,
      cart: cartReducer,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    middleware: (getDefault: any) => getDefault().concat(baseApi.middleware),
  });
}

interface WrapperProps {
  children: ReactNode;
}

function AllProviders({ children }: WrapperProps) {
  const store = createTestStore();
  return (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
export { renderWithProviders as render };
export { userEvent };
