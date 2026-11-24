import { Stack } from 'expo-router';

import Onboarding from '@/app/onboarding';
import Login from '@/app/sign-in';
import { render } from '@/lib/test-utils';

jest.mock('expo-router', () => ({
  Stack: { Screen: jest.fn(() => null) },
  useRouter: jest.fn(() => ({ replace: jest.fn() })),
}));

jest.mock('@/components/ui', () => ({
  ...jest.requireActual('@/components/ui'),
  FocusAwareStatusBar: () => null,
}));

jest.mock('@/components/cover', () => ({ Cover: () => null }));
jest.mock('@/components/login-form', () => ({ LoginForm: () => null }));

jest.mock('@/lib/hooks', () => ({
  useIsFirstTime: jest.fn(() => [true, jest.fn()]),
}));

jest.mock('@/api/auth/use-login', () => ({
  useLogin: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
}));

const mockStackScreen = Stack.Screen as unknown as jest.Mock;

const optionsOf = (mock: jest.Mock) => mock.mock.calls[0][0].options;

describe('screen options declared by each screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hides the header on onboarding', () => {
    render(<Onboarding />);

    expect(optionsOf(mockStackScreen)).toEqual({ headerShown: false });
  });

  it('hides the header on sign in', () => {
    render(<Login />);

    expect(optionsOf(mockStackScreen)).toEqual({ headerShown: false });
  });
});
