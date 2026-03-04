import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import SASubscriptionsPage from '../pages/SASubscriptionsPage';

describe('SASubscriptionsPage', () => {
  it('renders loading state initially', () => {
    render(<SASubscriptionsPage />);
    expect(screen.getByText(/loading subscriptions/i)).toBeInTheDocument();
  });

  it('renders page header after load', async () => {
    render(<SASubscriptionsPage />);
    await waitFor(() => {
      expect(screen.getByText('Subscriptions Management')).toBeInTheDocument();
    });
  });

  it('renders description', async () => {
    render(<SASubscriptionsPage />);
    await waitFor(() => {
      expect(screen.getByText(/manage all platform subscriptions/i)).toBeInTheDocument();
    });
  });

  it('renders summary cards', async () => {
    render(<SASubscriptionsPage />);
    await waitFor(() => {
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });
});
