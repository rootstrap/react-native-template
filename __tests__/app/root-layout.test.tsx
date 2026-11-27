import type { ReactElement, ReactNode } from 'react';
import { Stack } from 'expo-router';
import { hideAsync } from 'expo-splash-screen';
import { Children, isValidElement } from 'react';

import RootLayout from '@/app/_layout';
import { hasValidSession, useAuth } from '@/components/providers/auth';
import { clearPendingDeepLink, setPendingDeepLink, usePendingDeepLink } from '@/lib/auth/pending-deep-link';
import { useIsFirstTime } from '@/lib/hooks/use-is-first-time';
import { act, cleanup, render, screen } from '@/lib/test-utils';

type ProtectedProps = { guard: boolean; redirectTo?: string; children?: ReactNode };

let mockSegments: Array<string> = [];
const mockPush = jest.fn();

jest.mock('../../global.css', () => ({}));

jest.mock('@dev-plugins/react-query', () => ({
  useReactQueryDevTools: jest.fn(),
}));

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: { children: ReactNode }) => children,
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
  setOptions: jest.fn(),
}));

jest.mock('expo-router', () => {
  const MockStack = ({ children }: { children: ReactNode }) => children;
  MockStack.Protected = jest.fn(({ children }: { children: ReactNode }) => children);
  MockStack.Screen = jest.fn(() => null);
  return {
    ...jest.requireActual<object>('expo-router'),
    Stack: MockStack,
    ThemeProvider: ({ children }: { children: ReactNode }) => children,
    useSegments: () => mockSegments,
    useRouter: () => ({ push: mockPush }),
  };
});

jest.mock('@/components/providers/auth', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
  hasValidSession: jest.fn(),
  useAuth: jest.fn(),
}));

jest.mock('@/lib/hooks/use-is-first-time', () => ({
  useIsFirstTime: jest.fn(),
}));

const mockProtected = jest.mocked(Stack.Protected);
const mockHideSplash = jest.mocked(hideAsync);
const mockUseAuth = jest.mocked(useAuth);
const mockUseIsFirstTime = jest.mocked(useIsFirstTime);
const mockHasValidSession = jest.mocked(hasValidSession);

function setAuthenticated(isAuthenticated: boolean, hasStoredSession = isAuthenticated) {
  mockHasValidSession.mockReturnValue(hasStoredSession);
  mockUseAuth.mockReturnValue({
    token: isAuthenticated ? 'token' : null,
    isAuthenticated,
    loading: false,
    ready: true,
    logout: jest.fn(),
  });
}

type ScreenProps = { name: string; options?: object };

function declaredScreens(children: ReactNode): Array<ScreenProps> {
  return Children.toArray(children)
    .filter((child): child is ReactElement<ScreenProps> => isValidElement(child))
    .map(({ props: { name, options } }) => ({ name, options }));
}

function screenNames(children: ReactNode) {
  return declaredScreens(children).map(({ name }) => name);
}

function guardFor(screenName: string): ProtectedProps {
  const call = mockProtected.mock.calls.findLast(([props]) =>
    screenNames(props.children).includes(screenName),
  );
  if (call === undefined) {
    throw new Error(`No Stack.Protected declares ${screenName}`);
  }
  const { guard, redirectTo, children } = call[0];
  return { guard, redirectTo: typeof redirectTo === 'string' ? redirectTo : undefined, children };
}

function pendingDeepLink() {
  return usePendingDeepLink.getState().path;
}

function rerenderAt(segments: Array<string>) {
  mockSegments = segments;
  screen.rerender(<RootLayout />);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSegments = ['sign-in'];
  setAuthenticated(false);
  mockUseIsFirstTime.mockReturnValue([false, jest.fn()]);
  clearPendingDeepLink();
});

afterEach(cleanup);

describe('RootLayout guards', () => {
  it.each(['feed/[id]', 'feed/add-post', '(app)', 'update-password'])(
    'keeps %s behind the sign-in guard while logged out',
    (screenName) => {
      render(<RootLayout />);

      expect(guardFor(screenName)).toMatchObject({ guard: false, redirectTo: '/sign-in' });
    },
  );

  it('opens the feed screens for a logged-in user', () => {
    setAuthenticated(true);
    mockSegments = ['(app)'];
    render(<RootLayout />);

    expect(guardFor('feed/[id]').guard).toBe(true);
    expect(guardFor('feed/add-post').guard).toBe(true);
  });

  it('keeps a pending link while the user is logged out on sign-in', () => {
    setPendingDeepLink('/feed/1');
    render(<RootLayout />);

    expect(guardFor('feed/[id]').redirectTo).toBe('/sign-in');
    expect(pendingDeepLink()).toBe('/feed/1');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('sends the user home after login and opens the pending link on top of the tabs', () => {
    setPendingDeepLink('/feed/1');
    render(<RootLayout />);

    setAuthenticated(true);
    rerenderAt(['sign-in']);

    expect(guardFor('sign-in')).toMatchObject({ guard: false, redirectTo: '/' });
    expect(mockPush).not.toHaveBeenCalled();
    expect(pendingDeepLink()).toBe('/feed/1');

    rerenderAt(['(app)']);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/feed/1');
    expect(pendingDeepLink()).toBeNull();
  });

  it('opens the pending link after signing up instead of signing in', () => {
    setPendingDeepLink('/feed/add-post');
    mockSegments = ['sign-up'];
    render(<RootLayout />);

    setAuthenticated(true);
    rerenderAt(['(app)']);

    expect(mockPush).toHaveBeenCalledWith('/feed/add-post');
  });

  it('opens nothing on a second login once the link was used', () => {
    setPendingDeepLink('/feed/1');
    render(<RootLayout />);
    setAuthenticated(true);
    rerenderAt(['(app)']);
    mockPush.mockClear();

    setAuthenticated(false);
    rerenderAt(['sign-in']);
    setAuthenticated(true);
    rerenderAt(['(app)']);

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('keeps the link without opening it while the stored session has expired but auth state has not caught up', () => {
    setAuthenticated(true, false);
    mockSegments = ['(app)'];
    render(<RootLayout />);

    act(() => setPendingDeepLink('/feed/3'));

    expect(mockPush).not.toHaveBeenCalled();
    expect(pendingDeepLink()).toBe('/feed/3');

    setAuthenticated(false);
    rerenderAt(['sign-in']);
    setAuthenticated(true);
    rerenderAt(['(app)']);

    expect(mockPush).toHaveBeenCalledWith('/feed/3');
  });

  it.each(['/../sign-in', '/(app)/../forgot-password', '/(app)/%2e%2e/sign-in', '/sign%2Din', '/%73ign-up', '/does-not-exist'])(
    'drops the pending link %s after login instead of opening it',
    (pendingPath) => {
      setPendingDeepLink(pendingPath);
      render(<RootLayout />);

      setAuthenticated(true);
      rerenderAt(['(app)']);

      expect(mockPush).not.toHaveBeenCalled();
      expect(pendingDeepLink()).toBeNull();
    },
  );

  it('shows onboarding first and discards the pending link', () => {
    mockUseIsFirstTime.mockReturnValue([true, jest.fn()]);
    setPendingDeepLink('/feed/1');
    render(<RootLayout />);

    expect(guardFor('feed/[id]').redirectTo).toBe('/onboarding');
    expect(pendingDeepLink()).toBeNull();
  });

  it.each([
    ['the authenticated guard', 'feed/[id]', [
      { name: '(app)', options: { headerShown: false } },
      { name: 'update-password' },
      { name: 'feed/[id]' },
      { name: 'feed/add-post' },
    ]],
    ['the logged-out guard', 'sign-in', [
      { name: 'sign-in', options: { headerShown: false } },
      { name: 'sign-up' },
      { name: 'forgot-password' },
    ]],
  ])('declares exactly these screens under %s', (_guard, screenName, expected) => {
    render(<RootLayout />);

    expect(declaredScreens(guardFor(screenName).children)).toEqual(expected);
  });

  it('keeps the pending link while the guard is still redirecting the deep-linked screen to sign-in', () => {
    setPendingDeepLink('/feed/1');
    mockSegments = ['feed', '[id]'];
    render(<RootLayout />);

    expect(pendingDeepLink()).toBe('/feed/1');
  });

  it('keeps the pending link before the first route is known on a cold start', () => {
    setPendingDeepLink('/feed/1');
    mockSegments = [];
    render(<RootLayout />);

    expect(pendingDeepLink()).toBe('/feed/1');
  });

  it.each([
    ['an unknown route', ['[...messing]']],
    ['the web view', ['www']],
  ])('drops the pending link when the logged-out user leaves sign-in for %s', (_route, segments) => {
    setPendingDeepLink('/feed/1');
    render(<RootLayout />);

    rerenderAt(segments);

    expect(pendingDeepLink()).toBeNull();

    setAuthenticated(true);
    rerenderAt(['(app)']);

    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe('RootLayout while auth is hydrating', () => {
  it('renders no screens and keeps the splash until auth is ready', () => {
    mockUseAuth.mockReturnValue({
      token: null,
      isAuthenticated: false,
      loading: true,
      ready: false,
      logout: jest.fn(),
    });

    render(<RootLayout />);

    expect(mockProtected).not.toHaveBeenCalled();
    expect(Stack.Screen).not.toHaveBeenCalled();
    expect(mockHideSplash).not.toHaveBeenCalled();
  });

  it('renders the guarded screens and hides the splash once auth is ready', () => {
    render(<RootLayout />);

    expect(guardFor('feed/add-post')).toMatchObject({ guard: false });
    expect(mockHideSplash).toHaveBeenCalledTimes(1);
  });
});
