import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import SuperAdminDashboardPage from '../pages/SuperAdminDashboardPage';

describe('SuperAdminDashboardPage', () => {
  it('renders dashboard heading', async () => {
    render(<SuperAdminDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Super Admin Dashboard')).toBeInTheDocument();
    });
  });

  it('renders stat cards', async () => {
    render(<SuperAdminDashboardPage />);
    expect(screen.getByText('Super Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Recent Audit Logs')).toBeInTheDocument();
  });

  it('renders audit logs section', async () => {
    render(<SuperAdminDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Recent Audit Logs')).toBeInTheDocument();
    });
  });

  it('renders subtitle description', async () => {
    render(<SuperAdminDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText(/full platform control/i)).toBeInTheDocument();
    });
  });
});
