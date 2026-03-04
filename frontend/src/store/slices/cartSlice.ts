import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface LocalCartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  name: string;
  price: number;
  image?: string;
}

export interface CartState {
  items: LocalCartItem[];
  isSynced: boolean;
}

const initialState: CartState = {
  items: [],
  isSynced: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToLocalCart: (state, action: PayloadAction<LocalCartItem>) => {
      const existing = state.items.find(
        (item) =>
          item.productId === action.payload.productId &&
          item.variantId === action.payload.variantId,
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.isSynced = false;
    },
    updateLocalCartItem: (
      state,
      action: PayloadAction<{
        productId: string;
        variantId?: string;
        quantity: number;
      }>,
    ) => {
      const item = state.items.find(
        (i) =>
          i.productId === action.payload.productId &&
          i.variantId === action.payload.variantId,
      );
      if (item) {
        item.quantity = action.payload.quantity;
      }
      state.isSynced = false;
    },
    removeFromLocalCart: (
      state,
      action: PayloadAction<{ productId: string; variantId?: string }>,
    ) => {
      state.items = state.items.filter(
        (i) =>
          !(
            i.productId === action.payload.productId &&
            i.variantId === action.payload.variantId
          ),
      );
      state.isSynced = false;
    },
    clearLocalCart: (state) => {
      state.items = [];
      state.isSynced = false;
    },
    setCartSynced: (state, action: PayloadAction<boolean>) => {
      state.isSynced = action.payload;
    },
    setLocalCart: (state, action: PayloadAction<LocalCartItem[]>) => {
      state.items = action.payload;
      state.isSynced = true;
    },
  },
});

export const {
  addToLocalCart,
  updateLocalCartItem,
  removeFromLocalCart,
  clearLocalCart,
  setCartSynced,
  setLocalCart,
} = cartSlice.actions;
export default cartSlice.reducer;
