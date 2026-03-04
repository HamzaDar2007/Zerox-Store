import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import CustomerReturnsPage from '../pages/CustomerReturnsPage';

describe('CustomerReturnsPage', () => {
  it('renders page title', () => {
    render(<CustomerReturnsPage />);
    expect(screen.getByText('Returns')).toBeInTheDocument();
  });

  it('renders the component container', () => {
    const { container } = render(<CustomerReturnsPage />);
    expect(container.firstChild).toBeTruthy();
  });
});
