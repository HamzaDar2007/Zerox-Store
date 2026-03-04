import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import SellerInventoryPage from '../pages/SellerInventoryPage';

describe('SellerInventoryPage', () => {
  it('renders loading state initially', () => {
    render(<SellerInventoryPage />);
    expect(screen.getByText(/loading inventory/i)).toBeInTheDocument();
  });

  it('renders page header after load', async () => {
    render(<SellerInventoryPage />);
    await waitFor(() => {
      expect(screen.getByText('Inventory Management')).toBeInTheDocument();
    });
  });

  it('renders new warehouse button after data loads', async () => {
    render(<SellerInventoryPage />);
    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: /new warehouse/i })).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('renders description', async () => {
    render(<SellerInventoryPage />);
    await waitFor(() => {
      expect(screen.getByText(/manage warehouses, stock levels, and movements/i)).toBeInTheDocument();
    });
  });
});
