import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import CustomerSubscriptionsPage from '../pages/CustomerSubscriptionsPage';

describe('CustomerSubscriptionsPage', () => {
  it('renders loading state initially', () => {
    render(<CustomerSubscriptionsPage />);
    expect(screen.getByText(/loading subscriptions/i)).toBeInTheDocument();
  });

  it('renders page header after load', async () => {
    render(<CustomerSubscriptionsPage />);
    await waitFor(() => {
      expect(screen.getByText('My Subscriptions')).toBeInTheDocument();
    });
  });

  it('renders description text', async () => {
    render(<CustomerSubscriptionsPage />);
    await waitFor(() => {
      expect(screen.getByText(/manage your recurring orders/i)).toBeInTheDocument();
    });
  });
});
