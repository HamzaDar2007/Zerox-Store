import { describe, it, expect } from 'vitest';
import { createTestStore } from '@/test/test-utils';
import { toggleSidebar } from '@/store/slices/uiSlice';

describe('Store: uiSlice', () => {
  it('creates store with default state', () => {
    const store = createTestStore();
    const state = store.getState();
    expect(state.ui).toBeDefined();
    expect(state.auth).toBeDefined();
    expect(state.cart).toBeDefined();
  });

  it('toggles sidebar state', () => {
    const store = createTestStore();
    const initial = store.getState().ui.sidebarOpen;
    store.dispatch(toggleSidebar());
    expect(store.getState().ui.sidebarOpen).toBe(!initial);
  });
});
