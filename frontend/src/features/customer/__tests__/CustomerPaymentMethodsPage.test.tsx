import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import CustomerPaymentMethodsPage from '../pages/CustomerPaymentMethodsPage';

describe('CustomerPaymentMethodsPage', () => {
  it('renders loading state initially', () => {
    render(<CustomerPaymentMethodsPage />);
    expect(screen.getByText(/loading payment methods/i)).toBeInTheDocument();
  });

  it('renders page header after load', async () => {
    render(<CustomerPaymentMethodsPage />);
    await waitFor(() => {
      expect(screen.getByText('Payment Methods')).toBeInTheDocument();
    });
  });

  it('renders description', async () => {
    render(<CustomerPaymentMethodsPage />);
    await waitFor(() => {
      expect(screen.getByText(/manage your saved payment methods/i)).toBeInTheDocument();
    });
  });
});
