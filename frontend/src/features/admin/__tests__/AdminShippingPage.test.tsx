import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import AdminShippingPage from '../pages/AdminShippingPage';

describe('AdminShippingPage', () => {
  it('renders loading state initially', () => {
    render(<AdminShippingPage />);
    expect(screen.getByText(/loading shipping/i)).toBeInTheDocument();
  });

  it('renders page header after load', async () => {
    render(<AdminShippingPage />);
    await waitFor(() => {
      expect(screen.getByText('Shipping Management')).toBeInTheDocument();
    });
  });

  it('renders description', async () => {
    render(<AdminShippingPage />);
    await waitFor(() => {
      expect(screen.getByText(/manage zones, methods, carriers, and rates/i)).toBeInTheDocument();
    });
  });
});
