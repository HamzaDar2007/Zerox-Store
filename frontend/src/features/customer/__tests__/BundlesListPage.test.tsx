import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import BundlesListPage from '../pages/BundlesListPage';

describe('BundlesListPage', () => {
  it('renders loading state initially', () => {
    render(<BundlesListPage />);
    expect(screen.getByText(/loading bundles/i)).toBeInTheDocument();
  });

  it('renders page header after load', async () => {
    render(<BundlesListPage />);
    await waitFor(() => {
      expect(screen.getByText('Product Bundles')).toBeInTheDocument();
    });
  });

  it('renders description', async () => {
    render(<BundlesListPage />);
    await waitFor(() => {
      expect(screen.getByText(/save more with curated bundles/i)).toBeInTheDocument();
    });
  });
});
