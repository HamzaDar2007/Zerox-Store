import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import AdminInventoryPage from '../pages/AdminInventoryPage';

describe('AdminInventoryPage', () => {
  it('renders loading state initially', () => {
    render(<AdminInventoryPage />);
    expect(screen.getByText(/loading inventory/i)).toBeInTheDocument();
  });

  it('renders page header after load', async () => {
    render(<AdminInventoryPage />);
    await waitFor(() => {
      expect(screen.getByText('Inventory Overview')).toBeInTheDocument();
    });
  });

  it('renders description', async () => {
    render(<AdminInventoryPage />);
    await waitFor(() => {
      expect(screen.getByText(/view warehouse inventory across all sellers/i)).toBeInTheDocument();
    });
  });
});
