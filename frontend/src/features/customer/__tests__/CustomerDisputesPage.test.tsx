import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import CustomerDisputesPage from '../pages/CustomerDisputesPage';

describe('CustomerDisputesPage', () => {
  it('renders loading state initially', () => {
    render(<CustomerDisputesPage />);
    expect(screen.getByText(/loading disputes/i)).toBeInTheDocument();
  });

  it('renders page header after load', async () => {
    render(<CustomerDisputesPage />);
    await waitFor(() => {
      expect(screen.getByText('My Disputes')).toBeInTheDocument();
    });
  });

  it('renders open dispute button', async () => {
    render(<CustomerDisputesPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open dispute/i })).toBeInTheDocument();
    });
  });

  it('displays dispute data table', async () => {
    render(<CustomerDisputesPage />);
    await waitFor(() => {
      expect(screen.getByText(/manage your order disputes/i)).toBeInTheDocument();
    });
  });
});
