import { SignUpForm } from '@/components/sign-up-form';
import { cleanup, fireEvent, render, screen } from '@/lib/test-utils';

afterEach(cleanup);

const SIGN_UP_BUTTON = 'sign-up-button';
const EMAIL_INPUT = 'email-input';
const NAME_INPUT = 'name-input';
const PASSWORD_INPUT = 'password-input';
const PASSWORD_CONFIRMATION_INPUT = 'password-confirmation-input';

function fillValidFormData() {
  const emailInput = screen.getByTestId(EMAIL_INPUT);
  const nameInput = screen.getByTestId(NAME_INPUT);
  const passwordInput = screen.getByTestId(PASSWORD_INPUT);
  const passwordConfirmationInput = screen.getByTestId(
    PASSWORD_CONFIRMATION_INPUT,
  );

  fireEvent.changeText(emailInput, 'test@example.com');
  fireEvent.changeText(nameInput, 'Test User');
  fireEvent.changeText(passwordInput, 'password123');
  fireEvent.changeText(passwordConfirmationInput, 'password123');
}

function fillMismatchedPasswords() {
  const emailInput = screen.getByTestId(EMAIL_INPUT);
  const nameInput = screen.getByTestId(NAME_INPUT);
  const passwordInput = screen.getByTestId(PASSWORD_INPUT);
  const passwordConfirmationInput = screen.getByTestId(
    PASSWORD_CONFIRMATION_INPUT,
  );

  fireEvent.changeText(emailInput, 'test@example.com');
  fireEvent.changeText(nameInput, 'Test User');
  fireEvent.changeText(passwordInput, 'password123');
  fireEvent.changeText(passwordConfirmationInput, 'different123');
}

function expectFormFieldsToBePresent() {
  expect(screen.getByTestId(EMAIL_INPUT)).toBeTruthy();
  expect(screen.getByTestId(NAME_INPUT)).toBeTruthy();
  expect(screen.getByTestId(PASSWORD_INPUT)).toBeTruthy();
  expect(screen.getByTestId(PASSWORD_CONFIRMATION_INPUT)).toBeTruthy();
  expect(screen.getByTestId(SIGN_UP_BUTTON)).toBeTruthy();
}

describe('SignUpForm - rendering', () => {
  it('renders correctly', async () => {
    render(<SignUpForm />);
    expect(await screen.findByText(/Sign up/i)).toBeOnTheScreen();
  });

  it('should render all form fields', () => {
    render(<SignUpForm />);
    expectFormFieldsToBePresent();
  });

  it('should show loading state when isPending is true', () => {
    render(<SignUpForm isPending={true} />);

    const button = screen.getByTestId(SIGN_UP_BUTTON);
    expect(button.props.accessibilityState.disabled).toBe(true);
  });
});

describe('SignUpForm - validation', () => {
  describe('required fields', () => {
    it('should display required error when values are empty', async () => {
      render(<SignUpForm />);

      const button = screen.getByTestId(SIGN_UP_BUTTON);
      expect(screen.queryByText(/Email is required/i)).not.toBeOnTheScreen();
      fireEvent.press(button);

      expect(await screen.findByText(/Email is required/i)).toBeOnTheScreen();
      expect(screen.getByText(/Name is required/i)).toBeOnTheScreen();
      // There are multiple "Password is required" messages, so use getAllByText
      const passwordErrors = screen.getAllByText(/Password is required/i);
      expect(passwordErrors.length).toBeGreaterThan(0);
    });
  });

  describe('email validation', () => {
    it('should display email validation error when email is invalid', async () => {
      render(<SignUpForm />);

      const button = screen.getByTestId(SIGN_UP_BUTTON);
      const emailInput = screen.getByTestId(EMAIL_INPUT);

      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.press(button);

      expect(
        await screen.findByText(/Invalid Email Format/i),
      ).toBeOnTheScreen();
    });
  });

  describe('password validation', () => {
    it('should display password length error when password is too short', async () => {
      render(<SignUpForm />);

      const button = screen.getByTestId(SIGN_UP_BUTTON);
      const passwordInput = screen.getByTestId(PASSWORD_INPUT);

      fireEvent.changeText(passwordInput, '123');
      fireEvent.press(button);

      expect(
        await screen.findByText(/Password must be at least 6 characters/i),
      ).toBeOnTheScreen();
    });

    it('should display password confirmation error when passwords do not match', async () => {
      render(<SignUpForm />);

      const button = screen.getByTestId(SIGN_UP_BUTTON);
      fillMismatchedPasswords();
      fireEvent.press(button);

      expect(
        await screen.findByText(/Passwords do not match/i),
      ).toBeOnTheScreen();
    });
  });
});

describe('SignUpForm - form submission', () => {
  it('should call onSubmit when form is valid', async () => {
    const mockOnSubmit = jest.fn();
    render(<SignUpForm onSubmit={mockOnSubmit} />);

    const button = screen.getByTestId(SIGN_UP_BUTTON);
    fillValidFormData();
    fireEvent.press(button);

    // Wait a bit for form validation
    await screen.findByTestId(SIGN_UP_BUTTON);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        passwordConfirmation: 'password123',
      },
      undefined, // React Hook Form passes event as second parameter
    );
  });
});
