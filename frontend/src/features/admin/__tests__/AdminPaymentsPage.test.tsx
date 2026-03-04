import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import AdminPaymentsPage from '../pages/AdminPaymentsPage';

describe('AdminPaymentsPage', () => {
  it('renders loading state initially', () => {
    render(<AdminPaymentsPage />);
    expect(screen.getByText(/loading payments/i)).toBeInTheDocument();
  });

  it('renders page header after load', async () => {
    render(<AdminPaymentsPage />);
    await waitFor(() => {
      expect(screen.getByText('Payments & Refunds')).toBeInTheDocument();
    });
  });

  it('renders create refund button', async () => {
    render(<AdminPaymentsPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create refund/i })).toBeInTheDocument();
    });
  });

  it('renders description', async () => {
    render(<AdminPaymentsPage />);
    await waitFor(() => {
      expect(screen.getByText(/view payments and manage refunds/i)).toBeInTheDocument();
    });
  });
});
