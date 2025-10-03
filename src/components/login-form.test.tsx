import { cleanup, fireEvent, render, screen } from '@/lib/test-utils';

<<<<<<< HEAD
=======
import { cleanup, screen, setup, waitFor } from '@/lib/test-utils';

import type { LoginFormProps } from './login-form';
>>>>>>> c7bb80d
import { LoginForm } from './login-form';

afterEach(cleanup);

describe('LoginForm Form ', () => {
  const LOGIN_BUTTON = 'login-button';
  it('renders correctly', async () => {
<<<<<<< HEAD
    render(<LoginForm />);
    expect(await screen.findByText(/Sign in/i)).toBeOnTheScreen();
=======
    setup(<LoginForm />);
    expect(await screen.findByTestId('form-title')).toBeOnTheScreen();
>>>>>>> c7bb80d
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
<<<<<<< HEAD
    expect(await screen.findByText(/Invalid Email Format/i)).toBeOnTheScreen();
=======
  });

  it('Should call LoginForm with correct values when values are valid', async () => {
    const { user } = setup(<LoginForm onSubmit={onSubmitMock} />);

    const button = screen.getByTestId('login-button');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    await user.type(emailInput, 'youssef@gmail.com');
    await user.type(passwordInput, 'password');
    await user.press(button);
    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
    // expect.objectContaining({}) because we don't want to test the target event we are receiving from the onSubmit function
    expect(onSubmitMock).toHaveBeenCalledWith(
      {
        email: 'youssef@gmail.com',
        password: 'password',
      },
      expect.objectContaining({})
    );
>>>>>>> c7bb80d
  });
});
