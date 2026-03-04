import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import AdminCategoriesPage from '../pages/AdminCategoriesPage';

describe('AdminCategoriesPage', () => {
  it('renders page header', async () => {
    render(<AdminCategoriesPage />);
    await waitFor(() => {
      expect(screen.getByText('Categories')).toBeInTheDocument();
    });
  });

  it('renders add category button', async () => {
    render(<AdminCategoriesPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add category/i })).toBeInTheDocument();
    });
  });
});
