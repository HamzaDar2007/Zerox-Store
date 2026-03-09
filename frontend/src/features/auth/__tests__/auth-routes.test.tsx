import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import { AppRouter } from '@/routes/router';

describe('AppRouter', () => {
  it('renders home page at /', () => {
    window.history.pushState({}, '', '/');
    render(<AppRouter />);
    expect(document.body).toBeTruthy();
  });

  it('renders login page at /login', async () => {
    window.history.pushState({}, '', '/login');
    render(<AppRouter />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter your password/i)).toBeTruthy();
    });
  });

  it('renders register page at /register', async () => {
    window.history.pushState({}, '', '/register');
    render(<AppRouter />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/at least 6 characters/i)).toBeTruthy();
    });
  });
});
