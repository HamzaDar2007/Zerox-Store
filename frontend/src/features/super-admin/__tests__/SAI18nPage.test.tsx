import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import SAI18nPage from '../pages/SAI18nPage';

describe('SAI18nPage', () => {
  it('renders page header', () => {
    render(<SAI18nPage />);
    expect(screen.getByText('Internationalization')).toBeInTheDocument();
  });

  it('renders add language button', () => {
    render(<SAI18nPage />);
    expect(screen.getByRole('button', { name: /add language/i })).toBeInTheDocument();
  });
});
