import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from './page';

// Mock the login function to always fail for this test
jest.mock('@/lib/auth', () => ({
  login: jest.fn(() => Promise.resolve({ success: false, error: 'Login failed.' }))
}));

// Mock useAuth to prevent side effects
jest.mock('@/components/auth-provider', () => ({
  useAuth: () => ({ login: jest.fn() })
}));

describe('LoginPage', () => {
  test('shows error message on failed login', async () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/employee id/i), { target: { value: 'wrong' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'badpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(await screen.findByText(/login failed/i)).toBeInTheDocument();
  });
});
