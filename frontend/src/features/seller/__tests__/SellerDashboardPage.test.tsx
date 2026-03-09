import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import SellerDashboardPage from '../pages/SellerDashboardPage';

vi.mock('@/store/api', () => ({
  useGetOrdersQuery: () => ({ data: { data: { items: [], total: 2 } }, isLoading: false, isError: false, refetch: vi.fn() }),
  useGetProductsQuery: () => ({ data: { data: { items: [], total: 4 } }, isLoading: false, isError: false, refetch: vi.fn() }),
}));

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
