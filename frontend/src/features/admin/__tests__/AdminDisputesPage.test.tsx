import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import AdminDisputesPage from '../pages/AdminDisputesPage';

describe('AdminDisputesPage', () => {
  it('renders loading state initially', () => {
    render(<AdminDisputesPage />);
    expect(screen.getByText(/loading disputes/i)).toBeInTheDocument();
  });

  it('renders page header after load', async () => {
    render(<AdminDisputesPage />);
    await waitFor(() => {
      expect(screen.getByText('Dispute Management')).toBeInTheDocument();
    });
  });

  it('renders description', async () => {
    render(<AdminDisputesPage />);
    await waitFor(() => {
      expect(screen.getByText(/review and resolve customer disputes/i)).toBeInTheDocument();
    });
  });
});
