import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import SellerBundlesPage from '../pages/SellerBundlesPage';

describe('SellerBundlesPage', () => {
  it('renders loading state initially', () => {
    render(<SellerBundlesPage />);
    expect(screen.getByText(/loading bundles/i)).toBeInTheDocument();
  });

  it('renders page header after load', async () => {
    render(<SellerBundlesPage />);
    await waitFor(() => {
      expect(screen.getByText('Product Bundles')).toBeInTheDocument();
    });
  });

  it('renders bundles description when data loads', async () => {
    render(<SellerBundlesPage />);
    await waitFor(
      () => {
        expect(screen.getByText(/create and manage product bundles/i)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('renders description', async () => {
    render(<SellerBundlesPage />);
    await waitFor(() => {
      expect(screen.getByText(/create and manage product bundles/i)).toBeInTheDocument();
    });
  });
});
