import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import AdminDashboardPage from '../pages/AdminDashboardPage';

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
