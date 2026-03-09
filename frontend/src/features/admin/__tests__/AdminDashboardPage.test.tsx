import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import AdminDashboardPage from '../pages/AdminDashboardPage';

vi.mock('@/store/api', () => ({
  useGetUsersQuery: () => ({ data: { data: { total: 5 } }, isLoading: false, isError: false, refetch: vi.fn() }),
  useGetOrdersQuery: () => ({ data: { data: { items: [], total: 3 } }, isLoading: false, isError: false, refetch: vi.fn() }),
  useGetSellersQuery: () => ({ data: { data: [] }, isLoading: false, isError: false, refetch: vi.fn() }),
}));

describe('AdminDashboardPage', () => {
  it('renders dashboard heading', async () => {
    render(<AdminDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });

  it('renders stat cards', async () => {
    render(<AdminDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Total Orders')).toBeInTheDocument();
      expect(screen.getByText('Active Sellers')).toBeInTheDocument();
    });
  });

  it('renders recent orders section', async () => {
    render(<AdminDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Recent Orders')).toBeInTheDocument();
    });
  });

  it('renders recent sellers section', async () => {
    render(<AdminDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Recent Sellers')).toBeInTheDocument();
    });
  });

  it('renders subtitle description', async () => {
    render(<AdminDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText(/platform overview/i)).toBeInTheDocument();
    });
  });
});
