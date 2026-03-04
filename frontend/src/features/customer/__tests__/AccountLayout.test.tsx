import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import AccountLayout from '../pages/AccountLayout';

describe('AccountLayout', () => {
  it('renders sidebar navigation links', () => {
    render(<AccountLayout />);
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('My Orders')).toBeInTheDocument();
    expect(screen.getByText('Addresses')).toBeInTheDocument();
    expect(screen.getByText('Wishlist')).toBeInTheDocument();
    expect(screen.getByText('Returns')).toBeInTheDocument();
    expect(screen.getByText('Subscriptions')).toBeInTheDocument();
    expect(screen.getByText('Loyalty')).toBeInTheDocument();
    expect(screen.getByText('Payment Methods')).toBeInTheDocument();
    expect(screen.getByText('Disputes')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('renders sign out button', () => {
    render(<AccountLayout />);
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });
});
