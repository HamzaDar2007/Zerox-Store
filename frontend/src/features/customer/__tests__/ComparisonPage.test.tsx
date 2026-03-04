import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import ComparisonPage from '../pages/ComparisonPage';

describe('ComparisonPage', () => {
  it('renders loading state initially', () => {
    render(<ComparisonPage />);
    expect(screen.getByText(/loading comparison/i)).toBeInTheDocument();
  });

  it('renders page header after load', async () => {
    render(<ComparisonPage />);
    await waitFor(() => {
      expect(screen.getByText('Compare Products')).toBeInTheDocument();
    });
  });
});
