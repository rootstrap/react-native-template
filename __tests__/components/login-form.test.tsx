import { cleanup, fireEvent, render, screen, waitFor } from '@/lib/test-utils';

import { LoginForm } from '../../src/components/login-form';

afterEach(cleanup);

describe('LoginForm Form ', () => {
  const LOGIN_BUTTON = 'login-button';
  it('renders correctly', async () => {
    render(<LoginForm />);
    expect(await screen.findByText(/Sign in/i)).toBeOnTheScreen();
  });

  it('should display required error when values are empty', async () => {
    render(<LoginForm />);

    const button = screen.getByTestId(LOGIN_BUTTON);
    expect(screen.queryByText(/Email is required/i)).not.toBeOnTheScreen();
    fireEvent.press(button);
    expect(await screen.findByText(/Email is required/i)).toBeOnTheScreen();
    expect(screen.getByText(/Password is required/i)).toBeOnTheScreen();
  });

  it('should display matching error when email is invalid', async () => {
    render(<LoginForm />);

    const button = screen.getByTestId(LOGIN_BUTTON);
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    fireEvent.changeText(emailInput, 'yyyy');
    fireEvent.changeText(passwordInput, 'test');
    fireEvent.press(button);

    expect(screen.queryByText(/Email is required/i)).not.toBeOnTheScreen();
    expect(await screen.findByText(/Invalid Email Format/i)).toBeOnTheScreen();
  });

  it('should display required error when password is cleared', async () => {
    render(<LoginForm />);

    const passwordInput = screen.getByTestId('password-input');
    fireEvent.changeText(screen.getByTestId('email-input'), 'user@example.com');
    fireEvent.changeText(passwordInput, '123');
    fireEvent.changeText(passwordInput, '');
    fireEvent.press(screen.getByTestId(LOGIN_BUTTON));

    expect(await screen.findByText(/Password is required/i)).toBeOnTheScreen();
  });

  it('should submit with a short password without a length error', async () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    fireEvent.changeText(screen.getByTestId('email-input'), 'user@example.com');
    fireEvent.changeText(screen.getByTestId('password-input'), '123');
    fireEvent.press(screen.getByTestId(LOGIN_BUTTON));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { email: 'user@example.com', password: '123' },
        undefined,
      );
    });
    expect(screen.queryByText(/at least/i)).not.toBeOnTheScreen();
    expect(screen.queryByText(/Password is required/i)).not.toBeOnTheScreen();
  });
});
