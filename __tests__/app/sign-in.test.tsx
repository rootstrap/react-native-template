import type { LoginFormProps } from '@/components/login-form';
import SignIn from '@/app/sign-in';
import i18n from '@/lib/i18n';
import { clearPendingDeepLink, setPendingDeepLink, usePendingDeepLink } from '@/lib/auth/pending-deep-link';
import { act, cleanup, fireEvent, render, screen } from '@/lib/test-utils';

type LoginCallbacks = { onError?: (error: Error) => void };
type LoginVariables = Parameters<NonNullable<LoginFormProps['onSubmit']>>[0];

const mockLogin = jest.fn<void, [LoginVariables, LoginCallbacks]>();

jest.mock('@/api/auth/use-login', () => ({
  useLogin: (callbacks: LoginCallbacks = {}) => ({
    isPending: false,
    mutate: (variables: LoginVariables) => mockLogin(variables, callbacks),
  }),
}));

jest.mock('@/components/ui', () => ({
  ...jest.requireActual<object>('@/components/ui'),
  FocusAwareStatusBar: () => null,
}));

jest.mock('react-native-flash-message', () => ({
  showMessage: jest.fn(),
}));

const DEEP_LINK_MESSAGE = 'Sign in to open this link.';

async function submitLogin() {
  fireEvent.changeText(screen.getByTestId('email-input'), 'user@example.com');
  fireEvent.changeText(screen.getByTestId('password-input'), 'password');
  await act(async () => {
    fireEvent.press(screen.getByTestId('login-button'));
  });
}

beforeEach(() => {
  mockLogin.mockReset();
  clearPendingDeepLink();
});

afterEach(cleanup);

describe('SignIn', () => {
  it('asks the user to sign in to open a pending link', () => {
    setPendingDeepLink('/feed/1');
    render(<SignIn />);

    expect(screen.getByText(DEEP_LINK_MESSAGE)).toBeOnTheScreen();
  });

  it('shows no link message without a pending link', () => {
    render(<SignIn />);

    expect(screen.queryByText(DEEP_LINK_MESSAGE)).not.toBeOnTheScreen();
  });

  it('hides the message once the pending link is cleared', () => {
    setPendingDeepLink('/feed/1');
    render(<SignIn />);

    act(() => clearPendingDeepLink());

    expect(screen.queryByText(DEEP_LINK_MESSAGE)).not.toBeOnTheScreen();
  });

  it('keeps the pending link and its message when the login fails', async () => {
    mockLogin.mockImplementation((_variables, { onError }) => onError?.(new Error('Invalid credentials')));
    setPendingDeepLink('/feed/1');
    render(<SignIn />);

    await submitLogin();

    expect(mockLogin).toHaveBeenCalledWith(
      { email: 'user@example.com', password: 'password' },
      expect.anything(),
    );
    expect(screen.getByText(DEEP_LINK_MESSAGE)).toBeOnTheScreen();
    expect(usePendingDeepLink.getState().path).toBe('/feed/1');
  });

  it('shows the link message in the language the user switches to', async () => {
    const translatedMessage = 'Inicia sesión para abrir este enlace.';
    i18n.addResourceBundle('es', 'translation', { auth: { signIn: { deepLinkMessage: translatedMessage } } }, true, true);
    setPendingDeepLink('/feed/1');
    render(<SignIn />);

    await act(async () => {
      await i18n.changeLanguage('es');
    });

    expect(screen.getByText(translatedMessage)).toBeOnTheScreen();

    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });
});
