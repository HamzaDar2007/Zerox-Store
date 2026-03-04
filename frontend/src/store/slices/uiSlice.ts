import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark' | 'system';

export interface UiState {
  sidebarOpen: boolean;
  theme: Theme;
  globalLoading: boolean;
  mobileMenuOpen: boolean;
}

const getPreferredTheme = (): Theme => {
  const stored = localStorage.getItem('labverse_theme') as Theme | null;
  return stored || 'system';
};

const initialState: UiState = {
  sidebarOpen: true,
  theme: getPreferredTheme(),
  globalLoading: false,
  mobileMenuOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      localStorage.setItem('labverse_theme', action.payload);
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  setGlobalLoading,
  toggleMobileMenu,
  setMobileMenuOpen,
} = uiSlice.actions;
export default uiSlice.reducer;
