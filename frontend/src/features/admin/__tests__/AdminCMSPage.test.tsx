import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import AdminCMSPage from '../pages/AdminCMSPage';

describe('AdminCMSPage', () => {
  it('renders page header', () => {
    render(<AdminCMSPage />);
    expect(screen.getByText('CMS')).toBeInTheDocument();
  });

  it('renders new page button', () => {
    render(<AdminCMSPage />);
    expect(screen.getByRole('button', { name: /new page/i })).toBeInTheDocument();
  });
});
