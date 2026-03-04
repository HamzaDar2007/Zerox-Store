import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import HomePage from '../pages/HomePage';

describe('HomePage', () => {
  it('renders hero section with welcome heading', async () => {
    render(<HomePage />);
    await waitFor(() => {
      expect(screen.getByText(/welcome to/i)).toBeInTheDocument();
    });
  });

  it('renders Shop Now and Browse Categories buttons', async () => {
    render(<HomePage />);
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /shop now/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /browse categories/i })).toBeInTheDocument();
    });
  });

  it('renders trust badges', async () => {
    render(<HomePage />);
    await waitFor(() => {
      expect(screen.getByText('Free Shipping')).toBeInTheDocument();
      expect(screen.getByText('Secure Payments')).toBeInTheDocument();
      expect(screen.getByText('24/7 Support')).toBeInTheDocument();
      expect(screen.getByText('Easy Returns')).toBeInTheDocument();
    });
  });

  it('renders category and product sections', async () => {
    render(<HomePage />);
    await waitFor(() => {
      expect(screen.getByText('Shop by Category')).toBeInTheDocument();
      expect(screen.getByText('Featured Products')).toBeInTheDocument();
    });
  });
});
