import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import SAFeatureFlagsPage from '../pages/SAFeatureFlagsPage';

describe('SAFeatureFlagsPage', () => {
  it('renders the component', () => {
    const { container } = render(<SAFeatureFlagsPage />);
    expect(container).toBeTruthy();
  });

  it('renders page header after load', async () => {
    render(<SAFeatureFlagsPage />);
    await waitFor(() => {
      expect(screen.getByText('Feature Flags')).toBeInTheDocument();
    });
  });
});
