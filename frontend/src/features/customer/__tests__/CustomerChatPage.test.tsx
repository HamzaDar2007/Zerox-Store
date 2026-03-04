import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import CustomerChatPage from '../pages/CustomerChatPage';

describe('CustomerChatPage', () => {
  it('renders loading state initially', () => {
    render(<CustomerChatPage />);
    expect(screen.getByText(/loading conversations/i)).toBeInTheDocument();
  });

  it('renders page header after load', async () => {
    render(<CustomerChatPage />);
    await waitFor(() => {
      expect(screen.getByText('Messages')).toBeInTheDocument();
    });
  });

  it('renders new conversation button', async () => {
    render(<CustomerChatPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /new conversation/i })).toBeInTheDocument();
    });
  });

  it('renders conversation list from API', async () => {
    render(<CustomerChatPage />);
    await waitFor(() => {
      expect(screen.getByText(/chat with sellers and support/i)).toBeInTheDocument();
    });
  });
});
