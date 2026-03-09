import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, userEvent } from '@/test/test-utils';
import ChangePasswordPage from '../pages/ChangePasswordPage';

describe('ChangePasswordPage', () => {
  it('renders the change password form fields and button', () => {
    renderWithProviders(<ChangePasswordPage />);

    expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
  });

  it('renders the page heading', () => {
    renderWithProviders(<ChangePasswordPage />);
    expect(screen.getByRole('heading', { level: 2, name: /change password/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderWithProviders(<ChangePasswordPage />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(screen.getByText('Current password is required')).toBeInTheDocument();
    });
  });

  it('shows validation error when passwords do not match', async () => {
    renderWithProviders(<ChangePasswordPage />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Current Password'), 'OldPass1!');
    await user.type(screen.getByLabelText('New Password'), 'NewPass1!x');
    await user.type(screen.getByLabelText('Confirm New Password'), 'Different1!');
    await user.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('renders Password Settings card title', () => {
    renderWithProviders(<ChangePasswordPage />);
    expect(screen.getByText('Password Settings')).toBeInTheDocument();
    expect(screen.getByText(/enter your current password/i)).toBeInTheDocument();
  });
});
