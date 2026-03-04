import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import AdminBundlesPage from '../pages/AdminBundlesPage';

describe('AdminBundlesPage', () => {
  it('renders loading state initially', () => {
    render(<AdminBundlesPage />);
    expect(screen.getByText(/loading bundles/i)).toBeInTheDocument();
  });

  it('renders page header after load', async () => {
    render(<AdminBundlesPage />);
    await waitFor(() => {
      expect(screen.getByText('All Bundles')).toBeInTheDocument();
    });
  });

  it('renders description', async () => {
    render(<AdminBundlesPage />);
    await waitFor(() => {
      expect(screen.getByText(/view and manage product bundles across all sellers/i)).toBeInTheDocument();
    });
  });
});
