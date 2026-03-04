import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { AppRouter } from '@/routes/router';

describe('AppRouter', () => {
  it('renders home page at /', () => {
    window.history.pushState({}, '', '/');
    render(<AppRouter />);
    expect(document.body).toBeTruthy();
  });

  it('renders login page at /login', () => {
    window.history.pushState({}, '', '/login');
    render(<AppRouter />);
    // Login page has a password field
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeTruthy();
  });

  it('renders register page at /register', () => {
    window.history.pushState({}, '', '/register');
    render(<AppRouter />);
    // Register page has a "Create a password" placeholder
    expect(screen.getByPlaceholderText(/create a password/i)).toBeTruthy();
  });
});
