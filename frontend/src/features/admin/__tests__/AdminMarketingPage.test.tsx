import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import AdminMarketingPage from '../pages/AdminMarketingPage';

describe('AdminMarketingPage', () => {
  it('renders loading state initially', () => {
    render(<AdminMarketingPage />);
    expect(screen.getByText(/loading marketing/i)).toBeInTheDocument();
  });

  it('renders page header after load', async () => {
    render(<AdminMarketingPage />);
    await waitFor(() => {
      expect(screen.getByText('Marketing')).toBeInTheDocument();
    });
  });

  it('renders marketing description when data loads', async () => {
    render(<AdminMarketingPage />);
    await waitFor(
      () => {
        expect(screen.getByText(/manage campaigns, vouchers, and flash sales/i)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('renders description', async () => {
    render(<AdminMarketingPage />);
    await waitFor(() => {
      expect(screen.getByText(/manage campaigns, vouchers, and flash sales/i)).toBeInTheDocument();
    });
  });
});
