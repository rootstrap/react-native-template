import { getFallbackRoute } from '../../../src/lib/auth/get-fallback-route';

describe('getFallbackRoute', () => {
  it.each([
    { isFirstTime: true, isAuthenticated: false, expected: '/onboarding' },
    { isFirstTime: true, isAuthenticated: true, expected: '/onboarding' },
    { isFirstTime: false, isAuthenticated: false, expected: '/sign-in' },
    { isFirstTime: false, isAuthenticated: true, expected: '/' },
  ])(
    'returns $expected when isFirstTime=$isFirstTime and isAuthenticated=$isAuthenticated',
    ({ isFirstTime, isAuthenticated, expected }) => {
      expect(getFallbackRoute({ isFirstTime, isAuthenticated })).toBe(expected);
    },
  );

  it.each([
    { isFirstTime: true, isAuthenticated: true, expected: '/onboarding' },
    { isFirstTime: true, isAuthenticated: false, expected: '/onboarding' },
    { isFirstTime: false, isAuthenticated: false, expected: '/sign-in' },
    { isFirstTime: false, isAuthenticated: true, expected: '/feed/1' },
  ])(
    'returns $expected with a pending link when isFirstTime=$isFirstTime and isAuthenticated=$isAuthenticated',
    ({ isFirstTime, isAuthenticated, expected }) => {
      expect(getFallbackRoute({ isFirstTime, isAuthenticated, pendingDeepLink: '/feed/1' })).toBe(expected);
    },
  );

  it('returns home for a logged-in user once the pending link is gone', () => {
    expect(getFallbackRoute({ isFirstTime: false, isAuthenticated: true, pendingDeepLink: null })).toBe('/');
  });

  it.each(['/sign-in', '/../sign-in', '/./sign-in', '/(app)/../forgot-password', '/%2e%2e/sign-in', '/..'])(
    'sends a logged-in user home instead of to the auth or empty pending link %s',
    (pendingDeepLink) => {
      expect(getFallbackRoute({ isFirstTime: false, isAuthenticated: true, pendingDeepLink })).toBe('/');
    },
  );

  it.each(['//example.com/x', '/\\example.com/x', 'https://example.com/x', 'feed/1'])(
    'sends a logged-in user home instead of to the unsafe pending link %s',
    (pendingDeepLink) => {
      expect(getFallbackRoute({ isFirstTime: false, isAuthenticated: true, pendingDeepLink })).toBe('/');
    },
  );
});
