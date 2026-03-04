import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import SellerSubscriptionsPage from '../pages/SellerSubscriptionsPage';

describe('SellerSubscriptionsPage', () => {
  it('renders loading state initially', () => {
    render(<SellerSubscriptionsPage />);
    expect(screen.getByText(/loading subscriptions/i)).toBeInTheDocument();
  });

  it('renders page header after load', async () => {
    render(<SellerSubscriptionsPage />);
    await waitFor(() => {
      expect(screen.getByText('Subscriptions')).toBeInTheDocument();
    });
  });

  it('renders description', async () => {
    render(<SellerSubscriptionsPage />);
    await waitFor(() => {
      expect(screen.getByText(/view and manage customer subscriptions/i)).toBeInTheDocument();
    });
  });
});
