import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import AdminOrdersPage from '../pages/AdminOrdersPage';

describe('AdminOrdersPage', () => {
  it('renders page header', () => {
    render(<AdminOrdersPage />);
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });

  it('renders the page component', () => {
    const { container } = render(<AdminOrdersPage />);
    expect(container).toBeTruthy();
  });
});
