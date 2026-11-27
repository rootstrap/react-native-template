import { act, renderHook } from '@testing-library/react-native';
import dayjs from 'dayjs';

import { redirectSystemPath } from '@/app/+native-intent';
import { AuthProvider, clearTokens, storeTokens, useAuth } from '@/components/providers/auth';
import { clearPendingDeepLink, setPendingDeepLink, usePendingDeepLink } from '@/lib/auth/pending-deep-link';
import { storage } from '@/lib/storage';

jest.mock('@/api', () => ({
  client: {
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  },
}));

const pendingDeepLink = () => usePendingDeepLink.getState().path;

function logIn(expiration = dayjs().add(1, 'hour').toISOString()) {
  storeTokens({
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    userId: 'user-id',
    expiration,
  });
}

function completeOnboarding() {
  storage.set('IS_FIRST_TIME', false);
}

describe('redirectSystemPath', () => {
  beforeEach(() => {
    clearTokens();
    clearPendingDeepLink();
    completeOnboarding();
  });

  afterAll(() => {
    clearTokens();
  });

  describe('logged out', () => {
    it.each([true, false])('sends a protected link to sign-in and remembers it (initial: %s)', (initial) => {
      expect(redirectSystemPath({ path: 'RootstrapApp://feed/add-post', initial })).toBe('/sign-in');
      expect(pendingDeepLink()).toBe('/feed/add-post');
    });

    it('keeps the query string of the remembered link', () => {
      expect(redirectSystemPath({ path: 'RootstrapApp.staging://feed/1?ref=email', initial: false })).toBe('/sign-in');
      expect(pendingDeepLink()).toBe('/feed/1?ref=email');
    });

    it('treats an expired session as logged out', () => {
      logIn(dayjs().subtract(1, 'minute').toISOString());

      expect(redirectSystemPath({ path: 'RootstrapApp://feed/add-post', initial: false })).toBe('/sign-in');
      expect(pendingDeepLink()).toBe('/feed/add-post');
    });

    it('logs the running app out when the link finds the session expired', () => {
      logIn();
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
      expect(result.current.isAuthenticated).toBe(true);

      logIn(dayjs().subtract(1, 'minute').toISOString());
      act(() => {
        redirectSystemPath({ path: 'RootstrapApp://feed/add-post', initial: false });
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(pendingDeepLink()).toBe('/feed/add-post');
    });

    it('sends a protected link to onboarding on first launch and forgets it', () => {
      storage.remove('IS_FIRST_TIME');
      setPendingDeepLink('/feed/1');

      expect(redirectSystemPath({ path: 'RootstrapApp://feed/add-post', initial: true })).toBe('/onboarding');
      expect(pendingDeepLink()).toBeNull();
    });
  });

  describe('logged in', () => {
    it('opens a protected link unchanged without remembering it', () => {
      logIn();
      setPendingDeepLink('/feed/1');
      const path = 'RootstrapApp://feed/add-post';

      expect(redirectSystemPath({ path, initial: false })).toBe(path);
      expect(pendingDeepLink()).toBeNull();
    });
  });

  it('opens a public link unchanged without remembering it', () => {
    const path = 'RootstrapApp.staging://forgot-password';

    expect(redirectSystemPath({ path, initial: true })).toBe(path);
    expect(pendingDeepLink()).toBeNull();
  });

  it('replaces an older pending link when a public link arrives', () => {
    setPendingDeepLink('/feed/1');

    expect(redirectSystemPath({ path: 'RootstrapApp.staging://sign-up', initial: false })).toBe('RootstrapApp.staging://sign-up');
    expect(pendingDeepLink()).toBeNull();
  });

  it.each(['RootstrapApp://does-not-exist', 'RootstrapApp://feed', 'RootstrapApp://Sign-In'])(
    'opens %s, which is not a protected screen, unchanged without remembering it',
    (path) => {
      setPendingDeepLink('/feed/1');

      expect(redirectSystemPath({ path, initial: true })).toBe(path);
      expect(pendingDeepLink()).toBeNull();
    },
  );

  it('opens a plain app launch unchanged without remembering it', () => {
    const path = 'RootstrapApp.staging://';

    expect(redirectSystemPath({ path, initial: true })).toBe(path);
    expect(pendingDeepLink()).toBeNull();
  });

  it('returns malformed input unchanged and forgets an older pending link', () => {
    setPendingDeepLink('/feed/1');
    const path = null as unknown as string;

    expect(() => redirectSystemPath({ path, initial: true })).not.toThrow();
    expect(redirectSystemPath({ path, initial: true })).toBeNull();
    expect(pendingDeepLink()).toBeNull();
  });

  it.each([
    'RootstrapApp.staging://x/../sign-in',
    'RootstrapApp.staging:///%2e%2e/forgot-password',
  ])('opens %s unchanged because it resolves to an auth screen', (path) => {
    setPendingDeepLink('/feed/1');

    expect(redirectSystemPath({ path, initial: false })).toBe(path);
    expect(pendingDeepLink()).toBeNull();
  });

  it.each([
    'RootstrapApp.staging:////example.com/x',
    'https://example.com//example.com/x',
    'RootstrapApp.staging:///\\example.com/x',
  ])('does not remember the external target in %s', (path) => {
    setPendingDeepLink('/feed/1');

    expect(redirectSystemPath({ path, initial: true })).toBe(path);
    expect(pendingDeepLink()).toBeNull();
  });
});
