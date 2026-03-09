import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test/test-utils';
import VerifyEmailPage from '../pages/VerifyEmailPage';

// Helper: push a URL with query params before rendering
function renderWithToken(token?: string) {
  const url = token ? `/verify-email?token=${token}` : '/verify-email';
  window.history.pushState({}, '', url);
  return renderWithProviders(<VerifyEmailPage />);
}

describe('VerifyEmailPage', () => {
  it('shows error when no token is provided', async () => {
    renderWithToken(); // no token

    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
    });
    expect(screen.getByText('No verification token provided.')).toBeInTheDocument();
  });

  it('shows loading spinner initially when token exists', () => {
    renderWithToken('some-token');

    // Before API resolves, should show loading state
    expect(screen.getByText(/verifying your email/i)).toBeInTheDocument();
  });

  it('shows Go to Login link after error occurs', async () => {
    renderWithToken(); // no token -> immediate error

    await waitFor(() => {
      expect(screen.getByText('Go to Login')).toBeInTheDocument();
    });
  });

  it('shows Back to Home link in error/completed states', async () => {
    renderWithToken();

    await waitFor(() => {
      expect(screen.getByText(/back to home/i)).toBeInTheDocument();
    });
  });

  it('renders the Verification Failed title when API call errors', async () => {
    // With a token, the API call will attempt and fail in jsdom env
    renderWithToken('expired-token');

    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
    });
  });
});
