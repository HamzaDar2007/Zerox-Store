import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import CustomerLoyaltyPage from '../pages/CustomerLoyaltyPage';

describe('CustomerLoyaltyPage', () => {
  it('renders loading state initially', () => {
    render(<CustomerLoyaltyPage />);
    expect(screen.getByText(/loading loyalty program/i)).toBeInTheDocument();
  });

  it('renders page header after load', async () => {
    render(<CustomerLoyaltyPage />);
    await waitFor(() => {
      expect(screen.getByText('Loyalty Program')).toBeInTheDocument();
    });
  });

  it('renders stat cards for points', async () => {
    render(<CustomerLoyaltyPage />);
    await waitFor(() => {
      expect(screen.getByText('Available Points')).toBeInTheDocument();
      expect(screen.getByText('Lifetime Points')).toBeInTheDocument();
    });
  });

  it('renders redeem points button', async () => {
    render(<CustomerLoyaltyPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /redeem points/i })).toBeInTheDocument();
    });
  });
});
