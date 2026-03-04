import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import SALoyaltyPage from '../pages/SALoyaltyPage';

describe('SALoyaltyPage', () => {
  it('renders loading state initially', () => {
    render(<SALoyaltyPage />);
    expect(screen.getByText(/loading loyalty tiers/i)).toBeInTheDocument();
  });

  it('renders page header after load', async () => {
    render(<SALoyaltyPage />);
    await waitFor(() => {
      expect(screen.getByText('Loyalty Program')).toBeInTheDocument();
    });
  });

  it('renders new tier button', async () => {
    render(<SALoyaltyPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /new tier/i })).toBeInTheDocument();
    });
  });

  it('renders description', async () => {
    render(<SALoyaltyPage />);
    await waitFor(() => {
      expect(screen.getByText(/manage loyalty tiers and rewards/i)).toBeInTheDocument();
    });
  });

  it('renders summary cards', async () => {
    render(<SALoyaltyPage />);
    await waitFor(() => {
      expect(screen.getByText('Total Tiers')).toBeInTheDocument();
    });
  });
});
