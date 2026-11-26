import type { ReactElement, ReactNode } from 'react';
import { Stack } from 'expo-router';
import { Children, isValidElement } from 'react';

import RootLayout from '@/app/_layout';
import { useAuth } from '@/components/providers/auth';
import { clearPendingDeepLink, setPendingDeepLink, usePendingDeepLink } from '@/lib/auth/pending-deep-link';
import { useIsFirstTime } from '@/lib/hooks/use-is-first-time';
import { act, cleanup, render, screen } from '@/lib/test-utils';

type ProtectedProps = { guard: boolean; redirectTo?: string; children?: ReactNode };

let mockSegments: Array<string> = [];

jest.mock('../../global.css', () => ({}));

jest.mock('@dev-plugins/react-query', () => ({
  useReactQueryDevTools: jest.fn(),
}));

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: { children: ReactNode }) => children,
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
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
  };
});

jest.mock('@/components/providers/auth', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
  useAuth: jest.fn(),
}));

jest.mock('@/lib/hooks/use-is-first-time', () => ({
  useIsFirstTime: jest.fn(),
}));

const mockProtected = jest.mocked(Stack.Protected);
const mockUseAuth = jest.mocked(useAuth);
const mockUseIsFirstTime = jest.mocked(useIsFirstTime);

function setAuthenticated(isAuthenticated: boolean) {
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
  });

  it('sends the user to the pending link after login and forgets it once they land there', () => {
    setPendingDeepLink('/feed/1');
    render(<RootLayout />);

    setAuthenticated(true);
    rerenderAt(['sign-in']);

    expect(guardFor('sign-in')).toMatchObject({ guard: false, redirectTo: '/feed/1' });
    expect(pendingDeepLink()).toBe('/feed/1');

    rerenderAt(['feed', '[id]']);

    expect(pendingDeepLink()).toBeNull();
    expect(guardFor('sign-in').redirectTo).toBe('/');
  });

  it('sends a second login to home once the link was used', () => {
    setPendingDeepLink('/feed/1');
    render(<RootLayout />);
    setAuthenticated(true);
    rerenderAt(['feed', '[id]']);

    setAuthenticated(false);
    rerenderAt(['sign-in']);
    setAuthenticated(true);
    rerenderAt(['sign-in']);

    expect(guardFor('sign-in').redirectTo).toBe('/');
  });

  it('sends a login without a pending link to home', () => {
    render(<RootLayout />);

    setAuthenticated(true);
    rerenderAt(['sign-in']);

    expect(guardFor('sign-in').redirectTo).toBe('/');
  });

  it('drops a link that arrives while logged in so it cannot hijack a later login', () => {
    setAuthenticated(true);
    mockSegments = ['(app)'];
    render(<RootLayout />);

    act(() => setPendingDeepLink('/feed/3'));

    expect(pendingDeepLink()).toBeNull();

    setAuthenticated(false);
    rerenderAt(['sign-in']);
    setAuthenticated(true);
    rerenderAt(['sign-in']);

    expect(guardFor('sign-in').redirectTo).toBe('/');
  });

  it.each(['/../sign-in', '/(app)/../forgot-password', '/(app)/%2e%2e/sign-in', '/sign%2Din', '/%73ign-up'])(
    'sends the logged-in user home instead of back to the auth screen %s resolves to',
    (pendingPath) => {
      setPendingDeepLink(pendingPath);
      mockSegments = ['sign-in'];
      render(<RootLayout />);

      setAuthenticated(true);
      rerenderAt(['sign-in']);

      expect(guardFor('sign-in').redirectTo).toBe('/');
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

    rerenderAt(['sign-in']);
    setAuthenticated(true);
    rerenderAt(['sign-in']);

    expect(guardFor('sign-in').redirectTo).toBe('/feed/1');
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
  ])('drops a link that opened %s while logged out so a later login goes home', (_route, segments) => {
    setPendingDeepLink('/feed');
    mockSegments = segments;
    render(<RootLayout />);

    expect(pendingDeepLink()).toBeNull();

    rerenderAt(['sign-in']);
    setAuthenticated(true);
    rerenderAt(['sign-in']);

    expect(guardFor('sign-in').redirectTo).toBe('/');
  });
});
