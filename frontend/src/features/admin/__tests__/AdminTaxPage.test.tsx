import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import AdminTaxPage from '../pages/AdminTaxPage';

describe('AdminTaxPage', () => {
  it('renders loading state initially', () => {
    render(<AdminTaxPage />);
    expect(screen.getByText(/loading tax config/i)).toBeInTheDocument();
  });

  it('renders page header after load', async () => {
    render(<AdminTaxPage />);
    await waitFor(() => {
      expect(screen.getByText('Tax Configuration')).toBeInTheDocument();
    });
  });

  it('renders tax description when data loads', async () => {
    render(<AdminTaxPage />);
    await waitFor(
      () => {
        expect(screen.getByText(/manage tax zones, rates, and classes/i)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('renders description', async () => {
    render(<AdminTaxPage />);
    await waitFor(() => {
      expect(screen.getByText(/manage tax zones, rates, and classes/i)).toBeInTheDocument();
    });
  });
});
