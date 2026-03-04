import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import SellerDashboardPage from '../pages/SellerDashboardPage';

describe('SellerDashboardPage', () => {
  it('renders dashboard heading', async () => {
    render(<SellerDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Seller Dashboard')).toBeInTheDocument();
    });
  });

  it('renders stat cards', async () => {
    render(<SellerDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Total Orders')).toBeInTheDocument();
      expect(screen.getByText('Total Products')).toBeInTheDocument();
    });
  });

  it('renders recent orders section', async () => {
    render(<SellerDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Recent Orders')).toBeInTheDocument();
    });
  });

  it('renders top products section', async () => {
    render(<SellerDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Top Products')).toBeInTheDocument();
    });
  });
});
