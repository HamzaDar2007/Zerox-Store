import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import SASeoPage from '../pages/SASeoPage';

describe('SASeoPage', () => {
  it('renders page header', () => {
    render(<SASeoPage />);
    expect(screen.getByText('SEO Management')).toBeInTheDocument();
  });

  it('renders add seo entry button', () => {
    render(<SASeoPage />);
    expect(screen.getByRole('button', { name: /add seo entry/i })).toBeInTheDocument();
  });
});
