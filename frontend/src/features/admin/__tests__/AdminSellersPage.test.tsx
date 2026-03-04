import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import AdminSellersPage from '../pages/AdminSellersPage';

describe('AdminSellersPage', () => {
  it('renders page header', () => {
    render(<AdminSellersPage />);
    expect(screen.getByText('Sellers')).toBeInTheDocument();
  });

  it('renders the page component', () => {
    const { container } = render(<AdminSellersPage />);
    expect(container).toBeTruthy();
  });
});
