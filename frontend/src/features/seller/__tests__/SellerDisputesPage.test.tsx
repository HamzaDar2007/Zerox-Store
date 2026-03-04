import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import SellerDisputesPage from '../pages/SellerDisputesPage';

describe('SellerDisputesPage', () => {
  it('renders loading state initially', () => {
    render(<SellerDisputesPage />);
    expect(screen.getByText(/loading disputes/i)).toBeInTheDocument();
  });

  it('renders page header after load', async () => {
    render(<SellerDisputesPage />);
    await waitFor(() => {
      expect(screen.getByText('Disputes')).toBeInTheDocument();
    });
  });

  it('renders description', async () => {
    render(<SellerDisputesPage />);
    await waitFor(() => {
      expect(screen.getByText(/manage and respond to customer disputes/i)).toBeInTheDocument();
    });
  });
});
